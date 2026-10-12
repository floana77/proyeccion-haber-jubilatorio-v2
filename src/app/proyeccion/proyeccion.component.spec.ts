import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Calendar } from 'primeng/calendar';

import { environment } from '../../environments/environment';
import { AfiliadoService } from '../afiliado/afiliado.service';
import { fechaRelativa } from '../mocks/afiliado.mock';
import { MOCK_RUTAS } from '../mocks/mock-rutas';
import { crearMockInterceptor } from '../mocks/mock.interceptor';
import { DEMORA_LENTA_MS, DEMORA_PROYECCION_MS } from '../mocks/proyeccion.mock';
import { ProyeccionComponent } from './proyeccion.component';
import { ProyeccionService, TIEMPO_MAXIMO_PROYECCION_MS } from './proyeccion.service';
import { PestanaPdf, VisorPdfService } from './visor-pdf.service';

/** Lo que tardan las dos llamadas encadenadas del mock (300 ms cada una). */
const DEMORA_CARGA_MS = 600;

/** Fecha de hoy desplazada, en el formato dd/mm/aaaa que se ve en pantalla. */
function fechaEnPantalla(desplazamiento: { anios?: number; dias?: number }): string {
  const [anio, mes, dia] = fechaRelativa(desplazamiento).split('-');
  return `${dia}/${mes}/${anio}`;
}

/** Desplazamiento respecto de hoy, como Date a las 00:00. */
function fechaDesde(desplazamiento: { anios?: number; dias?: number }): Date {
  const [anio, mes, dia] = fechaRelativa(desplazamiento).split('-').map(Number);
  return new Date(anio, mes - 1, dia);
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

  /** Input de la opción de beneficio: 'beneficio-ordinaria' o 'beneficio-parcial'. */
  opcion(id: string): HTMLInputElement {
    return this.raiz.querySelector(`input#${id}`) as HTMLInputElement;
  }

  get inputFecha(): HTMLInputElement {
    return this.raiz.querySelector('input#fecha-proyeccion') as HTMLInputElement;
  }

  get calendario(): Calendar {
    return this.fixture.debugElement.query(By.directive(Calendar)).componentInstance as Calendar;
  }

  elegirOpcion(id: string): void {
    this.opcion(id).click();
    this.actualizar();
  }

  /** Simula elegir un día en el calendario abierto. */
  elegirFecha(fecha: Date): void {
    this.calendario.updateModel(fecha);
    this.actualizar();
  }

  /** ngModel escribe en los campos en una microtarea: hay que esperarla (dentro de fakeAsync). */
  actualizar(): void {
    this.fixture.detectChanges();
    tick();
    this.fixture.detectChanges();
  }
}

