import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SuperlineaRepository } from './superlinea.repository';
import { SuperlineaEntity } from '../entities/superlinea.orm-entity';
import { LineaEntity } from '../../../../linea/infraestructure/persistence/entities/linea.orm-entity';
import { Superlinea } from '../../../domain/entities/superlinea.entity';

describe('SuperlineaRepository', () => {
  let repository: SuperlineaRepository;

  const fila = (overrides: Partial<SuperlineaEntity> = {}): SuperlineaEntity =>
    Object.assign(new SuperlineaEntity(), {
      id: 1,
      denominacion: 'Bebidas',
      observacion: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
      sistema: 0,
      ...overrides,
    });

  // Repositorios que se obtienen dentro de la transacción.
  const superlineaTxRepo = { findOne: jest.fn() };
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };
  const lineaTxRepo = { createQueryBuilder: jest.fn(() => queryBuilder) };

  const manager = {
    getRepository: jest.fn((entity) => (entity === LineaEntity ? lineaTxRepo : superlineaTxRepo)),
    save: jest.fn(),
  };

  const ormRepository = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    manager: { transaction: jest.fn((cb: (m: typeof manager) => unknown) => cb(manager)) },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [SuperlineaRepository, { provide: getRepositoryToken(SuperlineaEntity), useValue: ormRepository }],
    }).compile();
    repository = module.get(SuperlineaRepository);
  });

  describe('findActive()', () => {
    it('devuelve la entidad de dominio si existe', async () => {
      ormRepository.findOneBy.mockResolvedValue(fila({ id: 3, denominacion: 'Snacks' }));

      const resultado = await repository.findActive(3);

      expect(ormRepository.findOneBy).toHaveBeenCalledWith({ id: 3 });
      expect(resultado).toBeInstanceOf(Superlinea);
      expect(resultado!.getDenominacion()).toBe('Snacks');
    });

    it('devuelve null si no existe', async () => {
      ormRepository.findOneBy.mockResolvedValue(null);
      await expect(repository.findActive(3)).resolves.toBeNull();
    });
  });

  describe('listActive()', () => {
    it('lista ordenado por denominación e id y mapea a dominio', async () => {
      ormRepository.find.mockResolvedValue([fila({ id: 1, denominacion: 'A' }), fila({ id: 2, denominacion: 'B' })]);

      const resultado = await repository.listActive();

      expect(ormRepository.find).toHaveBeenCalledWith({ order: { denominacion: 'ASC', id: 'ASC' } });
      expect(resultado.map((s) => s.getDenominacion())).toEqual(['A', 'B']);
      expect(resultado.every((s) => s instanceof Superlinea)).toBe(true);
    });
  });

  describe('save()', () => {
    it('una superlínea nueva se guarda sin bloquear ni buscar la existente', async () => {
      const nueva = Superlinea.create({ denominacion: 'Nueva', observacion: null, usuarioCreatedId: 2 });
      manager.save.mockImplementation(async (_e, row: SuperlineaEntity) => ({ ...row, id: 50 }));

      const resultado = await repository.save(nueva);

      expect(ormRepository.manager.transaction).toHaveBeenCalled();
      expect(superlineaTxRepo.findOne).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalledWith(SuperlineaEntity, expect.objectContaining({ denominacion: 'Nueva' }));
      expect(resultado.getId()).toBe(50);
    });

    it('una superlínea existente se bloquea antes de guardarla', async () => {
      const existente = Superlinea.reconstitute({ ...fila({ id: 8 }) });
      superlineaTxRepo.findOne.mockResolvedValue(fila({ id: 8 }));
      manager.save.mockImplementation(async (_e, row: SuperlineaEntity) => row);

      const resultado = await repository.save(existente);

      expect(superlineaTxRepo.findOne).toHaveBeenCalledWith({
        where: { id: 8 },
        lock: { mode: 'pessimistic_write' },
      });
      expect(resultado.getId()).toBe(8);
    });

    it('si la existente fue dada de baja mientras tanto no la restaura', async () => {
      const existente = Superlinea.reconstitute({ ...fila({ id: 8 }) });
      superlineaTxRepo.findOne.mockResolvedValue(null);

      await expect(repository.save(existente)).rejects.toThrow(new NotFoundException('SuperLínea no encontrada.'));
      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('removeIfUnused()', () => {
    afterEach(() => jest.useRealTimers());

    it('da de baja lógica registrando usuario y fecha si no tiene líneas activas', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-20T10:00:00Z'));
      superlineaTxRepo.findOne.mockResolvedValue(fila({ id: 5 }));
      queryBuilder.getMany.mockResolvedValue([]);

      await repository.removeIfUnused(5, 9);

      expect(superlineaTxRepo.findOne).toHaveBeenCalledWith({ where: { id: 5 }, lock: { mode: 'pessimistic_write' } });
      expect(queryBuilder.where).toHaveBeenCalledWith('linea.superlineaId = :id', { id: 5 });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('linea.deletedAt IS NULL');
      expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(manager.save).toHaveBeenCalledWith(
        SuperlineaEntity,
        expect.objectContaining({ id: 5, usuarioDeletedId: 9, deletedAt: new Date('2026-09-20T10:00:00Z') }),
      );
    });

    it('lanza NotFound si no existe', async () => {
      superlineaTxRepo.findOne.mockResolvedValue(null);

      await expect(repository.removeIfUnused(5, 9)).rejects.toThrow(NotFoundException);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('no permite eliminar una superlínea del sistema', async () => {
      superlineaTxRepo.findOne.mockResolvedValue(fila({ id: 5, sistema: 1 }));

      await expect(repository.removeIfUnused(5, 9)).rejects.toThrow(ForbiddenException);
      expect(lineaTxRepo.createQueryBuilder).not.toHaveBeenCalled();
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('lanza Conflict si tiene líneas activas asociadas', async () => {
      superlineaTxRepo.findOne.mockResolvedValue(fila({ id: 5 }));
      queryBuilder.getMany.mockResolvedValue([{ id: 100 }]);

      await expect(repository.removeIfUnused(5, 9)).rejects.toThrow(
        new ConflictException('No se puede eliminar: tiene líneas activas asociadas.'),
      );
      expect(manager.save).not.toHaveBeenCalled();
    });
  });
});
