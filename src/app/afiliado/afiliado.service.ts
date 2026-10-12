import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Afiliado, FechasMinimas } from './afiliado.model';

/**
 * Consulta los servicios backend actuales del afiliado. El backend identifica
 * al afiliado por la sesión del sitio actual, por eso no se envía el legajo.
 */
@Injectable({ providedIn: 'root' })
export class AfiliadoService {
  private readonly http = inject(HttpClient);

  obtenerAfiliado(): Observable<Afiliado> {
    return this.http.get<Afiliado>(`${environment.apiUrl}/afiliado`);
  }

  obtenerFechasMinimas(): Observable<FechasMinimas> {
    return this.http.get<FechasMinimas>(`${environment.apiUrl}/afiliado/fechas-minimas`);
  }
}
