import { HttpInterceptorFn } from '@angular/common/http';

import { MOCK_RUTAS } from './mock-rutas';
import { Escenario, ESCENARIO_POR_DEFECTO, MockRuta } from './mock.model';

/** Lee el escenario de la URL de la página; si no viene, usa el escenario normal. */
export function escenarioDeLaUrl(): Escenario {
  return new URLSearchParams(window.location.search).get('escenario') ?? ESCENARIO_POR_DEFECTO;
}

/**
 * Crea un interceptor que responde con mocks las solicitudes que coinciden
 * con alguna ruta. Las demás siguen su camino normal.
 */
export function crearMockInterceptor(rutas: MockRuta[], leerEscenario: () => Escenario): HttpInterceptorFn {
  return (req, next) => {
    const ruta = rutas.find(r => r.metodo === req.method && req.url.endsWith(r.ruta));
    return ruta ? ruta.responder(req, leerEscenario()) : next(req);
  };
}

/**
 * Interceptor de mocks de la app. Solo se registra si environment.usarMocks es true.
 * El @__PURE__ permite que el build de producción lo elimine junto con los datos mock.
 */
export const mockInterceptor = /* @__PURE__ */ crearMockInterceptor(MOCK_RUTAS, escenarioDeLaUrl);
