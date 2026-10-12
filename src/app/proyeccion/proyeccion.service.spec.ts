import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';

import { environment } from '../../environments/environment';
import { MOCK_RUTAS } from '../mocks/mock-rutas';
import { crearMockInterceptor } from '../mocks/mock.interceptor';
import { DEMORA_LENTA_MS } from '../mocks/proyeccion.mock';
import { ProyeccionService, TIEMPO_MAXIMO_PROYECCION_MS } from './proyeccion.service';
import { SeleccionBeneficio } from './seleccion-beneficio';

const SELECCION: SeleccionBeneficio = { tipoBeneficio: 'PARCIAL', fecha: '2027-10-12' };

describe('ProyeccionService', () => {
  let servicio: ProyeccionService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(ProyeccionService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('envía legajo, beneficio y fecha con POST /proyeccion y recibe el PDF', () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' });
    let respuesta: Blob | undefined;

    servicio.proyectar('100234', SELECCION).subscribe(b => (respuesta = b));

    const req = backend.expectOne(`${environment.apiUrl}/proyeccion`);
    expect(req.request.method).toBe('POST');
    expect(req.request.responseType).toBe('blob');
    expect(req.request.body).toEqual({ legajo: '100234', tipoBeneficio: 'PARCIAL', fechaJubilacion: '2027-10-12' });
    req.flush(pdf);
    expect(respuesta).toBe(pdf);
  });

  it('AC-19: corta con error si el servicio no responde en 10 s', fakeAsync(() => {
    let error: unknown;

    servicio.proyectar('100234', SELECCION).subscribe({ error: e => (error = e) });
    const req = backend.expectOne(`${environment.apiUrl}/proyeccion`);

    tick(TIEMPO_MAXIMO_PROYECCION_MS - 1);
    expect(error).toBeUndefined();
    tick(1);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(req.cancelled).toBeTrue();
  }));
});

describe('ProyeccionService con el interceptor de mocks', () => {
  function configurar(escenario: string): ProyeccionService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([crearMockInterceptor(MOCK_RUTAS, () => escenario)]))]
    });
    return TestBed.inject(ProyeccionService);
  }

  it('recibe un PDF de prueba con el legajo, el beneficio y la fecha elegidos', async () => {
    const servicio = configurar('normal');

    const pdf = await new Promise<Blob>((resolver, rechazar) =>
      servicio.proyectar('100234', SELECCION).subscribe({ next: resolver, error: rechazar })
    );
    const texto = await pdf.text();

    expect(pdf.type).toBe('application/pdf');
    expect(texto.startsWith('%PDF-')).toBeTrue();
    expect(texto).toContain('Legajo: 100234');
    expect(texto).toContain('Beneficio: Jubilaci\\363n Parcial');
    expect(texto).toContain('12/10/2027');
    expect(texto.trimEnd().endsWith('%%EOF')).toBeTrue();
  });

  it('AC-18: el escenario proyeccion-error responde con error 500', fakeAsync(() => {
    const servicio = configurar('proyeccion-error');
    let error: HttpErrorResponse | undefined;

    servicio.proyectar('100234', SELECCION).subscribe({ error: e => (error = e) });
    tick(TIEMPO_MAXIMO_PROYECCION_MS);

    expect(error?.status).toBe(500);
  }));

  it('AC-19: el escenario proyeccion-sin-respuesta termina en el tiempo máximo', fakeAsync(() => {
    const servicio = configurar('proyeccion-sin-respuesta');
    let error: unknown;

    servicio.proyectar('100234', SELECCION).subscribe({ error: e => (error = e) });
    tick(TIEMPO_MAXIMO_PROYECCION_MS);

    expect(error).toBeInstanceOf(TimeoutError);
  }));

  it('AC-17: el escenario proyeccion-lenta responde el PDF recién a los 3 s', fakeAsync(() => {
    const servicio = configurar('proyeccion-lenta');
    let pdf: Blob | undefined;

    servicio.proyectar('100234', SELECCION).subscribe(b => (pdf = b));
    tick(DEMORA_LENTA_MS - 1);
    expect(pdf).toBeUndefined();
    tick(1);
    expect(pdf?.type).toBe('application/pdf');
  }));
});
