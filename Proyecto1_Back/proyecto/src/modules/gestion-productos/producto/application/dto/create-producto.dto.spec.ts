import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductoDto } from './create-producto.dto';

describe('CreateProductoDto', () => {
  const crearDto = (overrides: Partial<CreateProductoDto> = {}) =>
    Object.assign(new CreateProductoDto(), {
      denominacion: 'producto test',
      lineaId: 1,
      marcaId: 1,
      usuarioCreatedId: 1,
      utilizaStockMinimo: false,
      utilizaPack: false,
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido con campos mínimos requeridos', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('acepta denominación con espacios, tildes y caracteres especiales válidos', async () => {
      const errors = await validate(
        crearDto({ denominacion: 'Aceite 10W-40 / Marca.Ñoña 50%' }),
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
  });

  describe('validaciones numéricas', () => {
    it('rechaza lineaId no numérico', async () => {
      const errors = await validate(crearDto({ lineaId: 'abc' as any }));

      expect(errors.some((e) => e.property === 'lineaId')).toBe(true);
    });

    it('rechaza marcaId no numérico', async () => {
      const errors = await validate(crearDto({ marcaId: 'xyz' as any }));

      expect(errors.some((e) => e.property === 'marcaId')).toBe(true);
    });

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

    it('acepta costo positivo válido', async () => {
      const errors = await validate(crearDto({ costo: 100.50 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('campos opcionales', () => {
    it('acepta campos opcionales nulos o indefinidos', async () => {
      const errors = await validate(
        crearDto({
          codigoProveedor: undefined,
          observacion: undefined,
          presentacionId: undefined,
        }),
      );

      expect(errors).toHaveLength(0);
    });

    it('acepta utilizaPack con cantidadPorPack', async () => {
      const errors = await validate(
        crearDto({ utilizaPack: true, cantidadPorPack: 6 }),
      );

      expect(errors).toHaveLength(0);
    });
  });

  describe('campos requeridos', () => {
    it('rechaza DTO sin lineaId', async () => {
      const dto = crearDto();
      delete (dto as any).lineaId;
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'lineaId')).toBe(true);
    });

    it('rechaza DTO sin marcaId', async () => {
      const dto = crearDto();
      delete (dto as any).marcaId;
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'marcaId')).toBe(true);
    });

    it('rechaza DTO sin usuarioCreatedId', async () => {
      const dto = crearDto();
      delete (dto as any).usuarioCreatedId;
      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'usuarioCreatedId')).toBe(true);
    });
  });

  describe('transformaciones (como las aplica el ValidationPipe)', () => {
    const desdePlano = (plano: object) =>
      plainToInstance(CreateProductoDto, { lineaId: 1, marcaId: 1, usuarioCreatedId: 1, utilizaStockMinimo: false, utilizaPack: false, ...plano });

    it('recorta y pasa a minúsculas la denominación; sin denominación queda undefined', () => {
      expect(desdePlano({ denominacion: '  ACEITE  ' }).denominacion).toBe('aceite');
      expect(desdePlano({}).denominacion).toBeUndefined();
    });

    it.each([
      ['true', true],
      [true, true],
      ['false', false],
      [false, false],
      ['cualquier cosa', false],
    ])('destacado / envioGratis: %p → %p', (entrada, esperado) => {
      const dto = desdePlano({ destacado: entrada, envioGratis: entrada });
      expect(dto.destacado).toBe(esperado);
      expect(dto.envioGratis).toBe(esperado);
    });
  });
});
