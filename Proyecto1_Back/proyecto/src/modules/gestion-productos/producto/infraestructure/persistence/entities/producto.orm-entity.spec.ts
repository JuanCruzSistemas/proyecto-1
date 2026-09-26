import { getMetadataArgsStorage } from 'typeorm';
import { ProductoEntity } from './producto.orm-entity';
import { HistorialPrecioOrmEntity } from './historial-precio-orm.entity';

/** Verifica el mapeo TypeORM declarado con decoradores (tabla, columnas y relaciones). */
const metadataDe = (entidad: Function) => {
  const storage = getMetadataArgsStorage();
  return {
    tabla: storage.tables.find((t) => t.target === entidad),
    columnas: storage.columns.filter((c) => c.target === entidad),
    relaciones: storage.relations.filter((r) => r.target === entidad),
    joinColumns: storage.joinColumns.filter((j) => j.target === entidad),
  };
};

/** Ejecuta las funciones de tipo e inversa de cada relación para validar que apuntan a clases reales. */
const resolverRelaciones = (relaciones: ReturnType<typeof metadataDe>['relaciones']) =>
  Object.fromEntries(
    relaciones.map((r) => {
      const tipo = (r.type as () => Function)();
      if (typeof r.inverseSideProperty === 'function') {
        (r.inverseSideProperty as (o: any) => unknown)(new Proxy({}, { get: () => 'inversa' }));
      }
      return [r.propertyName, { tipo, relacion: r.relationType, eager: r.options.eager ?? false }];
    }),
  );

describe('Entidades ORM de Producto', () => {
  describe('ProductoEntity', () => {
    const md = metadataDe(ProductoEntity);

    it('se mapea a la tabla "producto"', () => {
      expect(md.tabla?.name).toBe('producto');
    });

    it('declara las columnas de negocio', () => {
      const nombres = md.columnas.map((c) => c.propertyName);
      expect(nombres).toEqual(
        expect.arrayContaining([
          'id', 'denominacion', 'codigoProveedor', 'codigoBarra', 'stock', 'stockMinimo', 'costo', 'precio',
          'porcentaje', 'denominacionEditadaManualmente', 'utilizaPack', 'cantidadPorPack', 'sistema', 'deletedAt',
        ]),
      );
    });

    it('relaciona línea, marca, presentación, proveedor, usuarios y movimientos', () => {
      const rel = resolverRelaciones(md.relaciones);

      expect(rel.linea.relacion).toBe('many-to-one');
      expect(rel.marca.relacion).toBe('many-to-one');
      expect(rel.presentacion.relacion).toBe('many-to-one');
      expect(rel.proveedor.eager).toBe(true);
      expect(rel.movimientosStock.relacion).toBe('one-to-many');
      expect(Object.keys(rel)).toEqual(expect.arrayContaining(['usuarioCreated', 'usuarioUpdated', 'usuarioDeleted']));
    });
  });

  describe('HistorialPrecioOrmEntity', () => {
    const md = metadataDe(HistorialPrecioOrmEntity);

    it('se mapea a la tabla "historial_precio" con sus índices', () => {
      expect(md.tabla?.name).toBe('historial_precio');
      const indices = getMetadataArgsStorage().indices.filter((i) => i.target === HistorialPrecioOrmEntity).map((i) => i.name);
      expect(indices).toEqual(expect.arrayContaining(['idx_historial_producto', 'idx_historial_fecha']));
    });

    it('guarda precios, costos, márgenes y motivo del cambio', () => {
      const nombres = md.columnas.map((c) => c.propertyName);
      expect(nombres).toEqual(
        expect.arrayContaining(['precioAnterior', 'precioNuevo', 'costoAnterior', 'costoNuevo', 'margenAnterior', 'margenNuevo', 'motivo', 'fecha', 'productoId', 'usuarioId']),
      );
      const fecha = md.columnas.find((c) => c.propertyName === 'fecha')!;
      expect((fecha.options.default as () => string)()).toBe('CURRENT_TIMESTAMP');
    });

    it('relaciona producto y usuario (eager) con sus columnas FK', () => {
      const rel = resolverRelaciones(md.relaciones);

      expect(rel.producto).toEqual({ tipo: ProductoEntity, relacion: 'many-to-one', eager: true });
      expect(rel.usuario.eager).toBe(true);
      expect(md.joinColumns.map((j) => j.name)).toEqual(expect.arrayContaining(['producto_id', 'usuario_id']));
    });
  });
});
