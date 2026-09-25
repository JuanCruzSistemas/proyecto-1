import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GetProductoDto } from './get-producto.dto';

describe('GetProductoDto', () => {
  const crearDto = (overrides: Partial<GetProductoDto> = {}) =>
    plainToClass(GetProductoDto, {
      id: 1,
      denominacion: 'Producto Test',
      codigoProveedorDenominacion: '1234 Producto Test',
      codigoProveedor: '1234',
      proveedor: 'Proveedor Test',
      ubicacion: 'A1',
      stock: 10,
      costo: 100.0,
      precio: 120.0,
      sistema: 1,
      observacion: 'Sin observaciones',
      utilizaStockMinimo: false,
      stockMinimo: 0,
      utilizaPack: false,
      cantidadPorPack: 0,
      codigoReferencia: 'REF001',
      ...overrides,
    });

  describe('validaciones de tipo', () => {
    it('acepta un DTO válido completo', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('transforma correctamente id a número', async () => {
      const dto = crearDto({ id: '123' as any });

      expect(dto.id).toBe(123);
    });

    it('transforma correctamente stock a número', async () => {
      const dto = crearDto({ stock: '50' as any });

      expect(dto.stock).toBe(50);
    });

    it('rechaza stock negativo', async () => {
      const errors = await validate(crearDto({ stock: -5 }));

      expect(errors.some((e) => e.property === 'stock')).toBe(true);
    });

    it('rechaza costo negativo', async () => {
      const errors = await validate(crearDto({ costo: -10 }));

      expect(errors.some((e) => e.property === 'costo')).toBe(true);
    });

    it('rechaza precio negativo', async () => {
      const errors = await validate(crearDto({ precio: -20 }));

      expect(errors.some((e) => e.property === 'precio')).toBe(true);
    });
  });

  describe('validaciones de campos booleanos', () => {
    it('acepta utilizaStockMinimo como booleano', async () => {
      const errors = await validate(crearDto({ utilizaStockMinimo: true }));

      expect(errors).toHaveLength(0);
    });

    it('acepta utilizaPack como booleano', async () => {
      const errors = await validate(crearDto({ utilizaPack: true }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza utilizaStockMinimo no booleano', async () => {
      const errors = await validate(crearDto({ utilizaStockMinimo: 'si' as any }));

      expect(errors.some((e) => e.property === 'utilizaStockMinimo')).toBe(true);
    });
  });

  describe('validaciones de strings', () => {
    it('acepta todos los campos string válidos', async () => {
      const errors = await validate(
        crearDto({
          denominacion: 'Test',
          codigoProveedor: 'CP123',
          proveedor: 'Prov',
          ubicacion: 'B2',
          observacion: 'Obs',
          codigoReferencia: 'REF',
        }),
      );

      expect(errors).toHaveLength(0);
    });

    it('rechaza denominacion no string', async () => {
      const errors = await validate(crearDto({ denominacion: 123 as any }));

      expect(errors.some((e) => e.property === 'denominacion')).toBe(true);
    });
  });
});
