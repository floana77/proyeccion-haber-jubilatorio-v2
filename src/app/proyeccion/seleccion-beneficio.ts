import { FechasMinimas } from '../afiliado/afiliado.model';

/** Tipo de beneficio que se envía al servicio de proyección. */
export type TipoBeneficio = 'ORDINARIA' | 'PARCIAL';

/** Beneficio y fecha de jubilación elegidos para proyectar. */
export interface SeleccionBeneficio {
  tipoBeneficio: TipoBeneficio;
  /** Fecha de jubilación, en formato AAAA-MM-DD. */
  fecha: string;
}

function fechaMinima(fechas: FechasMinimas, tipoBeneficio: TipoBeneficio): string {
  return tipoBeneficio === 'ORDINARIA' ? fechas.ordinaria : fechas.parcial;
}

/**
 * RF-07: preselecciona el beneficio con la menor fecha mínima, aunque sea
 * anterior a hoy. Si las fechas son iguales, gana Jubilación Ordinaria.
 * Las fechas AAAA-MM-DD se pueden comparar como texto.
 */
export function preseleccionar(fechas: FechasMinimas): SeleccionBeneficio {
  const tipoBeneficio: TipoBeneficio = fechas.parcial < fechas.ordinaria ? 'PARCIAL' : 'ORDINARIA';
  return { tipoBeneficio, fecha: fechaMinima(fechas, tipoBeneficio) };
}

/** RF-03: al cambiar de beneficio, la fecha elegida pasa a ser la mínima del nuevo beneficio. */
export function cambiarBeneficio(fechas: FechasMinimas, tipoBeneficio: TipoBeneficio): SeleccionBeneficio {
  return { tipoBeneficio, fecha: fechaMinima(fechas, tipoBeneficio) };
}
