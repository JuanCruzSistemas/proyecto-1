import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SearchProductoRapidoDto } from './search-producto-rapido.dto';

describe('SearchProductoRapidoDto', () => {
  const crearDto = (overrides: Partial<SearchProductoRapidoDto> = {}) =>
    plainToClass(SearchProductoRapidoDto, {
      skip: 0,
      take: 10,
      exacto: false,
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido con valores por defecto', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('acepta codigo opcional', async () => {
      const errors = await validate(crearDto({ codigo: 'ABC123' }));

      expect(errors).toHaveLength(0);
    });

    it('acepta codigo como string vacío', async () => {
      const errors = await validate(crearDto({ codigo: '' }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validación del campo codigo', () => {
    it('acepta codigo válido', async () => {
      const errors = await validate(crearDto({ codigo: 'PROD-2024-001' }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza codigo no string', async () => {
      const errors = await validate(crearDto({ codigo: 12345 as any }));

      expect(errors.some((e) => e.property === 'codigo')).toBe(true);
    });
  });

  describe('transformación del flag exacto', () => {
    it('transforma "true" string a booleano true', async () => {
      const dto = crearDto({ exacto: 'true' as any });

      expect(dto.exacto).toBe(true);
    });

    it('transforma "false" string a booleano false', async () => {
      const dto = crearDto({ exacto: 'false' as any });

      expect(dto.exacto).toBe(false);
    });

    it('acepta booleano directo', async () => {
      const errors = await validate(crearDto({ exacto: true }));

      expect(errors).toHaveLength(0);
    });

    it('establece false como valor por defecto', async () => {
      const dto = crearDto({ exacto: undefined });

      expect(dto.exacto).toBe(false);
    });
  });

  describe('validaciones de paginación', () => {
    it('acepta skip en 0', async () => {
      const errors = await validate(crearDto({ skip: 0 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza skip negativo', async () => {
      const errors = await validate(crearDto({ skip: -5 }));

      expect(errors.some((e) => e.property === 'skip')).toBe(true);
    });

    it('acepta skip positivo', async () => {
      const errors = await validate(crearDto({ skip: 20 }));

      expect(errors).toHaveLength(0);
    });

    it('transforma skip de string a número', async () => {
      const dto = crearDto({ skip: '30' as any });

      expect(dto.skip).toBe(30);
    });

    it('acepta take mayor a 0', async () => {
      const errors = await validate(crearDto({ take: 50 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza take menor o igual a 0', async () => {
      const errors = await validate(crearDto({ take: 0 }));

      expect(errors.some((e) => e.property === 'take')).toBe(true);
    });

    it('transforma take de string a número', async () => {
      const dto = crearDto({ take: '100' as any });

      expect(dto.take).toBe(100);
    });

    it('establece 10 como valor por defecto de take', async () => {
      const dto = crearDto({ take: undefined });

      expect(dto.take).toBe(10);
    });

    it('establece 0 como valor por defecto de skip', async () => {
      const dto = crearDto({ skip: undefined });

      expect(dto.skip).toBe(0);
    });
  });

  describe('casos de uso completos', () => {
    it('búsqueda exacta con codigo específico', async () => {
      const errors = await validate(
        crearDto({ codigo: 'ABC123', exacto: true, skip: 0, take: 20 }),
      );

      expect(errors).toHaveLength(0);
    });

    it('búsqueda parcial con paginación', async () => {
      const errors = await validate(
        crearDto({ codigo: 'PRO', exacto: false, skip: 10, take: 25 }),
      );

      expect(errors).toHaveLength(0);
    });
  });
});
