import { ProductoFactory } from '../factories/producto.factory';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Presentacion } from '../../../presentacion/domain/entities/presentacion.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { CostoInvalidoException } from '../exceptions/costo-invalido.exception';
import { StockInvalidoException } from '../exceptions/stock-invalido.exception';
import { MargenInvalidoException } from '../exceptions/margen-invalido.exception';
import { MotivoRequeridoException } from '../exceptions/motivo-requerido.exception';
import { DenominacionRequeridaException } from '../exceptions/denominacion-requerida.exception';
import { PresentacionRequeridaException } from '../exceptions/presentacion-requerida.exception';
import { PrecioInvalidoException } from '../exceptions/precio-invalido.exception';

describe('Producto (dominio)', () => {
  const usuario = {} as Usuario;
  const linea = Linea.create({
    superlineaId: 1,
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
  const presentacion = Presentacion.create({
    denominacion: 'Caja x 12',
    observacion: null,
    usuarioCreatedId: 1,
  });

  const crearProducto = (overrides: Partial<Parameters<typeof ProductoFactory.create>[0]> = {}) =>
    ProductoFactory.create({
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
      presentacion,
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

    it('rechaza un costo 0 (porque el precio resultante sería 0)', () => {
      expect(() => crearProducto({ costo: 0, margen: 0.5 })).toThrow(CostoInvalidoException);
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

    it('rechaza una denominación vacía', () => {
    expect(() => crearProducto({ denominacion: '' })).toThrow(DenominacionRequeridaException);
    });

    it('nace sin id y con movimientosStock vacío', () => {
      const producto = crearProducto();
      expect(producto.getId()).toBeNull();
      expect(producto.getMovimientosStock()).toEqual([]);
    });
  });

  describe('reconstitute()', () => {
    it('rehidrata conservando el id y recalcula el precio a partir de costo/margen', () => {
      const producto = ProductoFactory.reconstitute({
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
        presentacion,
        utilizaPack: false,
        cantidadPorPack: null,
        imagen: null,
        ubicacion: null,
        movimientosStock: [],
        sistema: 0,
        codigoReferencia: null,
        denominacionEditadaManualmente: false,
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

    it('rechaza un ajuste de stock sin motivo', () => {
      const producto = crearProducto({ stock: 10 });
      expect(() => producto.ajustarStock(5, '')).toThrow(MotivoRequeridoException);
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
        presentacion: producto.getPresentacion(),
        utilizaPack: producto.getUtilizaPack(),
        cantidadPorPack: producto.getCantidadPorPack(),
        imagen: producto.getImagen(),
        ubicacion: producto.getUbicacion(),
        codigoReferencia: producto.getCodigoReferencia(),
        usuarioUpdated: usuario,
      });
      expect(producto.getPrecio()).toBeCloseTo(300);
    });

    it('vuelve a calcular el precio a partir del costo y margen actuales', () => {
      const producto = crearProducto({ costo: 100, margen: 0.3 });
      producto.actualizarPrecio(150, usuario);
      expect(producto.getPrecio()).toBeCloseTo(150);

      producto.calcularPrecio();

      expect(producto.getPrecio()).toBeCloseTo(150);
      expect(producto.getMargen()).toBeCloseTo(0.5);
    });
  });

  describe('denominación automática', () => {
    it('sin denominación la genera como "marca línea presentación"', () => {
      const producto = crearProducto({ denominacion: undefined });

      expect(producto.getDenominacion()).toBe('Marca genérica Aceites Caja x 12');
      expect(producto.getDenominacionEditadaManualmente()).toBe(false);
    });

    it('con denominación la toma como editada manualmente', () => {
      const producto = crearProducto({ denominacion: 'Nombre a mano' });

      expect(producto.getDenominacion()).toBe('Nombre a mano');
      expect(producto.getDenominacionEditadaManualmente()).toBe(true);
    });

    it('sin denominación ni presentación no puede generarla', () => {
      expect(() => crearProducto({ denominacion: undefined, presentacion: null })).toThrow(
        PresentacionRequeridaException,
      );
    });

    it('generarDenominacion() no modifica la denominación actual', () => {
      const producto = crearProducto({ denominacion: 'Nombre a mano' });

      expect(producto.generarDenominacion()).toBe('Marca genérica Aceites Caja x 12');
      expect(producto.getDenominacion()).toBe('Nombre a mano');
    });

    it('actualizarDenominacion() sin valor vuelve al modo automático', () => {
      const producto = crearProducto({ denominacion: 'Nombre a mano' });

      producto.actualizarDenominacion();

      expect(producto.getDenominacion()).toBe('Marca genérica Aceites Caja x 12');
      expect(producto.getDenominacionEditadaManualmente()).toBe(false);
    });
  });

  describe('actualizarDatos()', () => {
    const otraMarca = Marca.create({
      denominacion: 'Otra marca',
      observacion: null,
      usuarioCreatedId: 1,
    });
    const usuarioEditor = { id: 7 } as unknown as Usuario;

    const datosBase = (producto: ReturnType<typeof crearProducto>) => ({
      codigoBarra: '779000',
      codigoProveedor: 'PROV-1',
      stock: 20,
      utilizaStockMinimo: true,
      utilizaStockMinimoPorEmpresa: true,
      stockMinimo: 4,
      costo: 50,
      margen: 0.2,
      destacado: true,
      envioGratis: true,
      observacion: 'obs',
      linea,
      marca: otraMarca,
      presentacion: producto.getPresentacion(),
      utilizaPack: true,
      cantidadPorPack: 6,
      imagen: 'img.png',
      ubicacion: 'Estante A',
      codigoReferencia: 'REF-9',
      usuarioUpdated: usuarioEditor,
    });

    afterEach(() => jest.useRealTimers());

    it('actualiza todos los datos editables y la auditoría', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-10T12:00:00Z'));
      const producto = crearProducto();

      producto.actualizarDatos({ ...datosBase(producto), denominacion: 'Nuevo nombre' });

      expect(producto.getCodigoBarra()).toBe('779000');
      expect(producto.getCodigoProveedor()).toBe('PROV-1');
      expect(producto.getStock()).toBe(20);
      expect(producto.getUtilizaStockMinimo()).toBe(true);
      expect(producto.getUtilizaStockMinimoPorEmpresa()).toBe(true);
      expect(producto.getStockMinimo()).toBe(4);
      expect(producto.getCosto()).toBe(50);
      expect(producto.getMargen()).toBe(0.2);
      expect(producto.getPrecio()).toBeCloseTo(60);
      expect(producto.getFechaCosto()).toEqual(new Date('2026-05-10T12:00:00Z'));
      expect(producto.isDestacado()).toBe(true);
      expect(producto.hasEnvioGratis()).toBe(true);
      expect(producto.getObservacion()).toBe('obs');
      expect(producto.getLinea()).toBe(linea);
      expect(producto.getMarca()).toBe(otraMarca);
      expect(producto.getUtilizaPack()).toBe(true);
      expect(producto.getCantidadPorPack()).toBe(6);
      expect(producto.getImagen()).toBe('img.png');
      expect(producto.getUbicacion()).toBe('Estante A');
      expect(producto.getCodigoReferencia()).toBe('REF-9');
      expect(producto.getUsuarioUpdated()).toBe(usuarioEditor);
      expect(producto.getUpdatedAt()).toEqual(new Date('2026-05-10T12:00:00Z'));
      expect(producto.getDenominacion()).toBe('Nuevo nombre');
      expect(producto.getDenominacionEditadaManualmente()).toBe(true);
    });

    it('sin denominación y en modo automático la regenera con la nueva marca', () => {
      const producto = crearProducto({ denominacion: undefined });

      producto.actualizarDatos(datosBase(producto));

      expect(producto.getDenominacion()).toBe('Otra marca Aceites Caja x 12');
      expect(producto.getDenominacionEditadaManualmente()).toBe(false);
    });

    it('sin denominación conserva la que se editó manualmente', () => {
      const producto = crearProducto({ denominacion: 'Nombre a mano' });

      producto.actualizarDatos(datosBase(producto));

      expect(producto.getDenominacion()).toBe('Nombre a mano');
      expect(producto.getDenominacionEditadaManualmente()).toBe(true);
    });

    it('rechaza una denominación en blanco sin modificar el producto', () => {
      const producto = crearProducto({ costo: 100 });

      expect(() => producto.actualizarDatos({ ...datosBase(producto), denominacion: '   ' })).toThrow(
        DenominacionRequeridaException,
      );
      expect(producto.getCosto()).toBe(100);
      expect(producto.getUpdatedAt()).toBeNull();
    });

    it('rechaza un margen inválido sin modificar el producto', () => {
      const producto = crearProducto({ margen: 0.3 });

      expect(() => producto.actualizarDatos({ ...datosBase(producto), margen: 2 })).toThrow(
        MargenInvalidoException,
      );
      expect(producto.getMargen()).toBe(0.3);
    });

    it('rechaza un costo inválido', () => {
      const producto = crearProducto();
      expect(() => producto.actualizarDatos({ ...datosBase(producto), costo: 0 })).toThrow(
        CostoInvalidoException,
      );
    });

    it('rechaza un stock negativo', () => {
      const producto = crearProducto();
      expect(() => producto.actualizarDatos({ ...datosBase(producto), stock: -1 })).toThrow(
        StockInvalidoException,
      );
    });
  });

  describe('actualizarPrecio()', () => {
    const usuarioEditor = { id: 3 } as unknown as Usuario;

    afterEach(() => jest.useRealTimers());

    it('fija el precio y recalcula el margen como precio / costo - 1', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-01T00:00:00Z'));
      const producto = crearProducto({ costo: 100, margen: 0.1 });

      producto.actualizarPrecio(145, usuarioEditor);

      expect(producto.getPrecio()).toBe(145);
      expect(producto.getMargen()).toBeCloseTo(0.45);
      expect(producto.getCosto()).toBe(100);
      expect(producto.getUsuarioUpdated()).toBe(usuarioEditor);
      expect(producto.getUpdatedAt()).toEqual(new Date('2026-06-01T00:00:00Z'));
    });

    it('permite un precio igual al costo (margen 0)', () => {
      const producto = crearProducto({ costo: 100 });
      producto.actualizarPrecio(100, usuarioEditor);
      expect(producto.getMargen()).toBe(0);
    });

    it('rechaza un precio menor al costo (margen negativo) sin mutar', () => {
      const producto = crearProducto({ costo: 100, margen: 0.3 });

      expect(() => producto.actualizarPrecio(90, usuarioEditor)).toThrow(MargenInvalidoException);
      expect(producto.getPrecio()).toBeCloseTo(130);
      expect(producto.getMargen()).toBe(0.3);
      expect(producto.getUsuarioUpdated()).toBeNull();
    });

    it('rechaza un precio que implica un margen mayor al 100%', () => {
      const producto = crearProducto({ costo: 100 });
      expect(() => producto.actualizarPrecio(201, usuarioEditor)).toThrow(MargenInvalidoException);
    });

    describe('con costo 0 (dato heredado de persistencia)', () => {
      // Costo.create() no admite 0, así que se fuerza el estado para cubrir la guarda.
      const conCostoCero = () => {
        const producto = crearProducto({ margen: 0.3 });
        (producto as any).costo = { getValue: () => 0 };
        return producto;
      };

      it('rechaza un precio distinto de 0', () => {
        expect(() => conCostoCero().actualizarPrecio(50, usuarioEditor)).toThrow(
          MargenInvalidoException,
        );
      });

      it('con precio 0 conserva el margen pero el precio es inválido', () => {
        const producto = conCostoCero();
        expect(() => producto.actualizarPrecio(0, usuarioEditor)).toThrow(PrecioInvalidoException);
        expect(producto.getMargen()).toBe(0.3);
      });
    });
  });

  describe('marcarComoEliminado()', () => {
    afterEach(() => jest.useRealTimers());

    it('registra la fecha y el usuario de la baja', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-07-01T10:00:00Z'));
      const producto = crearProducto();
      const usuarioBaja = { id: 9 } as unknown as Usuario;

      producto.marcarComoEliminado(usuarioBaja);

      expect(producto.getDeletedAt()).toEqual(new Date('2026-07-01T10:00:00Z'));
      expect(producto.getUsuarioDeleted()).toBe(usuarioBaja);
    });
  });
});
