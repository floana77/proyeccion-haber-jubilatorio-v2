import { armarPdf, mockPdfProyeccion } from './proyeccion.mock';

describe('mock de la proyección', () => {
  it('arma un PDF con la tabla xref apuntando al inicio de cada objeto', () => {
    const pdf = armarPdf(['Hola']);
    const inicioXref = Number(pdf.match(/startxref\n(\d+)/)![1]);
    const posiciones = [...pdf.matchAll(/^(\d{10}) 00000 n $/gm)].map(m => Number(m[1]));

    expect(pdf.slice(inicioXref).startsWith('xref')).toBeTrue();
    expect(posiciones.length).toBe(5);
    posiciones.forEach((posicion, i) => expect(pdf.slice(posicion).startsWith(`${i + 1} 0 obj`)).toBeTrue());
  });

  it('escapa paréntesis y escribe las tildes en octal', () => {
    expect(armarPdf(['(Fecha) mínima'])).toContain('(\\(Fecha\\) m\\355nima) Tj');
  });

  it('incluye los datos de la solicitud, con el legajo', async () => {
    const texto = await mockPdfProyeccion({ legajo: '100234', tipoBeneficio: 'ORDINARIA', fechaJubilacion: '2031-01-05' }).text();

    expect(texto).toContain('Legajo: 100234');
    expect(texto).toContain('Jubilaci\\363n Ordinaria');
    expect(texto).toContain('05/01/2031');
  });
});
