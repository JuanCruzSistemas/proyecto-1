import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HistorialPrecioDto } from './historial.dto';

describe('HistorialPrecioDto', () => {
  const crearDto = (overrides: Partial<HistorialPrecioDto> = {}) =>
    plainToClass(HistorialPrecioDto, {
      id: 1,
      precioAnterior: 100.0,
      precioNuevo: 120.0,
      costoAnterior: 80.0,
      costoNuevo: 90.0,
      margenAnterior: 0.25,
      margenNuevo: 0.33,
      motivo: 'Actualización de precios',
      fecha: new Date('2024-01-15'),
      usuarioNombre: 'Juan Pérez',
      usuarioId: 5,
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido completo', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('transforma correctamente id a número', async () => {
      const dto = crearDto({ id: '10' as any });

      expect(dto.id).toBe(10);
    });

    it('transforma correctamente fecha a Date', async () => {
      const dto = crearDto({ fecha: '2024-01-01' as any });

      expect(dto.fecha).toBeInstanceOf(Date);
    });
  });

  describe('validaciones de precios', () => {
    it('rechaza precioAnterior negativo', async () => {
      const errors = await validate(crearDto({ precioAnterior: -50 }));

      expect(errors.some((e) => e.property === 'precioAnterior')).toBe(true);
    });

    it('rechaza precioNuevo negativo', async () => {
      const errors = await validate(crearDto({ precioNuevo: -60 }));

      expect(errors.some((e) => e.property === 'precioNuevo')).toBe(true);
    });

    it('acepta precioAnterior en cero', async () => {
      const errors = await validate(crearDto({ precioAnterior: 0 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones de costos', () => {
    it('rechaza costoAnterior negativo', async () => {
      const errors = await validate(crearDto({ costoAnterior: -10 }));

      expect(errors.some((e) => e.property === 'costoAnterior')).toBe(true);
    });

    it('rechaza costoNuevo negativo', async () => {
      const errors = await validate(crearDto({ costoNuevo: -20 }));

      expect(errors.some((e) => e.property === 'costoNuevo')).toBe(true);
    });

    it('acepta cambios de costo positivos', async () => {
      const errors = await validate(
        crearDto({ costoAnterior: 50, costoNuevo: 75 }),
      );

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones de márgenes', () => {
    it('acepta márgenes válidos', async () => {
      const errors = await validate(
        crearDto({ margenAnterior: 0.15, margenNuevo: 0.20 }),
      );

      expect(errors).toHaveLength(0);
    });

    it('rechaza margenAnterior negativo', async () => {
      const errors = await validate(crearDto({ margenAnterior: -0.1 }));

      expect(errors.some((e) => e.property === 'margenAnterior')).toBe(true);
    });

    it('rechaza margenNuevo negativo', async () => {
      const errors = await validate(crearDto({ margenNuevo: -0.05 }));

      expect(errors.some((e) => e.property === 'margenNuevo')).toBe(true);
    });
  });

  describe('validaciones de campos requeridos', () => {
    it('requiere motivo como string', async () => {
      const errors = await validate(crearDto({ motivo: 123 as any }));

      expect(errors.some((e) => e.property === 'motivo')).toBe(true);
    });

    it('acepta motivo válido', async () => {
      const errors = await validate(
        crearDto({ motivo: 'Aumento por inflación' }),
      );

      expect(errors).toHaveLength(0);
    });

    it('requiere usuarioNombre como string', async () => {
      const errors = await validate(crearDto({ usuarioNombre: 456 as any }));

      expect(errors.some((e) => e.property === 'usuarioNombre')).toBe(true);
    });

    it('requiere usuarioId como entero', async () => {
      const errors = await validate(crearDto({ usuarioId: 'abc' as any }));

      expect(errors.some((e) => e.property === 'usuarioId')).toBe(true);
    });
  });
});
