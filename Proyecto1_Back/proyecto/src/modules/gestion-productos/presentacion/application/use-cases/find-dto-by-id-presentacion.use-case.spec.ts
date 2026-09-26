import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindDtoByIdPresentacionUseCase } from './find-dto-by-id-presentacion.use-case';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';

describe('FindDtoByIdPresentacionUseCase', () => {
  let useCase: FindDtoByIdPresentacionUseCase;
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
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindDtoByIdPresentacionUseCase,
        { provide: PRESENTACION_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(FindDtoByIdPresentacionUseCase);
  });

  it('retorna el DTO cuando la presentación existe', async () => {
    const presentacion = Presentacion.reconstitute({
      id: 1,
      denominacion: 'caja x 12',
      observacion: 'Estándar',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    repository.findOne.mockResolvedValue(presentacion);

    const result = await useCase.execute(1);

    expect(repository.findOne).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('denominacion', 'caja x 12');
  });

  it('lanza NotFoundException cuando la presentación no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith(999);
  });
});
