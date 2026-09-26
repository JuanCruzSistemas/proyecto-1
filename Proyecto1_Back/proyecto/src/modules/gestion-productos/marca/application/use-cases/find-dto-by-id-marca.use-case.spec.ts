import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindDtoByIdMarcaUseCase } from './find-dto-by-id-marca.use-case';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../domain/entities/marca.entity';

describe('FindDtoByIdMarcaUseCase', () => {
  let useCase: FindDtoByIdMarcaUseCase;
  let repository: jest.Mocked<IMarcaRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByDenominacion: jest.fn(),
      findByDenominacionWith: jest.fn(),
      findAllFor: jest.fn(),
      findAllListado: jest.fn(),
      findAllSinSistemaFor: jest.fn(),
      findAllSistemaFor: jest.fn(),
      findBy: jest.fn(),
      findByIdConAuditoria: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindDtoByIdMarcaUseCase,
        { provide: MARCA_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(FindDtoByIdMarcaUseCase);
  });

  it('retorna el DTO cuando la marca existe', async () => {
    const marca = Marca.reconstitute({
      id: 1,
      denominacion: 'toyota',
      observacion: 'Marca japonesa',
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    repository.findOne.mockResolvedValue(marca);

    const result = await useCase.execute(1);

    expect(repository.findOne).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('denominacion', 'toyota');
  });

  it('lanza NotFoundException cuando la marca no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith(999);
  });
});
