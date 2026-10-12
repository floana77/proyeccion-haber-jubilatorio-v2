/** Estados de matrícula que devuelve el backend. Solo "fallecido" impide proyectar (RF-05). */
export type EstadoMatricula = 'activa' | 'cancelado' | 'suspendido' | 'fallecido';

/** Datos del afiliado con sesión iniciada (GET /afiliado). */
export interface Afiliado {
  /** Legajo profesional: número de identificación del afiliado. */
  legajo: string;
  nombre: string;
  apellido: string;
  matricula: string;
  estadoMatricula: EstadoMatricula;
}

/** Fechas mínimas de jubilación por beneficio (GET /afiliado/fechas-minimas, RF-01). */
export interface FechasMinimas {
  legajo: string;
  /** Fecha mínima de Jubilación Ordinaria, en formato AAAA-MM-DD. */
  ordinaria: string;
  /** Fecha mínima de Jubilación Parcial, en formato AAAA-MM-DD. */
  parcial: string;
}
