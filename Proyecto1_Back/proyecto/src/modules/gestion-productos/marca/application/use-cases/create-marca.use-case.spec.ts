import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateMarcaUseCase } from './create-marca.use-case';
import { MarcaUniquenessValidator } from '../../infraestructure/validators/marca-uniqueness.validator';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../domain/entities/marca.entity';
import { CreateMarcaDto } from '../dto/create-marca.dto';

describe('CreateMarcaUseCase', () => {
  let useCase: CreateMarcaUseCase;
  let repository: jest.Mocked<IMarcaRepository>;
  let validator: jest.Mocked<MarcaUniquenessValidator>;

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

    validator = {
      validarDenominacionUnica: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMarcaUseCase,
        { provide: MARCA_REPOSITORY_TOKEN, useValue: repository },
        { provide: MarcaUniquenessValidator, useValue: validator },
      ],
    }).compile();

    useCase = module.get(CreateMarcaUseCase);
  });

  it('crea la marca cuando la denominación no está en uso', async () => {
    validator.validarDenominacionUnica.mockResolvedValue(undefined);
    const creada = Marca.reconstitute({
      id: 1,
      denominacion: 'toyota',
      observacion: null,
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });
    repository.create.mockResolvedValue(creada);

    const dto: CreateMarcaDto = {
      denominacion: 'toyota',
      observacion: undefined,
      usuarioCreatedId: 1,
    };

    const result = await useCase.execute(dto);

    expect(validator.validarDenominacionUnica).toHaveBeenCalledWith('toyota', 0);
    expect(repository.create).toHaveBeenCalled();
    expect(result).toHaveProperty('message');
  });

  it('rechaza crear una marca con denominación ya en uso', async () => {
    validator.validarDenominacionUnica.mockRejectedValue(
      new ConflictException('La marca ya existe')
    );

    const dto: CreateMarcaDto = {
      denominacion: 'toyota',
      observacion: undefined,
      usuarioCreatedId: 1,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('permite crear marca con observación', async () => {
    validator.validarDenominacionUnica.mockResolvedValue(undefined);
    const creada = Marca.reconstitute({
      id: 2,
      denominacion: 'honda',
      observacion: 'Marca japonesa',
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });
    repository.create.mockResolvedValue(creada);

    const dto: CreateMarcaDto = {
      denominacion: 'honda',
      observacion: 'Marca japonesa',
      usuarioCreatedId: 1,
    };

    await useCase.execute(dto);

    expect(repository.create).toHaveBeenCalled();
  });
});
