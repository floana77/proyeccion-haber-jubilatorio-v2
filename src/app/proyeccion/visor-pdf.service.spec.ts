import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LIBERAR_PDF_MS, VisorPdfService } from './visor-pdf.service';

describe('VisorPdfService', () => {
  const pdf = new Blob(['%PDF'], { type: 'application/pdf' });
  let servicio: VisorPdfService;
  let ventana: { opener: unknown; closed: boolean; close: jasmine.Spy; location: { href: string }; document: Document };

  beforeEach(() => {
    servicio = TestBed.inject(VisorPdfService);
    ventana = {
      opener: window,
      closed: false,
      close: jasmine.createSpy('close'),
      location: { href: '' },
      document: document.implementation.createHTMLDocument()
    };
    spyOn(URL, 'createObjectURL').and.returnValue('blob:pdf');
    spyOn(URL, 'revokeObjectURL');
  });

  it('abre la pestaña en el clic con un mensaje de espera y sin acceso a esta página', () => {
    spyOn(window, 'open').and.returnValue(ventana as unknown as Window);

    servicio.abrirEnEspera();

    expect(window.open).toHaveBeenCalledOnceWith('', '_blank');
    expect(ventana.opener).toBeNull();
    expect(ventana.document.body.textContent).toBe('Generando su proyección…');
  });

  it('carga el PDF en la pestaña abierta y lo libera después', fakeAsync(() => {
    spyOn(window, 'open').and.returnValue(ventana as unknown as Window);

    servicio.abrirEnEspera().mostrar(pdf);

    expect(URL.createObjectURL).toHaveBeenCalledWith(pdf);
    expect(ventana.location.href).toBe('blob:pdf');
    tick(LIBERAR_PDF_MS - 1);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    tick(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:pdf');
  }));

  it('si la pestaña no se pudo abrir, intenta abrir el PDF directamente', fakeAsync(() => {
    const abrir = spyOn(window, 'open').and.returnValue(null);

    servicio.abrirEnEspera().mostrar(pdf);

    expect(abrir.calls.mostRecent().args).toEqual(['blob:pdf', '_blank']);
    tick(LIBERAR_PDF_MS);
  }));

  it('si el afiliado cerró la pestaña, intenta abrir el PDF directamente', fakeAsync(() => {
    const abrir = spyOn(window, 'open').and.returnValue(ventana as unknown as Window);
    const pestana = servicio.abrirEnEspera();
    ventana.closed = true;

    pestana.mostrar(pdf);

    expect(abrir.calls.mostRecent().args).toEqual(['blob:pdf', '_blank']);
    tick(LIBERAR_PDF_MS);
  }));

  it('cierra la pestaña', () => {
    spyOn(window, 'open').and.returnValue(ventana as unknown as Window);

    servicio.abrirEnEspera().cerrar();

    expect(ventana.close).toHaveBeenCalled();
  });
});
