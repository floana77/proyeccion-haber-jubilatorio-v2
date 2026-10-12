import { FechasMinimas } from '../afiliado/afiliado.model';
import { fechaRelativa, mockFechasMinimas } from '../mocks/afiliado.mock';
import { cambiarBeneficio, preseleccionar } from './seleccion-beneficio';

describe('selección de beneficio', () => {
  function fechas(parcial: string, ordinaria: string): FechasMinimas {
    return { legajo: '100234', parcial, ordinaria };
  }

  describe('preseleccionar (RF-07)', () => {
    it('AC-06: con Parcial antes que Ordinaria preselecciona Parcial con su fecha', () => {
      expect(preseleccionar(fechas('2027-10-12', '2031-10-12'))).toEqual({ tipoBeneficio: 'PARCIAL', fecha: '2027-10-12' });
    });

    it('con Ordinaria antes que Parcial preselecciona Ordinaria con su fecha', () => {
      expect(preseleccionar(fechas('2031-10-12', '2027-10-12'))).toEqual({ tipoBeneficio: 'ORDINARIA', fecha: '2027-10-12' });
    });

    it('AC-07: con las dos fechas iguales preselecciona Ordinaria', () => {
      expect(preseleccionar(fechas('2031-10-12', '2031-10-12'))).toEqual({ tipoBeneficio: 'ORDINARIA', fecha: '2031-10-12' });
    });

    it('AC-08: con Parcial anterior a hoy preselecciona Parcial con esa fecha', () => {
      expect(preseleccionar(fechas('2025-10-12', '2030-10-12'))).toEqual({ tipoBeneficio: 'PARCIAL', fecha: '2025-10-12' });
    });

    it('compara por fecha y no por día del mes', () => {
      expect(preseleccionar(fechas('2028-01-31', '2027-12-01')).tipoBeneficio).toBe('ORDINARIA');
    });
  });

  describe('cambiarBeneficio (RF-03)', () => {
    it('AC-09: al pasar de Parcial con otra fecha a Ordinaria, la fecha pasa a ser la mínima de Ordinaria', () => {
      const minimas = fechas('2027-10-12', '2031-10-12');
      const elegida = { ...preseleccionar(minimas), fecha: '2029-03-15' };

      expect(elegida.tipoBeneficio).toBe('PARCIAL');
      expect(cambiarBeneficio(minimas, 'ORDINARIA')).toEqual({ tipoBeneficio: 'ORDINARIA', fecha: '2031-10-12' });
    });

    it('al pasar a Parcial, la fecha pasa a ser la mínima de Parcial', () => {
      expect(cambiarBeneficio(fechas('2027-10-12', '2031-10-12'), 'PARCIAL')).toEqual({
        tipoBeneficio: 'PARCIAL', fecha: '2027-10-12'
      });
    });
  });

  describe('con los escenarios del mock', () => {
    const hoy = new Date(2026, 9, 12);

    for (const [escenario, tipoBeneficio, desplazamiento] of [
      ['normal', 'PARCIAL', { anios: 1 }],
      ['fechas-iguales', 'ORDINARIA', { anios: 5 }],
      ['parcial-vencida', 'PARCIAL', { anios: -1 }]
    ] as const) {
      it(`${escenario}: preselecciona ${tipoBeneficio}`, () => {
        expect(preseleccionar(mockFechasMinimas(escenario, hoy))).toEqual({
          tipoBeneficio, fecha: fechaRelativa(desplazamiento, hoy)
        });
      });
    }
  });
});