describe('ProyeccionComponent con el interceptor de mocks', () => {
  let servicio: AfiliadoService;
  let proyeccionService: ProyeccionService;
  let pestana: jasmine.SpyObj<PestanaPdf>;
  let visorPdf: jasmine.SpyObj<VisorPdfService>;

  function ingresar(escenario: string): Pantalla {
    pestana = jasmine.createSpyObj<PestanaPdf>('pestana', ['mostrar', 'cerrar']);
    visorPdf = jasmine.createSpyObj<VisorPdfService>('visorPdf', { abrirEnEspera: pestana });
    TestBed.configureTestingModule({
      imports: [ProyeccionComponent],
      providers: [
        provideHttpClient(withInterceptors([crearMockInterceptor(MOCK_RUTAS, () => escenario)])),
        { provide: VisorPdfService, useValue: visorPdf }
      ]
    });
    servicio = TestBed.inject(AfiliadoService);
    spyOn(servicio, 'obtenerFechasMinimas').and.callThrough();
    proyeccionService = TestBed.inject(ProyeccionService);
    spyOn(proyeccionService, 'proyectar').and.callThrough();

    const fixture = TestBed.createComponent(ProyeccionComponent);
    fixture.detectChanges();
    tick(DEMORA_CARGA_MS);
    const pantalla = new Pantalla(fixture);
    pantalla.actualizar();
    return pantalla;
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

  describe('selector de beneficio y calendario', () => {
    it('AC-06: con Parcial antes que Ordinaria preselecciona Parcial con su fecha', fakeAsync(() => {
      const pantalla = ingresar('normal');

      expect(pantalla.opcion('beneficio-parcial').checked).toBeTrue();
      expect(pantalla.opcion('beneficio-ordinaria').checked).toBeFalse();
      expect(pantalla.inputFecha.value).toBe(fechaEnPantalla({ anios: 1 }));
    }));

    it('AC-07: con las dos fechas iguales preselecciona Ordinaria', fakeAsync(() => {
      const pantalla = ingresar('fechas-iguales');

      expect(pantalla.opcion('beneficio-ordinaria').checked).toBeTrue();
      expect(pantalla.inputFecha.value).toBe(fechaEnPantalla({ anios: 5 }));
    }));

    it('AC-08: con Parcial anterior a hoy preselecciona Parcial con esa fecha', fakeAsync(() => {
      const pantalla = ingresar('parcial-vencida');

      expect(pantalla.opcion('beneficio-parcial').checked).toBeTrue();
      expect(pantalla.inputFecha.value).toBe(fechaEnPantalla({ anios: -1 }));
    }));

    it('AC-09: al cambiar a Ordinaria, la fecha elegida pasa a ser la mínima de Ordinaria', fakeAsync(() => {
      const pantalla = ingresar('normal');
      pantalla.elegirFecha(fechaDesde({ anios: 2 }));
      expect(pantalla.inputFecha.value).toBe(fechaEnPantalla({ anios: 2 }));

      pantalla.elegirOpcion('beneficio-ordinaria');

      expect(pantalla.opcion('beneficio-ordinaria').checked).toBeTrue();
      expect(pantalla.inputFecha.value).toBe(fechaEnPantalla({ anios: 5 }));
      expect(pantalla.texto('ayuda-fecha')).toContain(fechaEnPantalla({ anios: 5 }));
    }));

    it('AC-10: permite elegir en el calendario la fecha mínima más un año', fakeAsync(() => {
      const pantalla = ingresar('normal');

      pantalla.elegirFecha(fechaDesde({ anios: 2 }));

      expect(pantalla.inputFecha.value).toBe(fechaEnPantalla({ anios: 2 }));
      expect(pantalla.opcion('beneficio-parcial').checked).toBeTrue();
    }));

    it('AC-11: habilita el día de la fecha mínima y deshabilita el anterior', fakeAsync(() => {
      const pantalla = ingresar('normal');
      const minima = fechaDesde({ anios: 1 });
      const anterior = fechaDesde({ anios: 1, dias: -1 });
      const seleccionable = (d: Date) =>
        pantalla.calendario.isSelectable(d.getDate(), d.getMonth(), d.getFullYear(), false);

      expect(seleccionable(minima)).toBeTrue();
      expect(seleccionable(anterior)).toBeFalse();
      expect(pantalla.texto('ayuda-fecha')).toBe(
        `No puede ser anterior al ${fechaEnPantalla({ anios: 1 })} para el beneficio elegido.`
      );
    }));

    it('AC-12: el campo de fecha no se puede escribir', fakeAsync(() => {
      const pantalla = ingresar('normal');

      expect(pantalla.inputFecha.readOnly).toBeTrue();
    }));

    it('en condiciones de jubilarse muestra las opciones y el calendario deshabilitados', fakeAsync(() => {
      const pantalla = ingresar('en-condiciones-hoy');

      expect(pantalla.opcion('beneficio-ordinaria').disabled).toBeTrue();
      expect(pantalla.opcion('beneficio-parcial').disabled).toBeTrue();
      expect(pantalla.inputFecha.disabled).toBeTrue();
    }));

    it('el fallecido no ve el calendario', fakeAsync(() => {
      expect(ingresar('fallecido').existe('fecha-proyeccion')).toBeFalse();
    }));
  });

  describe('botón Proyectar', () => {
    function proyectar(pantalla: Pantalla): void {
      pantalla.boton('proyectar').click();
      pantalla.actualizar();
    }

    it('AC-15: abre el PDF en una pestaña nueva con el legajo, el beneficio y la fecha elegidos', fakeAsync(() => {
      const pantalla = ingresar('normal');
      pantalla.elegirOpcion('beneficio-ordinaria');
      pantalla.elegirFecha(fechaDesde({ anios: 6 }));

      proyectar(pantalla);
      expect(visorPdf.abrirEnEspera).toHaveBeenCalledTimes(1);
      tick(DEMORA_PROYECCION_MS);
      pantalla.actualizar();

      expect(proyeccionService.proyectar).toHaveBeenCalledOnceWith('100234', {
        tipoBeneficio: 'ORDINARIA', fecha: fechaRelativa({ anios: 6 })
      });
      expect(pestana.mostrar).toHaveBeenCalledOnceWith(jasmine.any(Blob));
      expect(pestana.mostrar.calls.mostRecent().args[0].type).toBe('application/pdf');
      expect(pantalla.boton('proyectar').disabled).toBeFalse();
    }));

    it('con los valores propuestos genera el PDF en 1 clic (RNF-02)', fakeAsync(() => {
      const pantalla = ingresar('normal');

      proyectar(pantalla);
      tick(DEMORA_PROYECCION_MS);

      expect(proyeccionService.proyectar).toHaveBeenCalledOnceWith('100234', {
        tipoBeneficio: 'PARCIAL', fecha: fechaRelativa({ anios: 1 })
      });
      expect(pestana.mostrar).toHaveBeenCalledTimes(1);
    }));

    it('AC-17: mientras espera muestra la carga, deshabilita Proyectar y no envía un segundo pedido', fakeAsync(() => {
      const pantalla = ingresar('proyeccion-lenta');

      proyectar(pantalla);
      expect(pantalla.boton('proyectar').disabled).toBeTrue();
      expect(pantalla.boton('proyectar').querySelector('.p-button-loading-icon')).not.toBeNull();

      proyectar(pantalla);
      expect(proyeccionService.proyectar).toHaveBeenCalledTimes(1);
      expect(visorPdf.abrirEnEspera).toHaveBeenCalledTimes(1);

      tick(DEMORA_LENTA_MS);
      pantalla.actualizar();
      expect(pantalla.boton('proyectar').disabled).toBeFalse();
      expect(pestana.mostrar).toHaveBeenCalledTimes(1);
    }));

    it('AC-18: si el servicio da error, muestra el mensaje, cierra la pestaña y habilita Proyectar', fakeAsync(() => {
      const pantalla = ingresar('proyeccion-error');

      proyectar(pantalla);
      tick(DEMORA_PROYECCION_MS);
      pantalla.actualizar();

      expect(pantalla.texto('error-proyeccion')).toContain('No pudimos generar su proyección. Intente nuevamente.');
      expect(pestana.cerrar).toHaveBeenCalled();
      expect(pestana.mostrar).not.toHaveBeenCalled();
      expect(pantalla.boton('proyectar').disabled).toBeFalse();
    }));

    it('AC-19: si el servicio no responde, a los 10 s muestra el mensaje y habilita Proyectar', fakeAsync(() => {
      const pantalla = ingresar('proyeccion-sin-respuesta');

      proyectar(pantalla);
      tick(TIEMPO_MAXIMO_PROYECCION_MS - 1);
      pantalla.actualizar();
      expect(pantalla.existe('error-proyeccion')).toBeFalse();
      expect(pantalla.boton('proyectar').disabled).toBeTrue();

      tick(1);
      pantalla.actualizar();
      expect(pantalla.existe('error-proyeccion')).toBeTrue();
      expect(pestana.cerrar).toHaveBeenCalled();
      expect(pantalla.boton('proyectar').disabled).toBeFalse();
    }));

    it('al reintentar oculta el mensaje de error', fakeAsync(() => {
      const pantalla = ingresar('proyeccion-error');
      proyectar(pantalla);
      tick(DEMORA_PROYECCION_MS);
      pantalla.actualizar();

      proyectar(pantalla);

      expect(pantalla.existe('error-proyeccion')).toBeFalse();
      expect(proyeccionService.proyectar).toHaveBeenCalledTimes(2);
      tick(DEMORA_PROYECCION_MS);
    }));

    it('en condiciones de jubilarse no permite proyectar', fakeAsync(() => {
      const pantalla = ingresar('en-condiciones-hoy');

      proyectar(pantalla);

      expect(visorPdf.abrirEnEspera).not.toHaveBeenCalled();
      expect(proyeccionService.proyectar).not.toHaveBeenCalled();
    }));
  });
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
