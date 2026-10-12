import { HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

import { Afiliado, EstadoMatricula, FechasMinimas } from '../afiliado/afiliado.model';
import { Escenario, ESCENARIO_POR_DEFECTO, MockRuta } from './mock.model';

/** Demora simulada de la red, en milisegundos. */
const DEMORA_MS = 300;

/** Fecha relativa a hoy, para que los escenarios no venzan. */
interface Desplazamiento {
  anios?: number;
  dias?: number;
}

interface DatosEscenario {
  estadoMatricula: EstadoMatricula;
  parcial: Desplazamiento;
  ordinaria: Desplazamiento;
}

/** Escenarios del .feature, elegidos con ?escenario=... en la URL. */
export const ESCENARIOS_AFILIADO: Record<Escenario, DatosEscenario> = {
  // AC-06, AC-21: afiliado activo, Parcial antes que Ordinaria, ambas a futuro.
  normal: { estadoMatricula: 'activa', parcial: { anios: 1 }, ordinaria: { anios: 5 } },
  // AC-13
  fallecido: { estadoMatricula: 'fallecido', parcial: { anios: 1 }, ordinaria: { anios: 5 } },
  // AC-14
  cancelado: { estadoMatricula: 'cancelado', parcial: { anios: 1 }, ordinaria: { anios: 5 } },
  suspendido: { estadoMatricula: 'suspendido', parcial: { anios: 1 }, ordinaria: { anios: 5 } },
  // AC-02: las dos fechas mínimas son hoy.
  'en-condiciones-hoy': { estadoMatricula: 'activa', parcial: {}, ordinaria: {} },
  // AC-03: las dos fechas mínimas ya pasaron.
  'en-condiciones-vencidas': { estadoMatricula: 'activa', parcial: { anios: -1 }, ordinaria: { dias: -1 } },
  // AC-04: Parcial hoy, Ordinaria mañana.
  'parcial-hoy': { estadoMatricula: 'activa', parcial: {}, ordinaria: { dias: 1 } },
  // AC-05: las dos fechas mínimas son mañana.
  'ambas-manana': { estadoMatricula: 'activa', parcial: { dias: 1 }, ordinaria: { dias: 1 } },
  // AC-07: fechas iguales y a futuro (desempate a favor de Ordinaria).
  'fechas-iguales': { estadoMatricula: 'activa', parcial: { anios: 5 }, ordinaria: { anios: 5 } },
  // AC-08: Parcial ya pasó y Ordinaria a futuro.
  'parcial-vencida': { estadoMatricula: 'activa', parcial: { anios: -1 }, ordinaria: { anios: 4 } }
};

const LEGAJO = '100234';

/** Devuelve los datos del escenario; si no existe, los del escenario normal. */
function datosDe(escenario: Escenario): DatosEscenario {
  return ESCENARIOS_AFILIADO[escenario] ?? ESCENARIOS_AFILIADO[ESCENARIO_POR_DEFECTO];
}

/** Fecha de hoy desplazada, en formato AAAA-MM-DD según la hora local. */
export function fechaRelativa({ anios = 0, dias = 0 }: Desplazamiento, hoy = new Date()): string {
  const fecha = new Date(hoy.getFullYear() + anios, hoy.getMonth(), hoy.getDate() + dias);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function mockAfiliado(escenario: Escenario): Afiliado {
  return {
    legajo: LEGAJO,
    nombre: 'María',
    apellido: 'González',
    matricula: '45123',
    estadoMatricula: datosDe(escenario).estadoMatricula
  };
}

export function mockFechasMinimas(escenario: Escenario, hoy = new Date()): FechasMinimas {
  const datos = datosDe(escenario);
  return {
    legajo: LEGAJO,
    ordinaria: fechaRelativa(datos.ordinaria, hoy),
    parcial: fechaRelativa(datos.parcial, hoy)
  };
}

export const MOCK_RUTAS_AFILIADO: MockRuta[] = [
  {
    metodo: 'GET',
    ruta: '/afiliado',
    responder: (_req, escenario) =>
      of(new HttpResponse({ status: 200, body: mockAfiliado(escenario) })).pipe(delay(DEMORA_MS))
  },
  {
    metodo: 'GET',
    ruta: '/afiliado/fechas-minimas',
    responder: (_req, escenario) =>
      of(new HttpResponse({ status: 200, body: mockFechasMinimas(escenario) })).pipe(delay(DEMORA_MS))
  }
];
