import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateProductoDto } from './update-producto.dto';

describe('UpdateProductoDto', () => {
  const crearDto = (overrides: Partial<UpdateProductoDto> = {}) =>
    Object.assign(new UpdateProductoDto(), {
      usuarioUpdatedId: 1,
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido con solo usuarioUpdatedId', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('acepta DTO con campos opcionales definidos', async () => {
      const errors = await validate(
        crearDto({
          denominacion: 'producto actualizado',
          stock: 50,
          costo: 150,
          lineaId: 2,
          marcaId: 3,
        }),
      );

      expect(errors).toHaveLength(0);
    });
  });

  describe('validación del campo usuarioUpdatedId', () => {
    it('rechaza DTO sin usuarioUpdatedId', async () => {
      const dto = crearDto();
      delete (dto as any).usuarioUpdatedId;
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'usuarioUpdatedId')).toBe(true);
    });

    it('rechaza usuarioUpdatedId no numérico', async () => {
      const errors = await validate(crearDto({ usuarioUpdatedId: 'abc' as any }));

      expect(errors.some((e) => e.property === 'usuarioUpdatedId')).toBe(true);
    });

    it('acepta usuarioUpdatedId válido', async () => {
      const errors = await validate(crearDto({ usuarioUpdatedId: 10 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validación de denominacion', () => {
    it('acepta denominación válida con espacios y caracteres especiales', async () => {
      const errors = await validate(
        crearDto({ denominacion: 'Aceite 10W-40 / Marca.Test' }),
      );

      expect(errors).toHaveLength(0);
    });

    it('rechaza denominación con más de 255 caracteres', async () => {
      const errors = await validate(crearDto({ denominacion: 'a'.repeat(256) }));

      expect(errors.some((e) => e.property === 'denominacion')).toBe(true);
    });

    it('rechaza denominación con caracteres inválidos', async () => {
      const errors = await validate(crearDto({ denominacion: 'test<script>' }));

      expect(errors.some((e) => e.property === 'denominacion')).toBe(true);
    });

    it('transforma denominacion a minúsculas y sin espacios al inicio/final', async () => {
      // Los @Transform solo corren al convertir desde un objeto plano (como hace el ValidationPipe).
      const dto = plainToInstance(UpdateProductoDto, { usuarioUpdatedId: 1, denominacion: '  PRODUCTO MAYÚSCULAS  ' });

      expect(dto.denominacion).toBe('producto mayúsculas');
    });
  });

  describe('campos numéricos opcionales', () => {
    it('rechaza stock negativo', async () => {
      const errors = await validate(crearDto({ stock: -5 }));

      expect(errors.some((e) => e.property === 'stock')).toBe(true);
    });

    it('rechaza stockMinimo negativo', async () => {
      const errors = await validate(crearDto({ stockMinimo: -10 }));

      expect(errors.some((e) => e.property === 'stockMinimo')).toBe(true);
    });

    it('rechaza costo no positivo', async () => {
      const errors = await validate(crearDto({ costo: 0 }));

      expect(errors.some((e) => e.property === 'costo')).toBe(true);
    });

    it('acepta todos los campos numéricos válidos', async () => {
      const errors = await validate(
        crearDto({
          stock: 100,
          stockMinimo: 10,
          costo: 250,
          porcentaje: 20,
          cantidadPorPack: 6,
        }),
      );

      expect(errors).toHaveLength(0);
    });
  });

  describe('campos booleanos opcionales', () => {
    it('acepta destacado como booleano', async () => {
      const errors = await validate(crearDto({ destacado: true }));

      expect(errors).toHaveLength(0);
    });

    it('acepta envioGratis como booleano', async () => {
      const errors = await validate(crearDto({ envioGratis: true }));

      expect(errors).toHaveLength(0);
    });

    it('acepta utilizaStockMinimo como booleano', async () => {
      const errors = await validate(crearDto({ utilizaStockMinimo: true }));

      expect(errors).toHaveLength(0);
    });

    it('acepta utilizaPack como booleano', async () => {
      const errors = await validate(crearDto({ utilizaPack: true }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('campos string opcionales', () => {
    it('acepta observacion válida', async () => {
      const errors = await validate(
        crearDto({ observacion: 'Producto renovado' }),
      );

      expect(errors).toHaveLength(0);
    });

    it('acepta codigoProveedor válido', async () => {
      const errors = await validate(crearDto({ codigoProveedor: 'PROV-001' }));

      expect(errors).toHaveLength(0);
    });

    it('acepta codigoBarra válido', async () => {
      const errors = await validate(crearDto({ codigoBarra: '7890123456789' }));

      expect(errors).toHaveLength(0);
    });

    it('acepta ubicacion válida', async () => {
      const errors = await validate(crearDto({ ubicacion: 'Estante A-3' }));

      expect(errors).toHaveLength(0);
    });

    it('acepta codigoReferencia válido', async () => {
      const errors = await validate(crearDto({ codigoReferencia: 'REF-2024-001' }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('relaciones opcionales', () => {
    it('acepta lineaId válido', async () => {
      const errors = await validate(crearDto({ lineaId: 5 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza lineaId no numérico', async () => {
      const errors = await validate(crearDto({ lineaId: 'abc' as any }));

      expect(errors.some((e) => e.property === 'lineaId')).toBe(true);
    });

    it('acepta marcaId válido', async () => {
      const errors = await validate(crearDto({ marcaId: 8 }));

      expect(errors).toHaveLength(0);
    });

    it('acepta presentacionId válido', async () => {
      const errors = await validate(crearDto({ presentacionId: 3 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('actualización parcial', () => {
    it('permite actualizar solo denominacion', async () => {
      const errors = await validate(
        crearDto({
          denominacion: 'nueva denominación',
          usuarioUpdatedId: 1,
        }),
      );

      expect(errors).toHaveLength(0);
    });

    it('permite actualizar solo stock', async () => {
      const errors = await validate(
        crearDto({
          stock: 75,
          usuarioUpdatedId: 1,
        }),
      );

      expect(errors).toHaveLength(0);
    });

    it('permite actualizar múltiples campos', async () => {
      const errors = await validate(
        crearDto({
          denominacion: 'producto modificado',
          stock: 200,
          costo: 300,
          destacado: true,
          usuarioUpdatedId: 5,
        }),
      );

      expect(errors).toHaveLength(0);
    });
  });
});
