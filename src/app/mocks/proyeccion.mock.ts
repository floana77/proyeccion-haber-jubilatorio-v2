import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { delay, NEVER, of, switchMap, throwError, timer } from 'rxjs';

import { SolicitudProyeccion } from '../proyeccion/proyeccion.service';
import { MockRuta } from './mock.model';

/** Demora simulada del servicio de proyección, en milisegundos. */
const DEMORA_MS = 800;
/** Demora del escenario lento, para ver el indicador de carga (AC-17). */
export const DEMORA_LENTA_MS = 3_000;

const NOMBRE_BENEFICIO = { ORDINARIA: 'Jubilación Ordinaria', PARCIAL: 'Jubilación Parcial' } as const;

/**
 * Escapa el texto para un string PDF con la fuente Helvetica (WinAnsi): los
 * caracteres no ASCII, como las tildes, van en octal.
 */
function textoPdf(texto: string): string {
  return [...texto]
    .map(c => {
      if (c === '(' || c === ')' || c === '\\') {
        return `\\${c}`;
      }
      const codigo = c.charCodeAt(0);
      return codigo < 128 ? c : `\\${codigo.toString(8)}`;
    })
    .join('');
}

/** Arma un PDF de una página con las líneas de texto dadas. Solo para pruebas. */
export function armarPdf(lineas: string[]): string {
  const contenido = [
    'BT /F1 14 Tf 72 760 Td 20 TL',
    ...lineas.map(linea => `(${textoPdf(linea)}) Tj T*`),
    'ET'
  ].join('\n');
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  ];

  // Todo es ASCII, así que la longitud del texto es la cantidad de bytes.
  let pdf = '%PDF-1.4\n';
  const posiciones = objetos.map((objeto, i) => {
    const posicion = pdf.length;
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
    return posicion;
  });
  const inicioXref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += posiciones.map(p => `${String(p).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;
  return pdf;
}

/** PDF de prueba con los datos de la solicitud, para comprobar que llegan los elegidos (AC-15). */
export function mockPdfProyeccion(solicitud: SolicitudProyeccion): Blob {
  const [anio, mes, dia] = solicitud.fechaJubilacion.split('-');
  const pdf = armarPdf([
    'PDF de prueba - Proyección de haber jubilatorio',
    `Legajo: ${solicitud.legajo}`,
    `Beneficio: ${NOMBRE_BENEFICIO[solicitud.tipoBeneficio]}`,
    `Fecha de jubilación: ${dia}/${mes}/${anio}`
  ]);
  return new Blob([pdf], { type: 'application/pdf' });
}

function responderPdf(req: HttpRequest<unknown>) {
  return of(new HttpResponse({ status: 200, body: mockPdfProyeccion(req.body as SolicitudProyeccion) }));
}

export const MOCK_RUTAS_PROYECCION: MockRuta[] = [
  {
    metodo: 'POST',
    ruta: '/proyeccion',
    responder: (req, escenario) => {
      switch (escenario) {
        // AC-18: el servicio devuelve un error.
        case 'proyeccion-error':
          return timer(DEMORA_MS).pipe(
            switchMap(() =>
              throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Error', url: req.url }))
            )
          );
        // AC-19: el servicio no responde nunca; corta el tiempo máximo del servicio.
        case 'proyeccion-sin-respuesta':
          return NEVER;
        // AC-17: el servicio tarda, para ver el indicador de carga.
        case 'proyeccion-lenta':
          return responderPdf(req).pipe(delay(DEMORA_LENTA_MS));
        default:
          return responderPdf(req).pipe(delay(DEMORA_MS));
      }
    }
  }
];
