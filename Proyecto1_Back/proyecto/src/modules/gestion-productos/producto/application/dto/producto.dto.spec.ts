import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProductoDto } from './producto.dto';

describe('ProductoDto', () => {
  const crearDto = (overrides: Partial<ProductoDto> = {}) =>
    plainToClass(ProductoDto, {
      id: 1,
      denominacion: 'Producto Completo',
      observacion: 'Sin observaciones',
      codigoProveedor: 'CP001',
      codigoBarra: '7890123456789',
      stock: 100,
      costo: 250.0,
      precio: 300.0,
      porcentaje: 0.20,
      destacado: false,
      envioGratis: false,
      linea: { id: 1, denominacion: 'Aceites' },
      marca: { id: 2, denominacion: 'Genérica' },
      proveedor: { id: 3, denominacion: 'Proveedor S.A.' },
      presentacion: null,
      denominacionEditadaManualmente: false,
      ubicacion: 'A1-B2',
      utilizaStockMinimo: true,
      stockMinimo: 10,
      utilizaPack: false,
      cantidadPorPack: 0,
      sistema: 1,
      codigoReferencia: 'REF-001',
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido completo', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('transforma correctamente el id a número', async () => {
      const dto = crearDto({ id: '42' as any });

      expect(dto.id).toBe(42);
    });

    it('acepta presentacion como null', async () => {
      const errors = await validate(crearDto({ presentacion: null }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones numéricas', () => {
    it('rechaza stock no numérico', async () => {
      const errors = await validate(crearDto({ stock: 'muchos' as any }));

      expect(errors.some((e) => e.property === 'stock')).toBe(true);
    });

    it('rechaza costo no numérico', async () => {
      const errors = await validate(crearDto({ costo: 'caro' as any }));

      expect(errors.some((e) => e.property === 'costo')).toBe(true);
    });

    it('rechaza precio no numérico', async () => {
      const errors = await validate(crearDto({ precio: 'precio' as any }));

      expect(errors.some((e) => e.property === 'precio')).toBe(true);
    });

    it('acepta porcentaje decimal válido', async () => {
      const errors = await validate(crearDto({ porcentaje: 0.35 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones de campos booleanos', () => {
    it('acepta destacado como booleano', async () => {
      const errors = await validate(crearDto({ destacado: true }));

      expect(errors).toHaveLength(0);
    });

    it('acepta envioGratis como booleano', async () => {
      const errors = await validate(crearDto({ envioGratis: true }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza denominacionEditadaManualmente no booleano', async () => {
      const errors = await validate(
        crearDto({ denominacionEditadaManualmente: 'si' as any }),
      );

      expect(errors.some((e) => e.property === 'denominacionEditadaManualmente')).toBe(
        true,
      );
    });

    it('requiere utilizaStockMinimo como booleano', async () => {
      const errors = await validate(crearDto({ utilizaStockMinimo: 1 as any }));

      expect(errors.some((e) => e.property === 'utilizaStockMinimo')).toBe(true);
    });

    it('requiere utilizaPack como booleano', async () => {
      const errors = await validate(crearDto({ utilizaPack: 0 as any }));

      expect(errors.some((e) => e.property === 'utilizaPack')).toBe(true);
    });
  });

  describe('validaciones de entidades relacionadas', () => {
    it('acepta linea válida con id y denominacion', async () => {
      const errors = await validate(
        crearDto({ linea: { id: 5, denominacion: 'Herramientas' } }),
      );

      expect(errors).toHaveLength(0);
    });

    it('acepta marca válida con id y denominacion', async () => {
      const errors = await validate(
        crearDto({ marca: { id: 10, denominacion: 'Marca Premium' } }),
      );

      expect(errors).toHaveLength(0);
    });

    it('acepta proveedor válido con id y denominacion', async () => {
      const errors = await validate(
        crearDto({ proveedor: { id: 15, denominacion: 'Proveedor Internacional' } }),
      );

      expect(errors).toHaveLength(0);
    });

    it('acepta presentacion válida', async () => {
      const errors = await validate(
        crearDto({ presentacion: { id: 3, denominacion: 'Caja x 12' } }),
      );

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones de campos string', () => {
    it('acepta denominacion válida', async () => {
      const errors = await validate(crearDto({ denominacion: 'Producto Nuevo' }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza denominacion no string', async () => {
      const errors = await validate(crearDto({ denominacion: 123 as any }));

      expect(errors.some((e) => e.property === 'denominacion')).toBe(true);
    });

    it('acepta codigoProveedor válido', async () => {
      const errors = await validate(crearDto({ codigoProveedor: 'PROV-2024-001' }));

      expect(errors).toHaveLength(0);
    });

    it('acepta ubicacion válida', async () => {
      const errors = await validate(crearDto({ ubicacion: 'Depósito 3 - Estante 5' }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones de stock mínimo y pack', () => {
    it('acepta stockMinimo cuando utilizaStockMinimo es true', async () => {
      const errors = await validate(
        crearDto({ utilizaStockMinimo: true, stockMinimo: 15 }),
      );

      expect(errors).toHaveLength(0);
    });

    it('acepta cantidadPorPack cuando utilizaPack es true', async () => {
      const errors = await validate(
        crearDto({ utilizaPack: true, cantidadPorPack: 6 }),
      );

      expect(errors).toHaveLength(0);
    });
  });
});
