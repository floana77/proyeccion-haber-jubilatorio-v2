import { HttpClient, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { crearMockInterceptor } from './mock.interceptor';
import { MockRuta } from './mock.model';

describe('crearMockInterceptor', () => {
  const rutaAfiliado: MockRuta = {
    metodo: 'GET',
    ruta: '/afiliado',
    responder: (_req, escenario) => of(new HttpResponse({ status: 200, body: { escenario } }))
  };

  function configurar(escenario: string) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([crearMockInterceptor([rutaAfiliado], () => escenario)])),
        provideHttpClientTesting()
      ]
    });
    return {
      http: TestBed.inject(HttpClient),
      backend: TestBed.inject(HttpTestingController)
    };
  }

  it('responde con el mock y el escenario elegido cuando la ruta coincide', () => {
    const { http, backend } = configurar('fallecido');
    let respuesta: unknown;

    http.get('/api/afiliado').subscribe(r => (respuesta = r));

    expect(respuesta).toEqual({ escenario: 'fallecido' });
    backend.verify();
  });

  it('deja pasar al backend las solicitudes sin mock', () => {
    const { http, backend } = configurar('normal');

    http.get('/api/otra-cosa').subscribe();

    backend.expectOne('/api/otra-cosa').flush({});
    backend.verify();
  });

  it('no responde con el mock si el método no coincide', () => {
    const { http, backend } = configurar('normal');

    http.post('/api/afiliado', {}).subscribe();

    backend.expectOne('/api/afiliado').flush({});
    backend.verify();
  });
});
