import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UpdateSuperlineaUseCase } from './update-superlinea.use-case';
import { SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';
import { Superlinea } from '../../domain/entities/superlinea.entity';
import { SuperlineaInvalidaError } from '../../domain/entities/superlinea-invalida.error';

describe('UpdateSuperlineaUseCase', () => {
  let useCase: UpdateSuperlineaUseCase;
  const repository = { findActive: jest.fn(), save: jest.fn() };

  const existente = (sistema = 0) =>
    Superlinea.reconstitute({
      id: 4,
      denominacion: 'Bebidas',
      observacion: 'Observación original',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
      sistema,
    });

  beforeEach(async () => {
    jest.clearAllMocks();
    repository.save.mockImplementation(async (entity: Superlinea) => entity);

    const module = await Test.createTestingModule({
      providers: [UpdateSuperlineaUseCase, { provide: SUPERLINEA_REPOSITORY, useValue: repository }],
    }).compile();
    useCase = module.get(UpdateSuperlineaUseCase);
  });

  it('actualiza y guarda la superlínea activa', async () => {
    const entity = existente();
    repository.findActive.mockResolvedValue(entity);

    const resultado = await useCase.execute(4, { denominacion: 'Gaseosas', observacion: 'nueva' }, 8);

    expect(repository.findActive).toHaveBeenCalledWith(4);
    expect(repository.save).toHaveBeenCalledWith(entity);
    expect(entity.getUsuarioUpdatedId()).toBe(8);
    expect(resultado).toEqual({ id: 4, denominacion: 'Gaseosas', observacion: 'nueva', sistema: 0 });
  });

  it('si no se envía observación conserva la existente', async () => {
    repository.findActive.mockResolvedValue(existente());

    const resultado = await useCase.execute(4, { denominacion: 'Gaseosas' }, 8);

    expect(resultado.observacion).toBe('Observación original');
  });

  it('si se envía observación null la borra', async () => {
    repository.findActive.mockResolvedValue(existente());

    const resultado = await useCase.execute(4, { denominacion: 'Gaseosas', observacion: null }, 8);

    expect(resultado.observacion).toBeNull();
  });

  it('lanza NotFound si no existe o está dada de baja', async () => {
    repository.findActive.mockResolvedValue(null);

    await expect(useCase.execute(99, { denominacion: 'X' }, 8)).rejects.toThrow(
      new NotFoundException('SuperLínea no encontrada.'),
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('no permite modificar una superlínea del sistema', async () => {
    repository.findActive.mockResolvedValue(existente(1));

    await expect(useCase.execute(4, { denominacion: 'X' }, 8)).rejects.toThrow(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('no persiste una denominación inválida', async () => {
    repository.findActive.mockResolvedValue(existente());

    await expect(useCase.execute(4, { denominacion: '' }, 8)).rejects.toThrow(SuperlineaInvalidaError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
