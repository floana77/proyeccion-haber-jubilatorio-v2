import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { map, Observable, of, switchMap } from 'rxjs';

import { Afiliado, EstadoMatricula, FechasMinimas } from '../afiliado/afiliado.model';
import { AfiliadoService } from '../afiliado/afiliado.service';
import { ESTADO_FALLECIDO, EstadoAfiliado, evaluarEstadoAfiliado } from '../afiliado/estado-afiliado';
import { parsearFecha } from '../shared/fechas';

/** Datos de la pantalla. Las fechas no se piden si el afiliado es fallecido (RF-05). */
interface DatosProyeccion {
  afiliado: Afiliado;
  fechas: FechasMinimas | null;
  estado: EstadoAfiliado;
}

type Vista =
  | { tipo: 'cargando' }
  | { tipo: 'error' }
  | { tipo: 'lista'; datos: DatosProyeccion };

type Severidad = 'success' | 'warning' | 'secondary';

/** Texto y color del chip de estado de la matrícula. */
export const CHIP_ESTADO: Record<EstadoMatricula, { texto: string; severidad: Severidad }> = {
  activa: { texto: 'ACTIVO', severidad: 'success' },
  cancelado: { texto: 'CANCELADO', severidad: 'warning' },
  suspendido: { texto: 'SUSPENDIDO', severidad: 'warning' },
  fallecido: { texto: 'FALLECIDO', severidad: 'secondary' }
};

@Component({
  selector: 'app-proyeccion',
  standalone: true,
  imports: [DatePipe, ButtonModule, MessageModule, ProgressSpinnerModule, TagModule],
  templateUrl: './proyeccion.component.html',
  styleUrl: './proyeccion.component.scss'
})
export class ProyeccionComponent implements OnInit {
  private readonly afiliadoService = inject(AfiliadoService);

  protected readonly vista = signal<Vista>({ tipo: 'cargando' });
  protected readonly chipEstado = CHIP_ESTADO;
  protected readonly parsearFecha = parsearFecha;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.vista.set({ tipo: 'cargando' });
    this.afiliadoService
      .obtenerAfiliado()
      .pipe(switchMap(afiliado => this.completarDatos(afiliado)))
      .subscribe({
        next: datos => this.vista.set({ tipo: 'lista', datos }),
        error: () => this.vista.set({ tipo: 'error' })
      });
  }

  private completarDatos(afiliado: Afiliado): Observable<DatosProyeccion> {
    if (afiliado.estadoMatricula === 'fallecido') {
      return of({ afiliado, fechas: null, estado: ESTADO_FALLECIDO });
    }
    return this.afiliadoService
      .obtenerFechasMinimas()
      .pipe(map(fechas => ({ afiliado, fechas, estado: evaluarEstadoAfiliado(afiliado, fechas) })));
  }
}
