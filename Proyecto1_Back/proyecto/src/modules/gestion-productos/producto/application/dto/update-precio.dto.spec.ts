import { validate } from 'class-validator';
import { UpdatePrecioDto } from './update-precio.dto';

describe('UpdatePrecioDto', () => {
  const crearDto = (overrides: Partial<UpdatePrecioDto> = {}) =>
    Object.assign(new UpdatePrecioDto(), {
      costo: 100.0,
      porcentaje: 20,
      usuarioId: 1,
      motivo: 'Actualización de precios',
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido completo', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });
  });

  describe('validación del campo costo', () => {
    it('acepta costo positivo válido', async () => {
      const errors = await validate(crearDto({ costo: 150.50 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza costo en 0', async () => {
      const errors = await validate(crearDto({ costo: 0 }));

      expect(errors.some((e) => e.property === 'costo')).toBe(true);
    });

    it('rechaza costo negativo', async () => {
      const errors = await validate(crearDto({ costo: -50 }));

      expect(errors.some((e) => e.property === 'costo')).toBe(true);
    });

    it('rechaza costo no numérico', async () => {
      const errors = await validate(crearDto({ costo: 'cien' as any }));

      expect(errors.some((e) => e.property === 'costo')).toBe(true);
    });

    it('acepta costo decimal', async () => {
      const errors = await validate(crearDto({ costo: 99.99 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validación del campo porcentaje', () => {
    it('acepta porcentaje en 0', async () => {
      const errors = await validate(crearDto({ porcentaje: 0 }));

      expect(errors).toHaveLength(0);
    });

    it('acepta porcentaje positivo', async () => {
      const errors = await validate(crearDto({ porcentaje: 35 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza porcentaje negativo', async () => {
      const errors = await validate(crearDto({ porcentaje: -10 }));

      expect(errors.some((e) => e.property === 'porcentaje')).toBe(true);
    });

    it('rechaza porcentaje no numérico', async () => {
      const errors = await validate(crearDto({ porcentaje: 'veinte' as any }));

      expect(errors.some((e) => e.property === 'porcentaje')).toBe(true);
    });

    it('acepta porcentaje decimal', async () => {
      const errors = await validate(crearDto({ porcentaje: 12.5 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validación del campo usuarioId', () => {
    it('acepta usuarioId válido', async () => {
      const errors = await validate(crearDto({ usuarioId: 5 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza usuarioId no numérico', async () => {
      const errors = await validate(crearDto({ usuarioId: 'abc' as any }));

      expect(errors.some((e) => e.property === 'usuarioId')).toBe(true);
    });
  });

  describe('validación del campo motivo', () => {
    it('acepta motivo válido', async () => {
      const errors = await validate(
        crearDto({ motivo: 'Aumento por inflación del proveedor' }),
      );

      expect(errors).toHaveLength(0);
    });

    it('rechaza motivo vacío', async () => {
      const errors = await validate(crearDto({ motivo: '' }));

      expect(errors.some((e) => e.property === 'motivo')).toBe(true);
    });

    it('rechaza motivo no string', async () => {
      const errors = await validate(crearDto({ motivo: 123 as any }));

      expect(errors.some((e) => e.property === 'motivo')).toBe(true);
    });

    it('acepta motivo con múltiples palabras', async () => {
      const errors = await validate(
        crearDto({
          motivo: 'Actualización de precios debido al aumento del dólar y la inflación',
        }),
      );

      expect(errors).toHaveLength(0);
    });
  });

  describe('casos de uso completos', () => {
    it('actualización con aumento de margen', async () => {
      const errors = await validate(
        crearDto({
          costo: 200,
          porcentaje: 25,
          usuarioId: 10,
          motivo: 'Mejora del margen de ganancia',
        }),
      );

      expect(errors).toHaveLength(0);
    });

    it('actualización solo de costo sin cambio de margen', async () => {
      const errors = await validate(
        crearDto({
          costo: 150,
          porcentaje: 0,
          usuarioId: 5,
          motivo: 'Cambio de proveedor',
        }),
      );

      expect(errors).toHaveLength(0);
    });
  });
});
