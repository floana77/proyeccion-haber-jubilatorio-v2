import { HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

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
