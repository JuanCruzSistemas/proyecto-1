import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RemoveSuperlineaUseCase } from './remove-superlinea.use-case';
import { SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';

describe('RemoveSuperlineaUseCase', () => {
  let useCase: RemoveSuperlineaUseCase;
  const repository = { removeIfUnused: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [RemoveSuperlineaUseCase, { provide: SUPERLINEA_REPOSITORY, useValue: repository }],
    }).compile();
    useCase = module.get(RemoveSuperlineaUseCase);
  });

  it('delega la baja al repositorio con el usuario y confirma', async () => {
    repository.removeIfUnused.mockResolvedValue(undefined);

    await expect(useCase.execute(4, 2)).resolves.toEqual({ mensaje: 'SuperLínea dada de baja.' });
    expect(repository.removeIfUnused).toHaveBeenCalledWith(4, 2);
  });

  it('propaga el conflicto cuando tiene líneas activas', async () => {
    repository.removeIfUnused.mockRejectedValue(
      new ConflictException('No se puede eliminar: tiene líneas activas asociadas.'),
    );

    await expect(useCase.execute(4, 2)).rejects.toThrow(ConflictException);
  });
});
