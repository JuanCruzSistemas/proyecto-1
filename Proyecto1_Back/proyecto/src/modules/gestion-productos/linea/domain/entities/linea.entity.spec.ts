import { Linea } from './linea.entity';
import { DenominacionRequeridaException } from '../exceptions/denominacion-requerida.exception';
import { StockMinimoInvalidoException } from '../exceptions/stock-minimo-invalido.exception';

describe('Linea (dominio)', () => {
  describe('create()', () => {
    it('crea una línea válida con denominación y stockMinimo correcto', () => {
      const linea = Linea.create({
        denominacion: 'Aceites',
        observacion: null,
        utilizaStockMinimo: true,
        stockMinimo: 10,
        usuarioCreatedId: 1,
      });

      expect(linea.getDenominacion()).toBe('Aceites');
      expect(linea.getStockMinimo()).toBe(10);
      expect(linea.getUtilizaStockMinimo()).toBe(true);
      expect(linea.getId()).toBeNull();
    });

    it('permite stockMinimo igual a 0', () => {
      const linea = Linea.create({
        denominacion: 'Lácteos',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 0,
        usuarioCreatedId: 1,
      });

      expect(linea.getStockMinimo()).toBe(0);
    });

    it('rechaza una denominación vacía', () => {
      expect(() =>
        Linea.create({
          denominacion: '',
          observacion: null,
          utilizaStockMinimo: false,
          stockMinimo: 0,
          usuarioCreatedId: 1,
        })
      ).toThrow(DenominacionRequeridaException);
    });

    it('rechaza una denominación con solo espacios', () => {
      expect(() =>
        Linea.create({
          denominacion: '   ',
          observacion: null,
          utilizaStockMinimo: false,
          stockMinimo: 0,
          usuarioCreatedId: 1,
        })
      ).toThrow(DenominacionRequeridaException);
    });

    it('rechaza un stockMinimo negativo', () => {
      expect(() =>
        Linea.create({
          denominacion: 'Bebidas',
          observacion: null,
          utilizaStockMinimo: true,
          stockMinimo: -5,
          usuarioCreatedId: 1,
        })
      ).toThrow(StockMinimoInvalidoException);
    });

    it('rechaza stockMinimo negativo incluso cuando utilizaStockMinimo es false', () => {
      expect(() =>
        Linea.create({
          denominacion: 'Snacks',
          observacion: null,
          utilizaStockMinimo: false,
          stockMinimo: -1,
          usuarioCreatedId: 1,
        })
      ).toThrow(StockMinimoInvalidoException);
    });
  });

  describe('actualizarDatos()', () => {
    it('actualiza correctamente una línea con datos válidos', () => {
      const linea = Linea.create({
        denominacion: 'Congelados',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 0,
        usuarioCreatedId: 1,
      });

      linea.actualizarDatos({
        denominacion: 'Congelados Premium',
        observacion: 'Productos de alta calidad',
        utilizaStockMinimo: true,
        stockMinimo: 20,
        usuarioUpdatedId: 2,
      });

      expect(linea.getDenominacion()).toBe('Congelados Premium');
      expect(linea.getObservacion()).toBe('Productos de alta calidad');
      expect(linea.getUtilizaStockMinimo()).toBe(true);
      expect(linea.getStockMinimo()).toBe(20);
      expect(linea.getUsuarioUpdatedId()).toBe(2);
    });

    it('rechaza actualizar con denominación vacía', () => {
      const linea = Linea.create({
        denominacion: 'Limpieza',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 5,
        usuarioCreatedId: 1,
      });

      expect(() =>
        linea.actualizarDatos({
          denominacion: '',
          observacion: null,
          utilizaStockMinimo: false,
          stockMinimo: 5,
          usuarioUpdatedId: 2,
        })
      ).toThrow(DenominacionRequeridaException);

      // La denominación original no debe cambiar después de un rechazo
      expect(linea.getDenominacion()).toBe('Limpieza');
    });

    it('rechaza actualizar con denominación de solo espacios', () => {
      const linea = Linea.create({
        denominacion: 'Perfumería',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 0,
        usuarioCreatedId: 1,
      });

      expect(() =>
        linea.actualizarDatos({
          denominacion: '   ',
          observacion: null,
          utilizaStockMinimo: false,
          stockMinimo: 0,
          usuarioUpdatedId: 2,
        })
      ).toThrow(DenominacionRequeridaException);
    });

    it('rechaza actualizar con stockMinimo negativo', () => {
      const linea = Linea.create({
        denominacion: 'Ferretería',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 10,
        usuarioCreatedId: 1,
      });

      expect(() =>
        linea.actualizarDatos({
          denominacion: 'Ferretería',
          observacion: null,
          utilizaStockMinimo: true,
          stockMinimo: -8,
          usuarioUpdatedId: 2,
        })
      ).toThrow(StockMinimoInvalidoException);

      // El stockMinimo original no debe cambiar después de un rechazo
      expect(linea.getStockMinimo()).toBe(10);
    });

    it('permite actualizar stockMinimo a 0', () => {
      const linea = Linea.create({
        denominacion: 'Panadería',
        observacion: null,
        utilizaStockMinimo: true,
        stockMinimo: 15,
        usuarioCreatedId: 1,
      });

      linea.actualizarDatos({
        denominacion: 'Panadería',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 0,
        usuarioUpdatedId: 2,
      });

      expect(linea.getStockMinimo()).toBe(0);
    });
  });

  describe('reconstitute()', () => {
    it('rehidrata una línea desde la base de datos', () => {
      const linea = Linea.reconstitute({
        id: 42,
        denominacion: 'Línea Persistida',
        observacion: 'Observación existente',
        utilizaStockMinimo: true,
        stockMinimo: 25,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-02-01'),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: 2,
        usuarioDeletedId: null,
        sistema: 0,
      });

      expect(linea.getId()).toBe(42);
      expect(linea.getDenominacion()).toBe('Línea Persistida');
      expect(linea.getStockMinimo()).toBe(25);
      expect(linea.getUtilizaStockMinimo()).toBe(true);
    });
  });

  describe('marcarComoEliminado()', () => {
    it('marca la línea como eliminada con fecha y usuario', () => {
      const linea = Linea.create({
        denominacion: 'Línea a eliminar',
        observacion: null,
        utilizaStockMinimo: false,
        stockMinimo: 0,
        usuarioCreatedId: 1,
      });

      linea.marcarComoEliminado(3);

      expect(linea.getDeletedAt()).toBeInstanceOf(Date);
      expect(linea.getUsuarioDeletedId()).toBe(3);
    });
  });
});
