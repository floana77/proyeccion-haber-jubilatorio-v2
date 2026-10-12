import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { MOCK_RUTAS } from '../mocks/mock-rutas';
import { crearMockInterceptor } from '../mocks/mock.interceptor';
import { Afiliado, FechasMinimas } from './afiliado.model';
import { AfiliadoService } from './afiliado.service';

describe('AfiliadoService', () => {
  let servicio: AfiliadoService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(AfiliadoService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('obtiene los datos del afiliado con GET /afiliado', () => {
    const afiliado: Afiliado = {
      legajo: '100234', nombre: 'María', apellido: 'González', matricula: '45123', estadoMatricula: 'activa'
    };
    let respuesta: Afiliado | undefined;

    servicio.obtenerAfiliado().subscribe(a => (respuesta = a));

    const req = backend.expectOne(`${environment.apiUrl}/afiliado`);
    expect(req.request.method).toBe('GET');
    req.flush(afiliado);
    expect(respuesta).toEqual(afiliado);
  });

  it('obtiene las fechas mínimas con GET /afiliado/fechas-minimas', () => {
    const fechas: FechasMinimas = { legajo: '100234', ordinaria: '2031-05-10', parcial: '2028-05-10' };
    let respuesta: FechasMinimas | undefined;

    servicio.obtenerFechasMinimas().subscribe(f => (respuesta = f));

    const req = backend.expectOne(`${environment.apiUrl}/afiliado/fechas-minimas`);
    expect(req.request.method).toBe('GET');
    req.flush(fechas);
    expect(respuesta).toEqual(fechas);
  });
});

describe('AfiliadoService con el interceptor de mocks', () => {
  function configurar(escenario: string): AfiliadoService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([crearMockInterceptor(MOCK_RUTAS, () => escenario)]))]
    });
    return TestBed.inject(AfiliadoService);
  }

  it('recibe el afiliado del escenario con su legajo', fakeAsync(() => {
    let afiliado: Afiliado | undefined;

    configurar('fallecido').obtenerAfiliado().subscribe(a => (afiliado = a));
    tick(300);

    expect(afiliado?.legajo).toBe('100234');
    expect(afiliado?.estadoMatricula).toBe('fallecido');
  }));

  it('recibe las fechas mínimas del escenario con su legajo', fakeAsync(() => {
    let fechas: FechasMinimas | undefined;

    configurar('en-condiciones-hoy').obtenerFechasMinimas().subscribe(f => (fechas = f));
    tick(300);

    expect(fechas?.legajo).toBe('100234');
    expect(fechas?.parcial).toBe(fechas?.ordinaria);
  }));
});
