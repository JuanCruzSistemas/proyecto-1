import { ProductoFactory } from './producto.factory';
import { Producto } from '../entities/producto.entity';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Presentacion } from '../../../presentacion/domain/entities/presentacion.entity';
import { MovimientoStock } from '../../../movimiento-stock/domain/entities/movimiento-stock.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';
import { ProductoCreateParams, ProductoReconstituteParams } from '../inputs/producto.types';
import { CostoInvalidoException } from '../exceptions/costo-invalido.exception';
import { MargenInvalidoException } from '../exceptions/margen-invalido.exception';
import { StockInvalidoException } from '../exceptions/stock-invalido.exception';
import { DenominacionRequeridaException } from '../exceptions/denominacion-requerida.exception';
import { PresentacionRequeridaException } from '../exceptions/presentacion-requerida.exception';

describe('ProductoFactory', () => {
  const usuarioCreador = { id: 1 } as unknown as Usuario;
  const usuarioEditor = { id: 2 } as unknown as Usuario;
  const usuarioBaja = { id: 3 } as unknown as Usuario;
  const proveedor = { id: 5 } as unknown as Proveedor;

  const linea = Linea.create({
    superlineaId: 1,
    denominacion: 'Filtros',
    observacion: null,
    utilizaStockMinimo: false,
    stockMinimo: 0,
    usuarioCreatedId: 1,
  });
  const marca = Marca.create({ denominacion: 'Iveco', observacion: null, usuarioCreatedId: 1 });
  const presentacion = Presentacion.create({ denominacion: 'Unidad', observacion: null, usuarioCreatedId: 1 });

  const createParams = (overrides: Partial<ProductoCreateParams> = {}): ProductoCreateParams => ({
    denominacion: 'Filtro de aceite',
    codigoBarra: '7790001',
    proveedor,
    codigoProveedor: 'FA-10',
    stock: 8,
    utilizaStockMinimo: true,
    utilizaStockMinimoPorEmpresa: false,
    stockMinimo: 2,
    costo: 1000,
    margen: 0.4,
    destacado: true,
    envioGratis: false,
    observacion: 'Observación',
    usuarioCreated: usuarioCreador,
    linea,
    marca,
    presentacion,
    utilizaPack: true,
    cantidadPorPack: 12,
    imagen: 'filtro.png',
    ubicacion: 'Depósito 1',
    codigoReferencia: 'REF-1',
    ...overrides,
  });

  describe('create()', () => {
    afterEach(() => jest.useRealTimers());

    it('crea un Producto nuevo con todos los datos recibidos', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-15T09:00:00Z'));

      const producto = ProductoFactory.create(createParams());

      expect(producto).toBeInstanceOf(Producto);
      expect(producto.getId()).toBeNull();
      expect(producto.getDenominacion()).toBe('Filtro de aceite');
      expect(producto.getDenominacionEditadaManualmente()).toBe(true);
      expect(producto.getCodigoBarra()).toBe('7790001');
      expect(producto.getProveedor()).toBe(proveedor);
      expect(producto.getCodigoProveedor()).toBe('FA-10');
      expect(producto.getStock()).toBe(8);
      expect(producto.getUtilizaStockMinimo()).toBe(true);
      expect(producto.getUtilizaStockMinimoPorEmpresa()).toBe(false);
      expect(producto.getStockMinimo()).toBe(2);
      expect(producto.getCosto()).toBe(1000);
      expect(producto.getMargen()).toBe(0.4);
      expect(producto.getPrecio()).toBeCloseTo(1400);
      expect(producto.isDestacado()).toBe(true);
      expect(producto.hasEnvioGratis()).toBe(false);
      expect(producto.getObservacion()).toBe('Observación');
      expect(producto.getLinea()).toBe(linea);
      expect(producto.getMarca()).toBe(marca);
      expect(producto.getPresentacion()).toBe(presentacion);
      expect(producto.getUtilizaPack()).toBe(true);
      expect(producto.getCantidadPorPack()).toBe(12);
      expect(producto.getImagen()).toBe('filtro.png');
      expect(producto.getUbicacion()).toBe('Depósito 1');
      expect(producto.getCodigoReferencia()).toBe('REF-1');
    });

    it('inicializa la auditoría y los valores por defecto', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-03-15T09:00:00Z'));

      const producto = ProductoFactory.create(createParams());

      expect(producto.getCreatedAt()).toEqual(new Date('2026-03-15T09:00:00Z'));
      expect(producto.getFechaCosto()).toEqual(new Date('2026-03-15T09:00:00Z'));
      expect(producto.getUpdatedAt()).toBeNull();
      expect(producto.getDeletedAt()).toBeNull();
      expect(producto.getUsuarioCreated()).toBe(usuarioCreador);
      expect(producto.getUsuarioUpdated()).toBeNull();
      expect(producto.getUsuarioDeleted()).toBeNull();
      expect(producto.getMovimientosStock()).toEqual([]);
      expect(producto.getSistema()).toBe(0);
    });

    it('sin denominación la autogenera y la deja en modo automático', () => {
      const producto = ProductoFactory.create(createParams({ denominacion: undefined }));

      expect(producto.getDenominacion()).toBe('Iveco Filtros Unidad');
      expect(producto.getDenominacionEditadaManualmente()).toBe(false);
    });

    it('rechaza una denominación compuesta solo por espacios', () => {
      expect(() => ProductoFactory.create(createParams({ denominacion: '   ' }))).toThrow(
        DenominacionRequeridaException,
      );
    });

    it('sin denominación y sin presentación no puede autogenerarla', () => {
      expect(() =>
        ProductoFactory.create(createParams({ denominacion: undefined, presentacion: null })),
      ).toThrow(PresentacionRequeridaException);
    });

    it('con denominación explícita admite no tener presentación', () => {
      const producto = ProductoFactory.create(createParams({ presentacion: null }));
      expect(producto.getPresentacion()).toBeNull();
      expect(producto.getDenominacion()).toBe('Filtro de aceite');
    });

    it.each([
      ['costo 0', { costo: 0 }, CostoInvalidoException],
      ['costo negativo', { costo: -10 }, CostoInvalidoException],
      ['margen negativo', { margen: -0.01 }, MargenInvalidoException],
      ['margen mayor a 1', { margen: 1.01 }, MargenInvalidoException],
      ['stock negativo', { stock: -1 }, StockInvalidoException],
      ['stock mínimo negativo', { stockMinimo: -1 }, StockInvalidoException],
    ])('rechaza %s', (_caso, overrides, excepcion) => {
      expect(() => ProductoFactory.create(createParams(overrides))).toThrow(excepcion);
    });
  });

  describe('reconstitute()', () => {
    const movimientos = [{ id: 1 }] as unknown as MovimientoStock[];

    const reconstituteParams = (
      overrides: Partial<ProductoReconstituteParams> = {},
    ): ProductoReconstituteParams => ({
      id: 77,
      denominacion: 'Filtro persistido',
      codigoBarra: '123',
      proveedor,
      codigoProveedor: 'P-77',
      stock: 3,
      utilizaStockMinimo: true,
      utilizaStockMinimoPorEmpresa: true,
      stockMinimo: 1,
      costo: 200,
      margen: 0.5,
      fechaCosto: new Date('2025-12-01'),
      destacado: false,
      envioGratis: true,
      observacion: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-06-01'),
      deletedAt: new Date('2025-09-01'),
      usuarioCreated: usuarioCreador,
      usuarioUpdated: usuarioEditor,
      usuarioDeleted: usuarioBaja,
      linea,
      marca,
      presentacion: null,
      utilizaPack: false,
      cantidadPorPack: null,
      imagen: null,
      ubicacion: null,
      movimientosStock: movimientos,
      sistema: 1,
      codigoReferencia: 'R-77',
      denominacionEditadaManualmente: true,
      ...overrides,
    });

    it('rehidrata exactamente el estado persistido', () => {
      const producto = ProductoFactory.reconstitute(reconstituteParams());

      expect(producto.getId()).toBe(77);
      expect(producto.getDenominacion()).toBe('Filtro persistido');
      expect(producto.getCodigoBarra()).toBe('123');
      expect(producto.getProveedor()).toBe(proveedor);
      expect(producto.getCodigoProveedor()).toBe('P-77');
      expect(producto.getStock()).toBe(3);
      expect(producto.getUtilizaStockMinimo()).toBe(true);
      expect(producto.getUtilizaStockMinimoPorEmpresa()).toBe(true);
      expect(producto.getStockMinimo()).toBe(1);
      expect(producto.getCosto()).toBe(200);
      expect(producto.getMargen()).toBe(0.5);
      expect(producto.getPrecio()).toBeCloseTo(300);
      expect(producto.getFechaCosto()).toEqual(new Date('2025-12-01'));
      expect(producto.isDestacado()).toBe(false);
      expect(producto.hasEnvioGratis()).toBe(true);
      expect(producto.getObservacion()).toBeNull();
      expect(producto.getCreatedAt()).toEqual(new Date('2025-01-01'));
      expect(producto.getUpdatedAt()).toEqual(new Date('2025-06-01'));
      expect(producto.getDeletedAt()).toEqual(new Date('2025-09-01'));
      expect(producto.getUsuarioCreated()).toBe(usuarioCreador);
      expect(producto.getUsuarioUpdated()).toBe(usuarioEditor);
      expect(producto.getUsuarioDeleted()).toBe(usuarioBaja);
      expect(producto.getLinea()).toBe(linea);
      expect(producto.getMarca()).toBe(marca);
      expect(producto.getPresentacion()).toBeNull();
      expect(producto.getMovimientosStock()).toBe(movimientos);
      expect(producto.getSistema()).toBe(1);
      expect(producto.getCodigoReferencia()).toBe('R-77');
      expect(producto.getDenominacionEditadaManualmente()).toBe(true);
    });

    it('no regenera la denominación aunque no haya presentación', () => {
      const producto = ProductoFactory.reconstitute(
        reconstituteParams({ denominacionEditadaManualmente: false }),
      );
      expect(producto.getDenominacion()).toBe('Filtro persistido');
    });

    it('si no hay fechaCosto persistida usa la fecha actual', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-08T08:00:00Z'));
      try {
        const producto = ProductoFactory.reconstitute(reconstituteParams({ fechaCosto: null }));
        expect(producto.getFechaCosto()).toEqual(new Date('2026-08-08T08:00:00Z'));
      } finally {
        jest.useRealTimers();
      }
    });

    it('aplica los valores por defecto cuando la fila persistida trae flags nulos', () => {
      const producto = ProductoFactory.reconstitute(
        reconstituteParams({
          utilizaStockMinimo: undefined,
          utilizaStockMinimoPorEmpresa: undefined,
          destacado: undefined,
          envioGratis: undefined,
          utilizaPack: undefined,
          sistema: undefined,
          denominacionEditadaManualmente: undefined,
        } as unknown as Partial<ProductoReconstituteParams>),
      );

      expect(producto.getUtilizaStockMinimo()).toBe(false);
      expect(producto.getUtilizaStockMinimoPorEmpresa()).toBe(false);
      expect(producto.isDestacado()).toBe(false);
      expect(producto.hasEnvioGratis()).toBe(false);
      expect(producto.getUtilizaPack()).toBe(false);
      expect(producto.getSistema()).toBe(0);
      expect(producto.getDenominacionEditadaManualmente()).toBe(false);
    });

    it('valida los value objects también al rehidratar', () => {
      expect(() => ProductoFactory.reconstitute(reconstituteParams({ costo: 0 }))).toThrow(
        CostoInvalidoException,
      );
      expect(() => ProductoFactory.reconstitute(reconstituteParams({ stock: -2 }))).toThrow(
        StockInvalidoException,
      );
    });
  });
});
