import { HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MOCK_RUTAS } from './mock-rutas';

/** Escenario de prueba elegido con ?escenario=... en la URL (solo dev y QA). */
export type Escenario = string;

export const ESCENARIO_POR_DEFECTO: Escenario = 'normal';

/** Respuesta simulada para un método y una URL del backend. */
export interface MockRuta {
  metodo: string;
  /** Final de la URL que atiende, por ejemplo '/afiliado'. */
  ruta: string;
  responder(req: HttpRequest<unknown>, escenario: Escenario): Observable<HttpEvent<unknown>>;
}

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

/** Interceptor de mocks de la app. Solo se registra si environment.usarMocks es true. */
export const mockInterceptor = crearMockInterceptor(MOCK_RUTAS, escenarioDeLaUrl);
