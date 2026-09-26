import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateMarcaUseCase } from './update-marca.use-case';
import { MarcaUniquenessValidator } from '../../infraestructure/validators/marca-uniqueness.validator';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../domain/entities/marca.entity';
import { UpdateMarcaDto } from '../dto/update-marca.dto';

describe('UpdateMarcaUseCase', () => {
  let useCase: UpdateMarcaUseCase;
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
        UpdateMarcaUseCase,
        { provide: MARCA_REPOSITORY_TOKEN, useValue: repository },
        { provide: MarcaUniquenessValidator, useValue: validator },
      ],
    }).compile();

    useCase = module.get(UpdateMarcaUseCase);
  });

  it('actualiza la marca cuando existe y la denominación no está en uso', async () => {
    const marcaExistente = Marca.reconstitute({
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

    repository.findOne.mockResolvedValue(marcaExistente);
    validator.validarDenominacionUnica.mockResolvedValue(undefined);
    repository.update.mockResolvedValue(marcaExistente);

    const dto: UpdateMarcaDto = {
      denominacion: 'toyota motors',
      usuarioUpdatedId: 2,
      updatedAt: new Date(),
    };

    const result = await useCase.execute(1, dto);

    expect(repository.findOne).toHaveBeenCalledWith(1);
    expect(validator.validarDenominacionUnica).toHaveBeenCalledWith('toyota motors', 1);
    expect(repository.update).toHaveBeenCalledWith(1, marcaExistente);
    expect(result).toHaveProperty('message');
  });

  it('rechaza actualizar una marca que no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    const dto: UpdateMarcaDto = {
      denominacion: 'test',
      usuarioUpdatedId: 1,
      updatedAt: new Date(),
    };

    await expect(useCase.execute(999, dto)).rejects.toThrow(NotFoundException);
    expect(validator.validarDenominacionUnica).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rechaza actualizar una marca de sistema', async () => {
    const marcaSistema = Marca.reconstitute({
      id: 1,
      denominacion: 'sistema',
      observacion: null,
      sistema: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    repository.findOne.mockResolvedValue(marcaSistema);

    const dto: UpdateMarcaDto = {
      denominacion: 'nueva',
      usuarioUpdatedId: 1,
      updatedAt: new Date(),
    };

    await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rechaza actualizar con denominación ya en uso por otra marca', async () => {
    const marcaExistente = Marca.reconstitute({
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

    repository.findOne.mockResolvedValue(marcaExistente);
    validator.validarDenominacionUnica.mockRejectedValue(
      new ConflictException('Denominación ya existe')
    );

    const dto: UpdateMarcaDto = {
      denominacion: 'honda',
      usuarioUpdatedId: 1,
      updatedAt: new Date(),
    };

    await expect(useCase.execute(1, dto)).rejects.toThrow(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('permite actualizar solo observación sin cambiar denominación', async () => {
    const marcaExistente = Marca.reconstitute({
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

    repository.findOne.mockResolvedValue(marcaExistente);
    repository.update.mockResolvedValue(marcaExistente);

    const dto: UpdateMarcaDto = {
      observacion: 'Nueva observación',
      usuarioUpdatedId: 1,
      updatedAt: new Date(),
    };

    await useCase.execute(1, dto);

    expect(validator.validarDenominacionUnica).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalled();
  });
});
