import { inicioDelDia, parsearFecha } from './fechas';

describe('fechas', () => {
  it('parsea AAAA-MM-DD como fecha local, sin correrse al día anterior', () => {
    const fecha = parsearFecha('2028-05-10');
    expect(fecha.getFullYear()).toBe(2028);
    expect(fecha.getMonth()).toBe(4);
    expect(fecha.getDate()).toBe(10);
    expect(fecha.getHours()).toBe(0);
  });

  it('quita la hora del día', () => {
    expect(inicioDelDia(new Date(2026, 9, 12, 23, 59))).toEqual(new Date(2026, 9, 12));
  });
});
