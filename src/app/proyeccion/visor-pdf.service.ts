import { Injectable } from '@angular/core';

/** Tiempo tras el cual se libera el PDF de la memoria del navegador. */
export const LIBERAR_PDF_MS = 5 * 60_000;

/** Pestaña abierta al hacer clic en Proyectar, que espera el PDF. */
export interface PestanaPdf {
  mostrar(pdf: Blob): void;
  cerrar(): void;
}

/**
 * RF-08: muestra el PDF en una pestaña nueva. La pestaña se abre en el mismo
 * clic, antes de que llegue el PDF, porque los navegadores (sobre todo Safari
 * en iOS) bloquean las pestañas abiertas fuera de un clic.
 */
@Injectable({ providedIn: 'root' })
export class VisorPdfService {
  abrirEnEspera(): PestanaPdf {
    const ventana = window.open('', '_blank');
    if (ventana) {
      // La pestaña no necesita acceso a esta página.
      ventana.opener = null;
      ventana.document.title = 'Proyección de haber jubilatorio';
      ventana.document.body.style.font = '18px sans-serif';
      ventana.document.body.textContent = 'Generando su proyección…';
    }

    return {
      mostrar: pdf => {
        const url = URL.createObjectURL(pdf);
        if (ventana && !ventana.closed) {
          ventana.location.href = url;
        } else {
          // Si el navegador no dejó abrirla o el afiliado la cerró, se intenta de nuevo.
          window.open(url, '_blank');
        }
        setTimeout(() => URL.revokeObjectURL(url), LIBERAR_PDF_MS);
      },
      cerrar: () => ventana?.close()
    };
  }
}
