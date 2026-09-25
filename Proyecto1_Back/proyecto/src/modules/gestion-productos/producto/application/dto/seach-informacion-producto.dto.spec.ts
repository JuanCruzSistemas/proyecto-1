import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SearchInformacionProductoDto } from './seach-informacion-producto.dto';

describe('SearchInformacionProductoDto', () => {
  const crearDto = (overrides: Partial<SearchInformacionProductoDto> = {}) =>
    plainToClass(SearchInformacionProductoDto, {
      productoId: 1,
      fechaDesde: new Date('2024-01-01'),
      fechaHasta: new Date('2024-12-31'),
      skip: 0,
      take: 10,
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido completo', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('transforma correctamente productoId a número', async () => {
      const dto = crearDto({ productoId: '123' as any });

      expect(dto.productoId).toBe(123);
    });

    it('transforma correctamente fechas a Date', async () => {
      const dto = crearDto({
        fechaDesde: '2024-01-01' as any,
        fechaHasta: '2024-12-31' as any,
      });

      expect(dto.fechaDesde).toBeInstanceOf(Date);
      expect(dto.fechaHasta).toBeInstanceOf(Date);
    });
  });

  describe('validaciones de productoId', () => {
    it('rechaza productoId no numérico', async () => {
      const errors = await validate(crearDto({ productoId: 'abc' as any }));

      expect(errors.some((e) => e.property === 'productoId')).toBe(true);
    });

    it('acepta productoId válido', async () => {
      const errors = await validate(crearDto({ productoId: 999 }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones de fechas', () => {
    it('rechaza fechaDesde no válida', async () => {
      const errors = await validate(crearDto({ fechaDesde: 'no-es-fecha' as any }));

      expect(errors.some((e) => e.property === 'fechaDesde')).toBe(true);
    });

    it('rechaza fechaHasta no válida', async () => {
      const errors = await validate(crearDto({ fechaHasta: 'tampoco-es-fecha' as any }));

      expect(errors.some((e) => e.property === 'fechaHasta')).toBe(true);
    });

    it('ajusta fechaHasta al final del día (23:59:59.999)', async () => {
      const dto = crearDto({ fechaHasta: '2024-12-31' as any });

      expect(dto.fechaHasta.getUTCHours()).toBe(23);
      expect(dto.fechaHasta.getUTCMinutes()).toBe(59);
      expect(dto.fechaHasta.getUTCSeconds()).toBe(59);
      expect(dto.fechaHasta.getUTCMilliseconds()).toBe(999);
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

    it('acepta take positivo', async () => {
      const errors = await validate(crearDto({ take: 50 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza take menor a 1', async () => {
      const errors = await validate(crearDto({ take: 0 }));

      expect(errors.some((e) => e.property === 'take')).toBe(true);
    });

    it('transforma skip a número', async () => {
      const dto = crearDto({ skip: '20' as any });

      expect(dto.skip).toBe(20);
    });

    it('transforma take a número', async () => {
      const dto = crearDto({ take: '100' as any });

      expect(dto.take).toBe(100);
    });
  });
});
