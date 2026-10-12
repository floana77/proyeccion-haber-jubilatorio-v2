import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { map, Observable, of, switchMap } from 'rxjs';

import { Afiliado, EstadoMatricula, FechasMinimas } from '../afiliado/afiliado.model';
import { AfiliadoService } from '../afiliado/afiliado.service';
import { ESTADO_FALLECIDO, EstadoAfiliado, evaluarEstadoAfiliado } from '../afiliado/estado-afiliado';
import { formatearFecha, parsearFecha } from '../shared/fechas';
import { cambiarBeneficio, fechaMinima, preseleccionar, SeleccionBeneficio, TipoBeneficio } from './seleccion-beneficio';

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
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    CalendarModule,
    MessageModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    TagModule
  ],
  templateUrl: './proyeccion.component.html',
  styleUrl: './proyeccion.component.scss'
})
export class ProyeccionComponent implements OnInit {
  private readonly afiliadoService = inject(AfiliadoService);

  protected readonly vista = signal<Vista>({ tipo: 'cargando' });
  /** Beneficio y fecha elegidos; null mientras no hay fechas mínimas. */
  protected readonly seleccion = signal<SeleccionBeneficio | null>(null);

  /** Fechas mínimas cargadas, o null si todavía no están o el afiliado es fallecido. */
  private readonly fechas = computed(() => {
    const vista = this.vista();
    return vista.tipo === 'lista' ? vista.datos.fechas : null;
  });

  /** Fecha elegida como Date, para el calendario. Se memoriza para no reescribir el calendario. */
  protected readonly fechaElegida = computed(() => {
    const seleccion = this.seleccion();
    return seleccion ? parsearFecha(seleccion.fecha) : null;
  });

  /** RF-04: fecha mínima del beneficio elegido; los días anteriores quedan deshabilitados. */
  protected readonly fechaMinimaElegida = computed(() => {
    const fechas = this.fechas();
    const seleccion = this.seleccion();
    if (!fechas || !seleccion) {
      return null;
    }
    return parsearFecha(fechaMinima(fechas, seleccion.tipoBeneficio));
  });

  protected readonly chipEstado = CHIP_ESTADO;
  protected readonly parsearFecha = parsearFecha;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.vista.set({ tipo: 'cargando' });
    this.seleccion.set(null);
    this.afiliadoService
      .obtenerAfiliado()
      .pipe(switchMap(afiliado => this.completarDatos(afiliado)))
      .subscribe({
        next: datos => {
          this.vista.set({ tipo: 'lista', datos });
          this.seleccion.set(datos.fechas ? preseleccionar(datos.fechas) : null);
        },
        error: () => this.vista.set({ tipo: 'error' })
      });
  }

  /** RF-03: al cambiar de beneficio se propone su fecha mínima. */
  protected elegirBeneficio(tipoBeneficio: TipoBeneficio): void {
    const fechas = this.fechas();
    if (fechas) {
      this.seleccion.set(cambiarBeneficio(fechas, tipoBeneficio));
    }
  }

  /** RF-12: el afiliado puede elegir una fecha distinta de la propuesta. */
  protected elegirFecha(fecha: Date | null): void {
    const seleccion = this.seleccion();
    if (seleccion && fecha) {
      this.seleccion.set({ ...seleccion, fecha: formatearFecha(fecha) });
    }
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
