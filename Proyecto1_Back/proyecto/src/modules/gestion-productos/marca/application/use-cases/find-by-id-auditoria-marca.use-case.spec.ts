import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindByIdConAuditoriaMarcaUseCase } from './find-by-id-auditoria-marca.use-case';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';

describe('FindByIdConAuditoriaMarcaUseCase', () => {
  let useCase: FindByIdConAuditoriaMarcaUseCase;
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
        FindByIdConAuditoriaMarcaUseCase,
        { provide: MARCA_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(FindByIdConAuditoriaMarcaUseCase);
  });

  it('retorna la marca con auditoría cuando existe', async () => {
    const marcaConAuditoria = {
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
      usuarioCreated: { id: 1, nombre: 'Admin' },
    };

    repository.findByIdConAuditoria.mockResolvedValue(marcaConAuditoria as any);

    const result = await useCase.execute(1);

    expect(repository.findByIdConAuditoria).toHaveBeenCalledWith(1);
    expect(result).toBe(marcaConAuditoria);
  });

  it('lanza NotFoundException cuando la marca no existe', async () => {
    repository.findByIdConAuditoria.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    expect(repository.findByIdConAuditoria).toHaveBeenCalledWith(999);
  });
});
