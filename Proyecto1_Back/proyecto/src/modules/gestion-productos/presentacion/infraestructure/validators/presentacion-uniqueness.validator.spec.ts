import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PresentacionUniquenessValidator } from './presentacion-uniqueness.validator';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';

describe('PresentacionUniquenessValidator', () => {
  let validator: PresentacionUniquenessValidator;
  let repository: jest.Mocked<IPresentacionRepository>;

  beforeEach(async () => {
    repository = {
      findByDenominacionWith: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresentacionUniquenessValidator,
        { provide: PRESENTACION_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    validator = module.get(PresentacionUniquenessValidator);
  });

  it('no lanza error cuando la denominación no existe', async () => {
    repository.findByDenominacionWith.mockResolvedValue(null);

    await expect(
      validator.validarDenominacionUnica('caja x 12', 0)
    ).resolves.not.toThrow();

    expect(repository.findByDenominacionWith).toHaveBeenCalledWith('caja x 12');
  });

  it('no lanza error cuando la denominación pertenece a la misma entidad', async () => {
    const presentacion = Presentacion.reconstitute({
      id: 5,
      denominacion: 'botella',
      observacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    repository.findByDenominacionWith.mockResolvedValue(presentacion);

    await expect(
      validator.validarDenominacionUnica('botella', 5)
    ).resolves.not.toThrow();
  });

  it('lanza ConflictException cuando la denominación ya existe en otra entidad', async () => {
    const presentacion = Presentacion.reconstitute({
      id: 10,
      denominacion: 'sobre',
      observacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    repository.findByDenominacionWith.mockResolvedValue(presentacion);

    await expect(
      validator.validarDenominacionUnica('sobre', 0)
    ).rejects.toThrow(ConflictException);

    await expect(
      validator.validarDenominacionUnica('sobre', 5)
    ).rejects.toThrow('Denominación ya en uso.');
  });
});
