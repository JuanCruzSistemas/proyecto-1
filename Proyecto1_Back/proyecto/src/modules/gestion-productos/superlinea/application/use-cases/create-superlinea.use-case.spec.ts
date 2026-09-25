import { Test } from '@nestjs/testing';
import { CreateSuperlineaUseCase } from './create-superlinea.use-case';
import { SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';
import { Superlinea } from '../../domain/entities/superlinea.entity';
import { SuperlineaInvalidaError } from '../../domain/entities/superlinea-invalida.error';

describe('CreateSuperlineaUseCase', () => {
  let useCase: CreateSuperlineaUseCase;
  const repository = { save: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    // Simula el guardado asignando un id a la entidad recibida.
    repository.save.mockImplementation(async (entity: Superlinea) =>
      Superlinea.reconstitute({
        id: 10,
        denominacion: entity.getDenominacion(),
        observacion: entity.getObservacion(),
        createdAt: entity.getCreatedAt(),
        updatedAt: entity.getUpdatedAt(),
        deletedAt: null,
        usuarioCreatedId: entity.getUsuarioCreatedId(),
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
        sistema: 0,
      }),
    );

    const module = await Test.createTestingModule({
      providers: [CreateSuperlineaUseCase, { provide: SUPERLINEA_REPOSITORY, useValue: repository }],
    }).compile();
    useCase = module.get(CreateSuperlineaUseCase);
  });

  it('crea la entidad con el usuario creador y devuelve el DTO guardado', async () => {
    const resultado = await useCase.execute({ denominacion: 'Bebidas', observacion: 'obs' }, 5);

    const guardada: Superlinea = repository.save.mock.calls[0][0];
    expect(guardada.getId()).toBeNull();
    expect(guardada.getDenominacion()).toBe('Bebidas');
    expect(guardada.getObservacion()).toBe('obs');
    expect(guardada.getUsuarioCreatedId()).toBe(5);
    expect(resultado).toEqual({ id: 10, denominacion: 'Bebidas', observacion: 'obs', sistema: 0 });
  });

  it('sin observación la guarda como null', async () => {
    const resultado = await useCase.execute({ denominacion: 'Bebidas' }, 5);

    expect(repository.save.mock.calls[0][0].getObservacion()).toBeNull();
    expect(resultado.observacion).toBeNull();
  });

  it('no persiste si la denominación es inválida', async () => {
    await expect(useCase.execute({ denominacion: '  ' }, 5)).rejects.toThrow(SuperlineaInvalidaError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('propaga los errores del repositorio', async () => {
    repository.save.mockRejectedValue(new Error('db caída'));
    await expect(useCase.execute({ denominacion: 'Bebidas' }, 5)).rejects.toThrow('db caída');
  });
});
