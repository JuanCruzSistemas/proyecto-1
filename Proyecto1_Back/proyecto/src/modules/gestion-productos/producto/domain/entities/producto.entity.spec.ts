import { Producto } from './producto.entity';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { CostoInvalidoException } from '../exceptions/costo-invalido.exception';
import { StockInvalidoException } from '../exceptions/stock-invalido.exception';
import { MargenInvalidoException } from '../exceptions/margen-invalido.exception';

describe('Producto (dominio)', () => {
  const usuario = {} as Usuario;
  const linea = Linea.create({
    denominacion: 'Aceites',
    observacion: null,
    utilizaStockMinimo: false,
    stockMinimo: 0,
    usuarioCreatedId: 1,
  });
  const marca = Marca.create({
    denominacion: 'Marca genérica',
    observacion: null,
    usuarioCreatedId: 1,
  });

  const crearProducto = (overrides: Partial<Parameters<typeof Producto.create>[0]> = {}) =>
    Producto.create({
      denominacion: 'Aceite de girasol 1.5L',
      codigoBarra: null,
      proveedor: null,
      codigoProveedor: null,
      stock: 10,
      utilizaStockMinimo: false,
      utilizaStockMinimoPorEmpresa: false,
      stockMinimo: 2,
      costo: 100,
      margen: 0.3,
      destacado: false,
      envioGratis: false,
      observacion: null,
      usuarioCreated: usuario,
      linea,
      marca,
      utilizaPack: false,
      cantidadPorPack: null,
      imagen: null,
      ubicacion: null,
      codigoReferencia: null,
      ...overrides,
    });

  describe('create()', () => {
    it('calcula el precio como costo * (1 + margen)', () => {
      const producto = crearProducto({ costo: 100, margen: 0.3 });
      expect(producto.getPrecio()).toBeCloseTo(130);
    });

    it('permite costo 0 (y por lo tanto precio 0)', () => {
      const producto = crearProducto({ costo: 0, margen: 0.5 });
      expect(producto.getCosto()).toBe(0);
      expect(producto.getPrecio()).toBe(0);
    });

    it('rechaza un costo negativo', () => {
      expect(() => crearProducto({ costo: -1 })).toThrow(CostoInvalidoException);
    });

    it('rechaza un margen fuera de [0,1]', () => {
      expect(() => crearProducto({ margen: 1.5 })).toThrow(MargenInvalidoException);
    });

    it('rechaza un stock negativo', () => {
      expect(() => crearProducto({ stock: -5 })).toThrow(StockInvalidoException);
    });

    it('nace sin id y con movimientosStock vacío', () => {
      const producto = crearProducto();
      expect(producto.getId()).toBeNull();
      expect(producto.getMovimientosStock()).toEqual([]);
    });
  });

  describe('reconstitute()', () => {
    it('rehidrata conservando el id y recalcula el precio a partir de costo/margen', () => {
      const producto = Producto.reconstitute({
        id: 42,
        denominacion: 'Producto existente',
        codigoBarra: null,
        proveedor: null,
        codigoProveedor: null,
        stock: 5,
        utilizaStockMinimo: false,
        utilizaStockMinimoPorEmpresa: false,
        stockMinimo: 1,
        costo: 200,
        margen: 0.25,
        fechaCosto: null,
        destacado: false,
        envioGratis: false,
        observacion: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: null,
        deletedAt: null,
        usuarioCreated: usuario,
        usuarioUpdated: null,
        usuarioDeleted: null,
        linea,
        marca,
        utilizaPack: false,
        cantidadPorPack: null,
        imagen: null,
        ubicacion: null,
        movimientosStock: [],
        sistema: 0,
        codigoReferencia: null,
      });

      expect(producto.getId()).toBe(42);
      expect(producto.getPrecio()).toBeCloseTo(250);
    });
  });

  describe('estaBajoMinimo()', () => {
    it('es true cuando el stock es menor al stock mínimo', () => {
      const producto = crearProducto({ stock: 1, stockMinimo: 5 });
      expect(producto.estaBajoMinimo()).toBe(true);
    });

    it('es false cuando el stock es igual o mayor al stock mínimo', () => {
      const producto = crearProducto({ stock: 5, stockMinimo: 5 });
      expect(producto.estaBajoMinimo()).toBe(false);
    });
  });

  describe('ajustarStock()', () => {
    it('incrementa el stock', () => {
      const producto = crearProducto({ stock: 10 });
      producto.ajustarStock(5, 'compra');
      expect(producto.getStock()).toBe(15);
    });

    it('decrementa el stock', () => {
      const producto = crearProducto({ stock: 10 });
      producto.ajustarStock(-4, 'venta');
      expect(producto.getStock()).toBe(6);
    });

    it('rechaza dejar el stock en negativo', () => {
      const producto = crearProducto({ stock: 3 });
      expect(() => producto.ajustarStock(-10, 'venta')).toThrow(StockInvalidoException);
      // El ajuste rechazado no debe mutar el stock previo.
      expect(producto.getStock()).toBe(3);
    });
  });

  describe('calcularPrecio()', () => {
    it('recalcula el precio si costo o margen cambiaron por otra vía', () => {
      const producto = crearProducto({ costo: 100, margen: 0.1 });
      expect(producto.getPrecio()).toBeCloseTo(110);
      producto.actualizarDatos({
        denominacion: producto.getDenominacion(),
        codigoBarra: producto.getCodigoBarra(),
        codigoProveedor: producto.getCodigoProveedor(),
        stock: producto.getStock(),
        utilizaStockMinimo: producto.getUtilizaStockMinimo(),
        utilizaStockMinimoPorEmpresa: producto.getUtilizaStockMinimoPorEmpresa(),
        stockMinimo: producto.getStockMinimo(),
        costo: 200,
        margen: 0.5,
        destacado: producto.isDestacado(),
        envioGratis: producto.hasEnvioGratis(),
        observacion: producto.getObservacion(),
        linea,
        marca,
        utilizaPack: producto.getUtilizaPack(),
        cantidadPorPack: producto.getCantidadPorPack(),
        imagen: producto.getImagen(),
        ubicacion: producto.getUbicacion(),
        codigoReferencia: producto.getCodigoReferencia(),
        usuarioUpdated: usuario,
      });
      expect(producto.getPrecio()).toBeCloseTo(300);
    });
  });
});
