import { PresentacionMapper } from './presentacion.mapper';
import { PresentacionEntity } from '../entities/presentacion.orm-entity';
import { Presentacion } from '../../../domain/entities/presentacion.entity';

describe('PresentacionMapper', () => {
  describe('toDomain', () => {
    it('convierte PresentacionEntity a Presentacion', () => {
      const orm = new PresentacionEntity();
      orm.id = 1;
      orm.denominacion = 'caja x 12';
      orm.observacion = 'Estándar';
      orm.createdAt = new Date();
      orm.updatedAt = new Date();
      orm.deletedAt = undefined;
      orm.usuarioCreatedId = 1;
      orm.usuarioUpdatedId = 2;
      orm.usuarioDeletedId = undefined;

      const domain = PresentacionMapper.toDomain(orm);

      expect(domain).toBeInstanceOf(Presentacion);
      expect(domain.getId()).toBe(1);
      expect(domain.getDenominacion()).toBe('caja x 12');
      expect(domain.getObservacion()).toBe('Estándar');
    });

    it('maneja valores nulos correctamente', () => {
      const orm = new PresentacionEntity();
      orm.id = 2;
      orm.denominacion = 'botella';
      orm.observacion = null as any;
      orm.createdAt = new Date();
      orm.updatedAt = new Date();
      orm.usuarioCreatedId = undefined;

      const domain = PresentacionMapper.toDomain(orm);

      expect(domain.getObservacion()).toBeNull();
      expect(domain.getUsuarioCreatedId()).toBeNull();
    });
  });

  describe('toOrm', () => {
    it('convierte Presentacion a PresentacionEntity', () => {
      const presentacion = Presentacion.reconstitute({
        id: 1,
        denominacion: 'sobre',
        observacion: 'Grande',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const orm = PresentacionMapper.toOrm(presentacion);

      expect(orm.id).toBe(1);
      expect(orm.denominacion).toBe('sobre');
      expect(orm.observacion).toBe('Grande');
      expect(orm.usuarioCreatedId).toBe(1);
    });

    it('usa entidad existente cuando se provee target', () => {
      const presentacion = Presentacion.reconstitute({
        id: 5,
        denominacion: 'lata',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const existingOrm = new PresentacionEntity();
      existingOrm.id = 5;

      const orm = PresentacionMapper.toOrm(presentacion, existingOrm);

      expect(orm).toBe(existingOrm);
      expect(orm.denominacion).toBe('lata');
    });

    it('maneja deletedAt correctamente', () => {
      const deletedDate = new Date();
      const presentacion = Presentacion.reconstitute({
        id: 3,
        denominacion: 'paquete',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: deletedDate,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: 2,
      });

      const orm = PresentacionMapper.toOrm(presentacion);

      expect(orm.deletedAt).toBe(deletedDate);
      expect(orm.usuarioDeletedId).toBe(2);
    });
  });

  describe('toOrmReference', () => {
    it('crea una referencia liviana con solo el id', () => {
      const presentacion = Presentacion.reconstitute({
        id: 10,
        denominacion: 'test',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const reference = PresentacionMapper.toOrmReference(presentacion);

      expect(reference).not.toBeNull();
      expect(reference!.id).toBe(10);
      expect(reference!.denominacion).toBeUndefined();
    });

    it('retorna null cuando la presentación es null', () => {
      const reference = PresentacionMapper.toOrmReference(null);

      expect(reference).toBeNull();
    });
  });
});
