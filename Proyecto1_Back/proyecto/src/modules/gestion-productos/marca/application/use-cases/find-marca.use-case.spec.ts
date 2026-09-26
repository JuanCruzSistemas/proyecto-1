import { Test, TestingModule } from '@nestjs/testing';
import { FindMarcaUseCase } from './find-marca.use-case';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../domain/entities/marca.entity';

describe('FindMarcaUseCase', () => {
  let useCase: FindMarcaUseCase;
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
        FindMarcaUseCase,
        { provide: MARCA_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    useCase = module.get(FindMarcaUseCase);
  });

  it('findAllFor retorna marcas mapeadas a DTO', async () => {
    const marcas = [
      Marca.reconstitute({
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
      }),
    ];

    repository.findAllFor.mockResolvedValue(marcas);

    const result = await useCase.findAllFor('toyota');

    expect(repository.findAllFor).toHaveBeenCalledWith('toyota');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findAllListado retorna lista de entidades', async () => {
    const marcas = [
      Marca.reconstitute({
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
      }),
    ];

    repository.findAllListado.mockResolvedValue(marcas);

    const result = await useCase.findAllListado();

    expect(repository.findAllListado).toHaveBeenCalled();
    expect(result).toEqual(marcas);
  });

  it('findAllSinSistemaFor retorna solo marcas no sistema', async () => {
    const marcas = [
      Marca.reconstitute({
        id: 2,
        denominacion: 'honda',
        observacion: null,
        sistema: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      }),
    ];

    repository.findAllSinSistemaFor.mockResolvedValue(marcas);

    const result = await useCase.findAllSinSistemaFor('honda');

    expect(repository.findAllSinSistemaFor).toHaveBeenCalledWith('honda');
    expect(result.data).toHaveLength(1);
  });

  it('findAllSistemaFor retorna solo marcas de sistema', async () => {
    const marcas = [
      Marca.reconstitute({
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
      }),
    ];

    repository.findAllSistemaFor.mockResolvedValue(marcas);

    const result = await useCase.findAllSistemaFor('sistema');

    expect(repository.findAllSistemaFor).toHaveBeenCalledWith('sistema');
    expect(result.data).toHaveLength(1);
  });

  it('findBy retorna resultados paginados', async () => {
    const marcas = [
      Marca.reconstitute({
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
      }),
    ];

    repository.findBy.mockResolvedValue({ data: marcas, total: 1 });

    const result = await useCase.findBy('toyota', 0, 10, false);

    expect(repository.findBy).toHaveBeenCalledWith('toyota', 0, 10, false);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('findBy usa valores por defecto para skip y take', async () => {
    repository.findBy.mockResolvedValue({ data: [], total: 0 });

    await useCase.findBy('test');

    expect(repository.findBy).toHaveBeenCalledWith('test', 0, 10, false);
  });
});
