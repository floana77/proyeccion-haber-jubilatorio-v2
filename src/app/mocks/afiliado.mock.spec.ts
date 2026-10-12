import { fechaRelativa, mockAfiliado, mockFechasMinimas } from './afiliado.mock';

describe('mocks del afiliado', () => {
  // 31/01 sirve para probar el paso de mes y de año.
  const hoy = new Date(2026, 0, 31);

  it('arma fechas relativas a hoy en formato AAAA-MM-DD', () => {
    expect(fechaRelativa({}, hoy)).toBe('2026-01-31');
    expect(fechaRelativa({ dias: 1 }, hoy)).toBe('2026-02-01');
    expect(fechaRelativa({ dias: -31 }, hoy)).toBe('2025-12-31');
    expect(fechaRelativa({ anios: 5 }, hoy)).toBe('2031-01-31');
  });

  it('incluye el legajo en los datos del afiliado y en las fechas mínimas', () => {
    expect(mockAfiliado('normal').legajo).toBe('100234');
    expect(mockFechasMinimas('normal', hoy).legajo).toBe('100234');
  });

  it('usa el estado de matrícula del escenario', () => {
    expect(mockAfiliado('normal').estadoMatricula).toBe('activa');
    expect(mockAfiliado('fallecido').estadoMatricula).toBe('fallecido');
    expect(mockAfiliado('cancelado').estadoMatricula).toBe('cancelado');
    expect(mockAfiliado('suspendido').estadoMatricula).toBe('suspendido');
  });

  it('arma las fechas mínimas de cada escenario del .feature', () => {
    expect(mockFechasMinimas('normal', hoy)).toEqual(jasmine.objectContaining({ parcial: '2027-01-31', ordinaria: '2031-01-31' }));
    expect(mockFechasMinimas('en-condiciones-hoy', hoy)).toEqual(jasmine.objectContaining({ parcial: '2026-01-31', ordinaria: '2026-01-31' }));
    expect(mockFechasMinimas('en-condiciones-vencidas', hoy)).toEqual(jasmine.objectContaining({ parcial: '2025-01-31', ordinaria: '2026-01-30' }));
    expect(mockFechasMinimas('parcial-hoy', hoy)).toEqual(jasmine.objectContaining({ parcial: '2026-01-31', ordinaria: '2026-02-01' }));
    expect(mockFechasMinimas('ambas-manana', hoy)).toEqual(jasmine.objectContaining({ parcial: '2026-02-01', ordinaria: '2026-02-01' }));
    expect(mockFechasMinimas('fechas-iguales', hoy)).toEqual(jasmine.objectContaining({ parcial: '2031-01-31', ordinaria: '2031-01-31' }));
    expect(mockFechasMinimas('parcial-vencida', hoy)).toEqual(jasmine.objectContaining({ parcial: '2025-01-31', ordinaria: '2030-01-31' }));
  });

  it('usa el escenario normal si el escenario no existe', () => {
    expect(mockFechasMinimas('no-existe', hoy)).toEqual(mockFechasMinimas('normal', hoy));
  });
});
