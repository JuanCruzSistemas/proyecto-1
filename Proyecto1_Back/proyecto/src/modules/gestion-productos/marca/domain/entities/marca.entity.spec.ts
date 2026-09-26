import { Marca } from './marca.entity';
import { DenominacionRequeridaException } from '../exceptions/denominacion-requerida.exception';

describe('Marca (dominio)', () => {
  describe('create()', () => {
    it('crea una marca válida con denominación', () => {
      const marca = Marca.create({
        denominacion: 'Nike',
        observacion: null,
        usuarioCreatedId: 1,
      });

      expect(marca.getDenominacion()).toBe('Nike');
      expect(marca.getId()).toBeNull();
      expect(marca.getObservacion()).toBeNull();
    });

    it('rechaza una denominación vacía', () => {
      expect(() =>
        Marca.create({
          denominacion: '',
          observacion: null,
          usuarioCreatedId: 1,
        })
      ).toThrow(DenominacionRequeridaException);
    });

    it('rechaza una denominación con solo espacios', () => {
      expect(() =>
        Marca.create({
          denominacion: '   ',
          observacion: null,
          usuarioCreatedId: 1,
        })
      ).toThrow(DenominacionRequeridaException);
    });
  });

  describe('actualizarDatos()', () => {
    it('actualiza correctamente una marca con denominación válida', () => {
      const marca = Marca.create({
        denominacion: 'Adidas',
        observacion: null,
        usuarioCreatedId: 1,
      });

      marca.actualizarDatos({
        denominacion: 'Adidas Original',
        observacion: 'Marca premium',
        usuarioUpdatedId: 2,
      });

      expect(marca.getDenominacion()).toBe('Adidas Original');
      expect(marca.getObservacion()).toBe('Marca premium');
      expect(marca.getUsuarioUpdatedId()).toBe(2);
    });

    it('rechaza actualizar con denominación vacía', () => {
      const marca = Marca.create({
        denominacion: 'Puma',
        observacion: null,
        usuarioCreatedId: 1,
      });

      expect(() =>
        marca.actualizarDatos({
          denominacion: '',
          observacion: null,
          usuarioUpdatedId: 2,
        })
      ).toThrow(DenominacionRequeridaException);

      // La denominación original no debe cambiar después de un rechazo
      expect(marca.getDenominacion()).toBe('Puma');
    });

    it('rechaza actualizar con denominación de solo espacios', () => {
      const marca = Marca.create({
        denominacion: 'Reebok',
        observacion: null,
        usuarioCreatedId: 1,
      });

      expect(() =>
        marca.actualizarDatos({
          denominacion: '   ',
          observacion: null,
          usuarioUpdatedId: 2,
        })
      ).toThrow(DenominacionRequeridaException);
    });
  });

  describe('reconstitute()', () => {
    it('rehidrata una marca desde la base de datos', () => {
      const marca = Marca.reconstitute({
        id: 42,
        denominacion: 'Marca Persistida',
        observacion: 'Observación existente',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-02-01'),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: 2,
        usuarioDeletedId: null,
        sistema: 0,
      });

      expect(marca.getId()).toBe(42);
      expect(marca.getDenominacion()).toBe('Marca Persistida');
      expect(marca.getObservacion()).toBe('Observación existente');
    });
  });

  describe('marcarComoEliminado()', () => {
    it('marca la marca como eliminada con fecha y usuario', () => {
      const marca = Marca.create({
        denominacion: 'Marca a eliminar',
        observacion: null,
        usuarioCreatedId: 1,
      });

      marca.marcarComoEliminado(3);

      expect(marca.getDeletedAt()).toBeInstanceOf(Date);
      expect(marca.getUsuarioDeletedId()).toBe(3);
    });
  });
});
