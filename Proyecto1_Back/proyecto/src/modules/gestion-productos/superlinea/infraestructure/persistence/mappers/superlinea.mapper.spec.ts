import { SuperlineaOrmMapper } from './superlinea.mapper';
import { SuperlineaEntity } from '../entities/superlinea.orm-entity';
import { Superlinea } from '../../../domain/entities/superlinea.entity';

describe('SuperlineaOrmMapper', () => {
  const fila = (): SuperlineaEntity =>
    Object.assign(new SuperlineaEntity(), {
      id: 6,
      denominacion: 'Bebidas',
      observacion: 'obs',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      deletedAt: new Date('2025-01-03'),
      usuarioCreatedId: 1,
      usuarioUpdatedId: 2,
      usuarioDeletedId: 3,
      sistema: 1,
    });

  describe('toDomain()', () => {
    it('convierte la fila en una entidad de dominio con todos sus datos', () => {
      const entity = SuperlineaOrmMapper.toDomain(fila());

      expect(entity).toBeInstanceOf(Superlinea);
      expect(entity.getId()).toBe(6);
      expect(entity.getDenominacion()).toBe('Bebidas');
      expect(entity.getObservacion()).toBe('obs');
      expect(entity.getCreatedAt()).toEqual(new Date('2025-01-01'));
      expect(entity.getUpdatedAt()).toEqual(new Date('2025-01-02'));
      expect(entity.getDeletedAt()).toEqual(new Date('2025-01-03'));
      expect(entity.getUsuarioCreatedId()).toBe(1);
      expect(entity.getUsuarioUpdatedId()).toBe(2);
      expect(entity.getUsuarioDeletedId()).toBe(3);
      expect(entity.getSistema()).toBe(1);
    });
  });

  describe('toOrm()', () => {
    it('convierte la entidad de dominio en fila ORM', () => {
      const row = SuperlineaOrmMapper.toOrm(SuperlineaOrmMapper.toDomain(fila()));

      expect(row).toBeInstanceOf(SuperlineaEntity);
      expect(row).toEqual(fila());
    });

    it('no asigna id cuando la entidad todavía no fue persistida', () => {
      const nueva = Superlinea.create({ denominacion: 'Nueva', observacion: null, usuarioCreatedId: 4 });

      const row = SuperlineaOrmMapper.toOrm(nueva);

      expect(row).not.toHaveProperty('id');
      expect(row.denominacion).toBe('Nueva');
      expect(row.observacion).toBeNull();
      expect(row.usuarioCreatedId).toBe(4);
      expect(row.sistema).toBe(0);
      expect(row.deletedAt).toBeNull();
    });
  });
});
