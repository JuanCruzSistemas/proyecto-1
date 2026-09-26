import { ProductoMapper } from './producto.mapper';
import { ProductoEntity } from '../entities/producto.orm-entity';
import { MovimientoStockEntity } from '../../../../movimiento-stock/infraestructure/persistence/entities/movimiento-stock.orm-entity';
import {
  crearProducto,
  crearProductoOrm,
  crearUsuario,
} from '../../../testing/producto.fixtures-spec';

describe('ProductoMapper (ORM)', () => {
  describe('toDomain()', () => {
    it('reconstituye el producto convirtiendo el porcentaje a fracción', () => {
      const producto = ProductoMapper.toDomain(crearProductoOrm({ costo: 200, porcentaje: 25 }));

      expect(producto.getId()).toBe(100);
      expect(producto.getMargen()).toBe(0.25);
      expect(producto.getPrecio()).toBe(250); // recalculado desde costo y margen, no leído de la fila
      expect(producto.getLinea().getDenominacion()).toBe('ACEITES');
      expect(producto.getMarca().getDenominacion()).toBe('NATURA');
      expect(producto.getPresentacion()!.getDenominacion()).toBe('1L');
    });

    it('completa con valores por defecto las columnas nulas', () => {
      const producto = ProductoMapper.toDomain(
        crearProductoOrm({
          codigoBarra: undefined,
          codigoProveedor: undefined,
          stock: undefined as any,
          stockMinimo: undefined as any,
          porcentaje: undefined,
          fechaCosto: undefined,
          destacado: undefined,
          envioGratis: undefined,
          presentacion: null,
          cantidadPorPack: null,
          movimientosStock: undefined as any,
          denominacionEditadaManualmente: undefined as any,
        }),
      );

      expect(producto.getCodigoBarra()).toBeNull();
      expect(producto.getCodigoProveedor()).toBeNull();
      expect(producto.getStock()).toBe(0);
      expect(producto.getStockMinimo()).toBe(0);
      expect(producto.getMargen()).toBe(0);
      expect(producto.isDestacado()).toBe(false);
      expect(producto.hasEnvioGratis()).toBe(false);
      expect(producto.getPresentacion()).toBeNull();
      expect(producto.getMovimientosStock()).toEqual([]);
      expect(producto.getDenominacionEditadaManualmente()).toBe(false);
    });

    it('mapea los movimientos de stock asociados', () => {
      const movimiento = Object.assign(new MovimientoStockEntity(), {
        id: 1,
        producto: { id: 100 },
        operacionId: 5,
        tipoOperacion: 'venta',
        creadoEn: new Date('2026-01-01'),
      });

      const producto = ProductoMapper.toDomain(crearProductoOrm({ movimientosStock: [movimiento] }));

      expect(producto.getMovimientosStock()[0].getTipoOperacion()).toBe('venta');
    });
  });

  describe('toOrm()', () => {
    it('vuelca el dominio a la fila, con el margen en porcentaje y referencias livianas', () => {
      const orm = ProductoMapper.toOrm(crearProducto({ margen: 0.3, costo: 100 }));

      expect(orm).toBeInstanceOf(ProductoEntity);
      expect(orm.id).toBe(100);
      expect(orm.porcentaje).toBeCloseTo(30);
      expect(orm.precio).toBeCloseTo(130);
      expect(orm.linea).toEqual({ id: 10 });
      expect(orm.marca).toEqual({ id: 20 });
      expect(orm.presentacion).toEqual({ id: 30 });
      expect(orm.denominacionEditadaManualmente).toBe(false);
    });

    it('no asigna id, usuarios de edición/baja ni deletedAt si no corresponden', () => {
      const orm = ProductoMapper.toOrm(crearProducto({ id: null as any }));

      expect(orm).not.toHaveProperty('id');
      expect(orm).not.toHaveProperty('usuarioUpdated');
      expect(orm).not.toHaveProperty('usuarioDeleted');
      expect(orm).not.toHaveProperty('deletedAt');
      expect(orm).not.toHaveProperty('proveedor');
      expect(orm.codigoReferencia).toBeUndefined();
    });

    it('incluye auditoría, baja, proveedor y presentación nula cuando existen', () => {
      const deletedAt = new Date('2026-05-01');
      const proveedor = { id: 7 } as any;
      const orm = ProductoMapper.toOrm(
        crearProducto({
          usuarioUpdated: crearUsuario(2),
          usuarioDeleted: crearUsuario(3),
          deletedAt,
          proveedor,
          presentacion: null,
          denominacionEditadaManualmente: true,
        }),
      );

      expect(orm.usuarioUpdated).toEqual(crearUsuario(2));
      expect(orm.usuarioDeleted).toEqual(crearUsuario(3));
      expect(orm.deletedAt).toBe(deletedAt);
      expect(orm.proveedor).toBe(proveedor);
      expect(orm.presentacion).toBeNull();
      expect(orm.denominacionEditadaManualmente).toBe(true);
    });

    it('reutiliza la instancia target cuando se pasa (UPDATE)', () => {
      const target = crearProductoOrm();

      expect(ProductoMapper.toOrm(crearProducto({ stock: 77 }), target)).toBe(target);
      expect(target.stock).toBe(77);
    });
  });

  describe('toBusquedaDto()', () => {
    it('arma el DTO de búsqueda con "código - denominación"', () => {
      expect(ProductoMapper.toBusquedaDto(crearProducto())).toMatchObject({
        id: 100,
        codigoProveedorDenominacion: 'NAT-1 - NATURA ACEITES 1L',
        proveedor: '',
        precio: 130,
        cantidadPorPack: 0,
        codigoReferencia: '',
      });
    });

    it('un producto sin id ni opcionales usa 0 y strings vacíos', () => {
      const dto = ProductoMapper.toBusquedaDto(
        crearProducto({ id: null as any, observacion: null, codigoProveedor: null, ubicacion: null, cantidadPorPack: 6, codigoReferencia: 'R' }),
      );

      expect(dto).toMatchObject({ id: 0, observacion: '', codigoProveedor: '', ubicacion: '', cantidadPorPack: 6, codigoReferencia: 'R' });
    });
  });

  describe('toDto()', () => {
    it('arma el DTO completo con referencias y margen en porcentaje', () => {
      const dto = ProductoMapper.toDto(crearProducto({ observacion: 'obs', ubicacion: 'A1', cantidadPorPack: 12, codigoReferencia: 'R1' }));

      expect(dto).toMatchObject({
        id: 100,
        porcentaje: 30,
        observacion: 'obs',
        ubicacion: 'A1',
        cantidadPorPack: 12,
        codigoReferencia: 'R1',
        linea: { id: 10, denominacion: 'ACEITES' },
        marca: { id: 20, denominacion: 'NATURA' },
        presentacion: { id: 30, denominacion: '1L' },
      });
    });

    it('sin presentación ni opcionales devuelve null y strings vacíos', () => {
      const dto = ProductoMapper.toDto(
        crearProducto({ id: null as any, presentacion: null, codigoBarra: null, codigoProveedor: null, denominacionEditadaManualmente: true }),
      );

      expect(dto).toMatchObject({ id: 0, presentacion: null, codigoBarra: '', codigoProveedor: '', cantidadPorPack: 0, observacion: '' });
    });
  });
});
