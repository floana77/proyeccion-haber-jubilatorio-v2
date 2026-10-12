import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { AfiliadoService } from '../afiliado/afiliado.service';
import { fechaRelativa } from '../mocks/afiliado.mock';
import { MOCK_RUTAS } from '../mocks/mock-rutas';
import { crearMockInterceptor } from '../mocks/mock.interceptor';
import { ProyeccionComponent } from './proyeccion.component';

/** Lo que tardan las dos llamadas encadenadas del mock (300 ms cada una). */
const DEMORA_CARGA_MS = 600;

/** Fecha de hoy desplazada, en el formato dd/mm/aaaa que se ve en pantalla. */
function fechaEnPantalla(desplazamiento: { anios?: number; dias?: number }): string {
  const [anio, mes, dia] = fechaRelativa(desplazamiento).split('-');
  return `${dia}/${mes}/${anio}`;
}

class Pantalla {
  constructor(private readonly fixture: ComponentFixture<ProyeccionComponent>) {}

  private get raiz(): HTMLElement {
    return this.fixture.nativeElement as HTMLElement;
  }

  existe(testId: string): boolean {
    return this.raiz.querySelector(`[data-testid="${testId}"]`) !== null;
  }

  texto(testId: string): string {
    return this.raiz.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim() ?? '';
  }

  boton(testId: string): HTMLButtonElement {
    return this.raiz.querySelector(`[data-testid="${testId}"] button`) as HTMLButtonElement;
  }
}

describe('ProyeccionComponent con el interceptor de mocks', () => {
  let servicio: AfiliadoService;

  function ingresar(escenario: string): Pantalla {
    TestBed.configureTestingModule({
      imports: [ProyeccionComponent],
      providers: [provideHttpClient(withInterceptors([crearMockInterceptor(MOCK_RUTAS, () => escenario)]))]
    });
    servicio = TestBed.inject(AfiliadoService);
    spyOn(servicio, 'obtenerFechasMinimas').and.callThrough();

    const fixture = TestBed.createComponent(ProyeccionComponent);
    fixture.detectChanges();
    tick(DEMORA_CARGA_MS);
    fixture.detectChanges();
    return new Pantalla(fixture);
  }

  it('AC-01: muestra las fechas mínimas de cada beneficio', fakeAsync(() => {
    const pantalla = ingresar('normal');

    expect(pantalla.texto('fecha-ordinaria')).toBe(fechaEnPantalla({ anios: 5 }));
    expect(pantalla.texto('fecha-parcial')).toBe(fechaEnPantalla({ anios: 1 }));
  }));

  it('AC-02: con las dos fechas hoy muestra la alerta y el trámite, y deshabilita Proyectar', fakeAsync(() => {
    const pantalla = ingresar('en-condiciones-hoy');

    expect(pantalla.texto('alerta-en-condiciones')).toContain('Ud. se encuentra en condiciones de jubilarse');
    expect(pantalla.texto('iniciar-tramite')).toContain('Inicie su trámite de jubilación aquí');
    expect(pantalla.boton('proyectar').disabled).toBeTrue();
  }));

  it('AC-04: con Parcial hoy y Ordinaria mañana muestra el trámite sin la alerta', fakeAsync(() => {
    const pantalla = ingresar('parcial-hoy');

    expect(pantalla.existe('iniciar-tramite')).toBeTrue();
    expect(pantalla.existe('alerta-en-condiciones')).toBeFalse();
    expect(pantalla.boton('proyectar').disabled).toBeFalse();
  }));

  it('AC-05: con las dos fechas mañana no muestra el trámite ni la alerta', fakeAsync(() => {
    const pantalla = ingresar('ambas-manana');

    expect(pantalla.existe('iniciar-tramite')).toBeFalse();
    expect(pantalla.existe('alerta-en-condiciones')).toBeFalse();
    expect(pantalla.boton('proyectar').disabled).toBeFalse();
  }));

  it('AC-13: el fallecido solo ve su alerta y no se piden las fechas', fakeAsync(() => {
    const pantalla = ingresar('fallecido');

    expect(pantalla.texto('alerta-fallecido')).toContain(
      'No es posible realizar proyección para afiliados con estado matricular fallecido'
    );
    expect(pantalla.boton('proyectar').disabled).toBeTrue();
    expect(pantalla.existe('alerta-en-condiciones')).toBeFalse();
    expect(pantalla.existe('iniciar-tramite')).toBeFalse();
    expect(pantalla.existe('beneficio-ordinaria')).toBeFalse();
    expect(servicio.obtenerFechasMinimas).not.toHaveBeenCalled();
  }));

  for (const [escenario, chip] of [
    ['normal', 'ACTIVO'],
    ['cancelado', 'CANCELADO'],
    ['suspendido', 'SUSPENDIDO'],
    ['fallecido', 'FALLECIDO']
  ]) {
    it(`muestra el chip ${chip} según el estado de la matrícula`, fakeAsync(() => {
      expect(ingresar(escenario).texto('chip-estado')).toBe(chip);
    }));
  }

  for (const escenario of ['normal', 'cancelado', 'suspendido']) {
    it(`AC-14: con estado ${escenario} no muestra la alerta de fallecido y habilita Proyectar`, fakeAsync(() => {
      const pantalla = ingresar(escenario);

      expect(pantalla.existe('alerta-fallecido')).toBeFalse();
      expect(pantalla.boton('proyectar').disabled).toBeFalse();
    }));
  }
});

describe('ProyeccionComponent cuando falla la carga', () => {
  it('muestra el error y vuelve a pedir los datos al reintentar', () => {
    TestBed.configureTestingModule({
      imports: [ProyeccionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const backend = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProyeccionComponent);
    const pantalla = new Pantalla(fixture);

    fixture.detectChanges();
    backend.expectOne(`${environment.apiUrl}/afiliado`).flush(null, { status: 500, statusText: 'Error' });
    fixture.detectChanges();

    expect(pantalla.texto('error-carga')).toContain('No pudimos cargar tus datos');

    pantalla.boton('reintentar').click();
    backend.expectOne(`${environment.apiUrl}/afiliado`);
    backend.verify();
  });
});
