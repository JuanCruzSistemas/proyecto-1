import { getMetadataArgsStorage } from 'typeorm';
import { MovimientoStockOrmMapper } from './movimiento-stock.mapper';
import { MovimientoStockEntity } from '../entities/movimiento-stock.orm-entity';
import { ProductoEntity } from '../../../../producto/infraestructure/persistence/entities/producto.orm-entity';

describe('MovimientoStockOrmMapper', () => {
  const fila = (overrides: Partial<MovimientoStockEntity> = {}) =>
    Object.assign(new MovimientoStockEntity(), {
      id: 1,
      producto: { id: 100 } as ProductoEntity,
      operacionId: 5,
      tipoOperacion: 'venta-producto',
      creadoEn: new Date('2026-01-01'),
      ...overrides,
    });

  it('toDomain() toma el id del producto relacionado', () => {
    const movimiento = MovimientoStockOrmMapper.toDomain(fila());

    expect(movimiento.getId()).toBe(1);
    expect(movimiento.getProductoId()).toBe(100);
    expect(movimiento.getOperacionId()).toBe(5);
    expect(movimiento.getTipoOperacion()).toBe('venta-producto');
    expect(movimiento.getCreadoEn()).toEqual(new Date('2026-01-01'));
  });

  it('toDomain() tolera que la relación producto no esté cargada', () => {
    expect(MovimientoStockOrmMapper.toDomain(fila({ producto: undefined as any })).getProductoId()).toBeUndefined();
  });
});

describe('MovimientoStockEntity (ORM)', () => {
  const storage = getMetadataArgsStorage();

  it('se mapea a la tabla "producto_operacion" con sus columnas', () => {
    expect(storage.tables.find((t) => t.target === MovimientoStockEntity)?.name).toBe('producto_operacion');
    const columnas = storage.columns.filter((c) => c.target === MovimientoStockEntity);
    expect(columnas.map((c) => c.propertyName)).toEqual(expect.arrayContaining(['id', 'operacionId', 'tipoOperacion', 'creadoEn']));
    const creadoEn = columnas.find((c) => c.propertyName === 'creadoEn')!;
    expect((creadoEn.options.default as () => string)()).toBe('CURRENT_TIMESTAMP');
  });

  it('pertenece a un producto (many-to-one, eager) con relación inversa movimientosStock', () => {
    const relacion = storage.relations.find((r) => r.target === MovimientoStockEntity && r.propertyName === 'producto')!;

    expect(relacion.relationType).toBe('many-to-one');
    expect((relacion.type as () => Function)()).toBe(ProductoEntity);
    expect((relacion.inverseSideProperty as (p: any) => unknown)({ movimientosStock: 'inversa' })).toBe('inversa');
    expect(relacion.options.eager).toBe(true);
  });
});
