import { MarcaOrmMapper } from './marca.mapper';
import { MarcaEntity } from '../entities/marca.orm-entity';
import { Marca } from '../../../domain/entities/marca.entity';

describe('MarcaOrmMapper', () => {
  describe('toDomain', () => {
    it('convierte MarcaEntity a Marca', () => {
      const orm = new MarcaEntity();
      orm.id = 1;
      orm.denominacion = 'toyota';
      orm.observacion = 'Marca japonesa';
      orm.sistema = 0;
      orm.createdAt = new Date();
      orm.updatedAt = new Date();
      orm.deletedAt = undefined;
      orm.usuarioCreatedId = 1;
      orm.usuarioUpdatedId = 2;
      orm.usuarioDeletedId = undefined;

      const domain = MarcaOrmMapper.toDomain(orm);

      expect(domain).toBeInstanceOf(Marca);
      expect(domain.getId()).toBe(1);
      expect(domain.getDenominacion()).toBe('toyota');
      expect(domain.getObservacion()).toBe('Marca japonesa');
      expect(domain.getSistema()).toBe(0);
    });

    it('maneja valores nulos correctamente', () => {
      const orm = new MarcaEntity();
      orm.id = 2;
      orm.denominacion = 'honda';
      orm.observacion = null as any;
      orm.sistema = 1;
      orm.createdAt = new Date();
      orm.updatedAt = new Date();
      orm.usuarioCreatedId = undefined;

      const domain = MarcaOrmMapper.toDomain(orm);

      expect(domain.getObservacion()).toBeNull();
      expect(domain.getUsuarioCreatedId()).toBeNull();
    });
  });

  describe('toOrm', () => {
    it('convierte Marca a MarcaEntity', () => {
      const marca = Marca.reconstitute({
        id: 1,
        denominacion: 'ford',
        observacion: 'Americana',
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const orm = MarcaOrmMapper.toOrm(marca);

      expect(orm.id).toBe(1);
      expect(orm.denominacion).toBe('ford');
      expect(orm.observacion).toBe('Americana');
      expect(orm.sistema).toBe(0);
      expect(orm.usuarioCreatedId).toBe(1);
    });

    it('usa entidad existente cuando se provee target', () => {
      const marca = Marca.reconstitute({
        id: 5,
        denominacion: 'mazda',
        observacion: null,
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const existingOrm = new MarcaEntity();
      existingOrm.id = 5;

      const orm = MarcaOrmMapper.toOrm(marca, existingOrm);

      expect(orm).toBe(existingOrm);
      expect(orm.denominacion).toBe('mazda');
    });

    it('maneja deletedAt correctamente', () => {
      const deletedDate = new Date();
      const marca = Marca.reconstitute({
        id: 3,
        denominacion: 'chevrolet',
        observacion: null,
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: deletedDate,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: 2,
      });

      const orm = MarcaOrmMapper.toOrm(marca);

      expect(orm.deletedAt).toBe(deletedDate);
      expect(orm.usuarioDeletedId).toBe(2);
    });
  });

  describe('toOrmReference', () => {
    it('crea una referencia liviana con solo el id', () => {
      const marca = Marca.reconstitute({
        id: 10,
        denominacion: 'nissan',
        observacion: null,
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const reference = MarcaOrmMapper.toOrmReference(marca);

      expect(reference.id).toBe(10);
      expect(reference.denominacion).toBeUndefined();
    });
  });

  describe('toDto', () => {
    it('convierte Marca a MarcaDto', () => {
      const marca = Marca.reconstitute({
        id: 1,
        denominacion: 'volkswagen',
        observacion: 'Alemana',
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const dto = MarcaOrmMapper.toDto(marca);

      expect(dto.id).toBe(1);
      expect(dto.denominacion).toBe('volkswagen');
      expect(dto.observacion).toBe('Alemana');
      expect(dto.sistema).toBe(0);
      expect(dto.deletedAt).toBeNull();
    });

    it('convierte deletedAt a ISO string', () => {
      const deletedDate = new Date('2024-01-01');
      const marca = Marca.reconstitute({
        id: 2,
        denominacion: 'renault',
        observacion: null,
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: deletedDate,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: 1,
      });

      const dto = MarcaOrmMapper.toDto(marca);

      expect(dto.deletedAt).toBe(deletedDate.toISOString());
    });

    it('usa string vacío para observacion null', () => {
      const marca = Marca.reconstitute({
        id: 3,
        denominacion: 'peugeot',
        observacion: null,
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const dto = MarcaOrmMapper.toDto(marca);

      expect(dto.observacion).toBe('');
    });

    it('usa 0 para id null', () => {
      const marca = Marca.reconstitute({
        id: null as any,
        denominacion: 'test',
        observacion: null,
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const dto = MarcaOrmMapper.toDto(marca);

      expect(dto.id).toBe(0);
    });
  });
});
