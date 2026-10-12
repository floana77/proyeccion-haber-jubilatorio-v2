import { formatearFecha, inicioDelDia, parsearFecha } from './fechas';

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

  it('formatea un Date como AAAA-MM-DD con ceros a la izquierda', () => {
    expect(formatearFecha(new Date(2028, 0, 5, 23, 59))).toBe('2028-01-05');
  });

  it('formatear y parsear devuelven la misma fecha', () => {
    expect(formatearFecha(parsearFecha('2031-12-31'))).toBe('2031-12-31');
  });
});
