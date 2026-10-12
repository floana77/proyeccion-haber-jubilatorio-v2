import { inicioDelDia, parsearFecha } from '../shared/fechas';
import { Afiliado, FechasMinimas } from './afiliado.model';

/** Qué alertas y botones corresponden al afiliado al ingresar al módulo. */
export interface EstadoAfiliado {
  /** RF-05: alerta de estado matricular fallecido. */
  fallecido: boolean;
  /** RF-11: alerta "Ud. se encuentra en condiciones de jubilarse". */
  enCondicionesDeJubilarse: boolean;
  /** RF-02: botón "Inicie su trámite de jubilación aquí". */
  mostrarBotonTramite: boolean;
  /** RF-05 y RF-11: habilita el botón Proyectar. */
  puedeProyectar: boolean;
}

/** Una fecha mínima está alcanzada si es hoy o anterior a hoy. */
function alcanzada(fechaIso: string, hoy: Date): boolean {
  return parsearFecha(fechaIso) <= inicioDelDia(hoy);
}

/** RF-05: el afiliado fallecido solo ve su alerta y no puede proyectar. */
export const ESTADO_FALLECIDO: EstadoAfiliado = {
  fallecido: true,
  enCondicionesDeJubilarse: false,
  mostrarBotonTramite: false,
  puedeProyectar: false
};

/**
 * Si el afiliado es fallecido no se miran las fechas: no puede usar la
 * funcionalidad y solo se muestra la alerta de fallecido.
 */
export function evaluarEstadoAfiliado(afiliado: Afiliado, fechas: FechasMinimas, hoy = new Date()): EstadoAfiliado {
  if (afiliado.estadoMatricula === 'fallecido') {
    return ESTADO_FALLECIDO;
  }

  const ordinariaAlcanzada = alcanzada(fechas.ordinaria, hoy);
  const parcialAlcanzada = alcanzada(fechas.parcial, hoy);
  const enCondicionesDeJubilarse = ordinariaAlcanzada && parcialAlcanzada;

  return {
    fallecido: false,
    enCondicionesDeJubilarse,
    mostrarBotonTramite: ordinariaAlcanzada || parcialAlcanzada,
    puedeProyectar: !enCondicionesDeJubilarse
  };
}
