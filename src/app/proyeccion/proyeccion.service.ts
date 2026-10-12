import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

import { environment } from '../../environments/environment';
import { SeleccionBeneficio, TipoBeneficio } from './seleccion-beneficio';

/** RF-10: si el servicio no responde en este tiempo se muestra el error. (10 s: valor propuesto en el PRD, a validar) */
export const TIEMPO_MAXIMO_PROYECCION_MS = 10_000;

/** Datos que se envían al servicio de proyección (POST /proyeccion). */
export interface SolicitudProyeccion {
  /** Legajo profesional: número de identificación del afiliado. */
  legajo: string;
  tipoBeneficio: TipoBeneficio;
  /** Fecha de jubilación elegida, en formato AAAA-MM-DD. */
  fechaJubilacion: string;
}

/** Pide al servicio backend actual el reporte de la proyección en PDF (RF-06). */
@Injectable({ providedIn: 'root' })
export class ProyeccionService {
  private readonly http = inject(HttpClient);

  proyectar(legajo: string, seleccion: SeleccionBeneficio): Observable<Blob> {
    const solicitud: SolicitudProyeccion = {
      legajo,
      tipoBeneficio: seleccion.tipoBeneficio,
      fechaJubilacion: seleccion.fecha
    };
    return this.http
      .post(`${environment.apiUrl}/proyeccion`, solicitud, { responseType: 'blob' })
      .pipe(timeout(TIEMPO_MAXIMO_PROYECCION_MS));
  }
}
