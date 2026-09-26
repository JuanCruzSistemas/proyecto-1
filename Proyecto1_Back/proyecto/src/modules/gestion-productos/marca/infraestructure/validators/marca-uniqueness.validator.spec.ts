import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { MarcaUniquenessValidator } from './marca-uniqueness.validator';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../domain/entities/marca.entity';

describe('MarcaUniquenessValidator', () => {
  let validator: MarcaUniquenessValidator;
  let repository: jest.Mocked<IMarcaRepository>;

  beforeEach(async () => {
    repository = {
      findByDenominacionWith: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarcaUniquenessValidator,
        { provide: MARCA_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    validator = module.get(MarcaUniquenessValidator);
  });

  it('no lanza error cuando la denominación no existe', async () => {
    repository.findByDenominacionWith.mockResolvedValue(null);

    await expect(
      validator.validarDenominacionUnica('toyota', 0)
    ).resolves.not.toThrow();

    expect(repository.findByDenominacionWith).toHaveBeenCalledWith('toyota');
  });

  it('no lanza error cuando la denominación pertenece a la misma entidad', async () => {
    const marca = Marca.reconstitute({
      id: 5,
      denominacion: 'honda',
      observacion: null,
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    repository.findByDenominacionWith.mockResolvedValue(marca);

    await expect(
      validator.validarDenominacionUnica('honda', 5)
    ).resolves.not.toThrow();
  });

  it('lanza ConflictException cuando la denominación ya existe en otra entidad', async () => {
    const marca = Marca.reconstitute({
      id: 10,
      denominacion: 'ford',
      observacion: null,
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    repository.findByDenominacionWith.mockResolvedValue(marca);

    await expect(
      validator.validarDenominacionUnica('ford', 0)
    ).rejects.toThrow(ConflictException);

    await expect(
      validator.validarDenominacionUnica('ford', 5)
    ).rejects.toThrow('Denominación ya en uso.');
  });
});
