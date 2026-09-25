import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreatePresentacionUseCase } from './create-presentacion.use-case';
import { PresentacionUniquenessValidator } from '../../infraestructure/validators/presentacion-uniqueness.validator';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';
import { CreatePresentacionDto } from '../dto/create-presentacion.dto';

describe('CreatePresentacionUseCase', () => {
  let useCase: CreatePresentacionUseCase;
  let repository: jest.Mocked<IPresentacionRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByDenominacion: jest.fn(),
      findByDenominacionWith: jest.fn(),
      findAllFor: jest.fn(),
      findAllListado: jest.fn(),
      findBy: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePresentacionUseCase,
        PresentacionUniquenessValidator,
        { provide: PRESENTACION_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(CreatePresentacionUseCase);
  });

  it('crea la presentación cuando la denominación no está en uso', async () => {
    repository.findByDenominacionWith.mockResolvedValue(null);
    const creada = Presentacion.reconstitute({
      id: 1,
      denominacion: 'caja x 12',
      observacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });
    repository.create.mockResolvedValue(creada);

    const dto: CreatePresentacionDto = {
      denominacion: 'caja x 12',
      observacion: undefined,
      usuarioCreatedId: 1,
    };

    await useCase.execute(dto);

    expect(repository.create).toHaveBeenCalled();
  });

  it('rechaza crear una presentación con denominación ya en uso', async () => {
    repository.findByDenominacionWith.mockResolvedValue(
      Presentacion.reconstitute({
        id: 5,
        denominacion: 'caja x 12',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      }),
    );

    const dto: CreatePresentacionDto = {
      denominacion: 'caja x 12',
      observacion: undefined,
      usuarioCreatedId: 1,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
