import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SuperlineaService } from './superlinea.service';
import { SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';
import { CreateSuperlineaUseCase } from '../use-cases/create-superlinea.use-case';
import { UpdateSuperlineaUseCase } from '../use-cases/update-superlinea.use-case';
import { RemoveSuperlineaUseCase } from '../use-cases/remove-superlinea.use-case';
import { Superlinea } from '../../domain/entities/superlinea.entity';

describe('SuperlineaService', () => {
  let service: SuperlineaService;

  const repository = { listActive: jest.fn(), findActive: jest.fn() };
  const createUseCase = { execute: jest.fn() };
  const updateUseCase = { execute: jest.fn() };
  const removeUseCase = { execute: jest.fn() };

  const superlinea = (id: number, denominacion: string) =>
    Superlinea.reconstitute({
      id,
      denominacion,
      observacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
      sistema: 0,
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SuperlineaService,
        { provide: SUPERLINEA_REPOSITORY, useValue: repository },
        { provide: CreateSuperlineaUseCase, useValue: createUseCase },
        { provide: UpdateSuperlineaUseCase, useValue: updateUseCase },
        { provide: RemoveSuperlineaUseCase, useValue: removeUseCase },
      ],
    }).compile();
    service = module.get(SuperlineaService);
  });

  describe('list()', () => {
    it('devuelve las superlíneas activas como DTO', async () => {
      repository.listActive.mockResolvedValue([superlinea(1, 'Bebidas'), superlinea(2, 'Lácteos')]);

      await expect(service.list()).resolves.toEqual([
        { id: 1, denominacion: 'Bebidas', observacion: null, sistema: 0 },
        { id: 2, denominacion: 'Lácteos', observacion: null, sistema: 0 },
      ]);
    });

    it('devuelve una lista vacía si no hay activas', async () => {
      repository.listActive.mockResolvedValue([]);
      await expect(service.list()).resolves.toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('devuelve el DTO de la superlínea activa', async () => {
      repository.findActive.mockResolvedValue(superlinea(3, 'Snacks'));

      await expect(service.findOne(3)).resolves.toEqual({
        id: 3,
        denominacion: 'Snacks',
        observacion: null,
        sistema: 0,
      });
      expect(repository.findActive).toHaveBeenCalledWith(3);
    });

    it('lanza NotFound si no existe', async () => {
      repository.findActive.mockResolvedValue(null);
      await expect(service.findOne(3)).rejects.toThrow(new NotFoundException('SuperLínea no encontrada.'));
    });
  });

  describe('assertActive()', () => {
    it('no lanza si la superlínea está activa', async () => {
      repository.findActive.mockResolvedValue(superlinea(3, 'Snacks'));
      await expect(service.assertActive(3)).resolves.toBeUndefined();
    });

    it.each([0, -1, 1.5, NaN])('rechaza el id %p sin consultar el repositorio', async (id) => {
      await expect(service.assertActive(id)).rejects.toThrow(
        new BadRequestException('Debe seleccionar una SuperLínea para la línea'),
      );
      expect(repository.findActive).not.toHaveBeenCalled();
    });

    it('rechaza una superlínea inexistente o dada de baja', async () => {
      repository.findActive.mockResolvedValue(null);
      await expect(service.assertActive(3)).rejects.toThrow(
        new BadRequestException('Debe seleccionar una SuperLínea válida y activa.'),
      );
    });
  });

  describe('delegación a casos de uso', () => {
    it('create() delega con el dto y el usuario', async () => {
      const dto = { denominacion: 'Bebidas' };
      createUseCase.execute.mockResolvedValue('creada');

      await expect(service.create(dto, 7)).resolves.toBe('creada');
      expect(createUseCase.execute).toHaveBeenCalledWith(dto, 7);
    });

    it('update() delega con id, dto y usuario', async () => {
      const dto = { denominacion: 'Bebidas' };
      updateUseCase.execute.mockResolvedValue('actualizada');

      await expect(service.update(4, dto, 7)).resolves.toBe('actualizada');
      expect(updateUseCase.execute).toHaveBeenCalledWith(4, dto, 7);
    });

    it('remove() delega con id y usuario', async () => {
      removeUseCase.execute.mockResolvedValue({ mensaje: 'ok' });

      await expect(service.remove(4, 7)).resolves.toEqual({ mensaje: 'ok' });
      expect(removeUseCase.execute).toHaveBeenCalledWith(4, 7);
    });
  });
});
