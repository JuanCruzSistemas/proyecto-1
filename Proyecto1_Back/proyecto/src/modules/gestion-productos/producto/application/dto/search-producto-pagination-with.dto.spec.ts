import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SearchProductoPaginationWithDto } from './search-producto-pagination-with.dto';

describe('SearchProductoPaginationWithDto', () => {
  const crearDto = (overrides: Partial<SearchProductoPaginationWithDto> = {}) =>
    plainToClass(SearchProductoPaginationWithDto, {
      skip: 0,
      take: 10,
      codProveedorExacto: false,
      codReferenciaExacto: false,
      ...overrides,
    });

  describe('validaciones básicas', () => {
    it('acepta un DTO válido con valores por defecto', async () => {
      const errors = await validate(crearDto());

      expect(errors).toHaveLength(0);
    });

    it('acepta todos los campos opcionales definidos', async () => {
      const errors = await validate(
        crearDto({
          lineaDenominacion: 'Aceites',
          superlineaDenominacion: 'Lubricantes',
          denominacion: 'Producto Test',
          codigoProveedor: 'CP001',
          codigoReferencia: 'REF001',
          marcaId: 1,
          lineaId: 2,
          proveedorId: 3,
          conStock: true,
        }),
      );

      expect(errors).toHaveLength(0);
    });
  });

  describe('transformación de campos string', () => {
    it('elimina espacios en blanco de lineaDenominacion', async () => {
      const dto = crearDto({ lineaDenominacion: '  Aceites  ' });

      expect(dto.lineaDenominacion).toBe('Aceites');
    });

    it('elimina espacios en blanco de superlineaDenominacion', async () => {
      const dto = crearDto({ superlineaDenominacion: '  Lubricantes  ' });

      expect(dto.superlineaDenominacion).toBe('Lubricantes');
    });

    it('acepta denominacion sin transformación de trim', async () => {
      const errors = await validate(crearDto({ denominacion: 'Test Producto' }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('validaciones de paginación', () => {
    it('acepta skip en 0', async () => {
      const errors = await validate(crearDto({ skip: 0 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza skip negativo', async () => {
      const errors = await validate(crearDto({ skip: -10 }));

      expect(errors.some((e) => e.property === 'skip')).toBe(true);
    });

    it('acepta take mayor a 0', async () => {
      const errors = await validate(crearDto({ take: 50 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza take menor o igual a 0', async () => {
      const errors = await validate(crearDto({ take: 0 }));

      expect(errors.some((e) => e.property === 'take')).toBe(true);
    });

    it('transforma skip de string a número', async () => {
      const dto = crearDto({ skip: '20' as any });

      expect(dto.skip).toBe(20);
    });

    it('transforma take de string a número', async () => {
      const dto = crearDto({ take: '100' as any });

      expect(dto.take).toBe(100);
    });
  });

  describe('validaciones de IDs opcionales', () => {
    it('acepta marcaId válido', async () => {
      const errors = await validate(crearDto({ marcaId: 5 }));

      expect(errors).toHaveLength(0);
    });

    it('rechaza marcaId no numérico', async () => {
      const errors = await validate(crearDto({ marcaId: 'abc' as any }));

      expect(errors.some((e) => e.property === 'marcaId')).toBe(true);
    });

    it('acepta lineaId válido', async () => {
      const errors = await validate(crearDto({ lineaId: 10 }));

      expect(errors).toHaveLength(0);
    });

    it('acepta proveedorId válido', async () => {
      const errors = await validate(crearDto({ proveedorId: 15 }));

      expect(errors).toHaveLength(0);
    });

    it('transforma IDs de string a número', async () => {
      const dto = crearDto({
        marcaId: '5' as any,
        lineaId: '10' as any,
        proveedorId: '15' as any,
      });

      expect(dto.marcaId).toBe(5);
      expect(dto.lineaId).toBe(10);
      expect(dto.proveedorId).toBe(15);
    });
  });

  describe('validaciones de flags booleanos', () => {
    it('transforma "true" string a booleano true', async () => {
      const dto = crearDto({ codProveedorExacto: 'true' as any });

      expect(dto.codProveedorExacto).toBe(true);
    });

    it('transforma "false" string a booleano false', async () => {
      const dto = crearDto({ codProveedorExacto: 'false' as any });

      expect(dto.codProveedorExacto).toBe(false);
    });

    it('transforma "true" string a booleano true para codReferenciaExacto', async () => {
      const dto = crearDto({ codReferenciaExacto: 'true' as any });

      expect(dto.codReferenciaExacto).toBe(true);
    });

    it('transforma "true" string a booleano true para conStock', async () => {
      const dto = crearDto({ conStock: 'true' as any });

      expect(dto.conStock).toBe(true);
    });

    it('acepta conStock como booleano directo', async () => {
      const errors = await validate(crearDto({ conStock: true }));

      expect(errors).toHaveLength(0);
    });
  });

  describe('campos opcionales', () => {
    it('acepta DTO sin campos opcionales', async () => {
      const errors = await validate(
        crearDto({
          lineaDenominacion: undefined,
          denominacion: undefined,
          codigoProveedor: undefined,
          marcaId: undefined,
        }),
      );

      expect(errors).toHaveLength(0);
    });
  });
});
