import { mockAfiliado, mockFechasMinimas } from '../mocks/afiliado.mock';
import { Afiliado, EstadoMatricula, FechasMinimas } from './afiliado.model';
import { evaluarEstadoAfiliado } from './estado-afiliado';

describe('evaluarEstadoAfiliado', () => {
  // A media tarde, para comprobar que la hora no afecta la comparación de días.
  const hoy = new Date(2026, 9, 12, 15, 30);

  function afiliado(estadoMatricula: EstadoMatricula = 'activa'): Afiliado {
    return { ...mockAfiliado('normal'), estadoMatricula };
  }

  function fechas(parcial: string, ordinaria: string): FechasMinimas {
    return { legajo: '100234', parcial, ordinaria };
  }

  it('AC-02: con las dos fechas iguales a hoy está en condiciones, no proyecta y ve el botón de trámite', () => {
    expect(evaluarEstadoAfiliado(afiliado(), fechas('2026-10-12', '2026-10-12'), hoy)).toEqual({
      fallecido: false, enCondicionesDeJubilarse: true, mostrarBotonTramite: true, puedeProyectar: false
    });
  });

  it('AC-03: con las dos fechas anteriores a hoy se ve lo mismo que en AC-02', () => {
    expect(evaluarEstadoAfiliado(afiliado(), fechas('2025-10-12', '2026-10-11'), hoy)).toEqual({
      fallecido: false, enCondicionesDeJubilarse: true, mostrarBotonTramite: true, puedeProyectar: false
    });
  });

  it('AC-04: con Parcial hoy y Ordinaria mañana ve el botón de trámite y puede proyectar', () => {
    expect(evaluarEstadoAfiliado(afiliado(), fechas('2026-10-12', '2026-10-13'), hoy)).toEqual({
      fallecido: false, enCondicionesDeJubilarse: false, mostrarBotonTramite: true, puedeProyectar: true
    });
  });

  it('AC-05: con las dos fechas mañana no ve alerta ni botón de trámite y puede proyectar', () => {
    expect(evaluarEstadoAfiliado(afiliado(), fechas('2026-10-13', '2026-10-13'), hoy)).toEqual({
      fallecido: false, enCondicionesDeJubilarse: false, mostrarBotonTramite: false, puedeProyectar: true
    });
  });

  it('AC-13: con matrícula "fallecido" ve la alerta y no puede proyectar', () => {
    expect(evaluarEstadoAfiliado(afiliado('fallecido'), fechas('2027-10-12', '2031-10-12'), hoy)).toEqual({
      fallecido: true, enCondicionesDeJubilarse: false, mostrarBotonTramite: false, puedeProyectar: false
    });
  });

  it('con matrícula "fallecido" no mira las fechas: solo la alerta de fallecido, aunque ya estén alcanzadas', () => {
    expect(evaluarEstadoAfiliado(afiliado('fallecido'), fechas('2025-10-12', '2026-10-12'), hoy)).toEqual({
      fallecido: true, enCondicionesDeJubilarse: false, mostrarBotonTramite: false, puedeProyectar: false
    });
  });

  (['activa', 'cancelado', 'suspendido'] as EstadoMatricula[]).forEach(estadoMatricula => {
    it(`AC-14: con matrícula "${estadoMatricula}" y fechas a futuro no ve la alerta y puede proyectar`, () => {
      const estado = evaluarEstadoAfiliado(afiliado(estadoMatricula), fechas('2027-10-12', '2031-10-12'), hoy);
      expect(estado.fallecido).toBeFalse();
      expect(estado.puedeProyectar).toBeTrue();
    });
  });

  it('funciona con los datos del mock del escenario en-condiciones-hoy', () => {
    const estado = evaluarEstadoAfiliado(mockAfiliado('en-condiciones-hoy'), mockFechasMinimas('en-condiciones-hoy', hoy), hoy);
    expect(estado.enCondicionesDeJubilarse).toBeTrue();
  });
});
