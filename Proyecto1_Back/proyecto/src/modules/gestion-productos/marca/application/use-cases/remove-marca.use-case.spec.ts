import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RemoveMarcaUseCase } from './remove-marca.use-case';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { PoliticaEliminacionMarca } from '../../domain/services/politica-eliminacion-marca.service';
import { Marca } from '../../domain/entities/marca.entity';

describe('RemoveMarcaUseCase', () => {
  let useCase: RemoveMarcaUseCase;
  let repository: jest.Mocked<IMarcaRepository>;
  let usuarioService: jest.Mocked<UsuarioService>;
  let politica: jest.Mocked<PoliticaEliminacionMarca>;

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

    usuarioService = {
      findOne: jest.fn(),
    } as any;

    politica = {
      tieneProductosActivosParaMarca: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveMarcaUseCase,
        { provide: MARCA_REPOSITORY_TOKEN, useValue: repository },
        { provide: UsuarioService, useValue: usuarioService },
        { provide: PoliticaEliminacionMarca, useValue: politica },
      ],
    }).compile();

    useCase = module.get(RemoveMarcaUseCase);
  });

  it('elimina la marca cuando no tiene productos activos', async () => {
    const marca = Marca.reconstitute({
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

    repository.findOne.mockResolvedValue(marca);
    politica.tieneProductosActivosParaMarca.mockResolvedValue(false);
    usuarioService.findOne.mockResolvedValue({ id: 1 } as any);
    repository.remove.mockResolvedValue(undefined);

    const result = await useCase.execute(1, 1);

    expect(repository.findOne).toHaveBeenCalledWith(1);
    expect(politica.tieneProductosActivosParaMarca).toHaveBeenCalledWith(1);
    expect(usuarioService.findOne).toHaveBeenCalledWith(1);
    expect(repository.remove).toHaveBeenCalled();
    expect(result).toHaveProperty('message');
  });

  it('rechaza eliminar una marca que no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999, 1)).rejects.toThrow(NotFoundException);
    expect(politica.tieneProductosActivosParaMarca).not.toHaveBeenCalled();
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('rechaza eliminar una marca de sistema', async () => {
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

    await expect(useCase.execute(1, 1)).rejects.toThrow(ConflictException);
    expect(politica.tieneProductosActivosParaMarca).not.toHaveBeenCalled();
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('rechaza eliminar marca con productos activos asociados', async () => {
    const marca = Marca.reconstitute({
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

    repository.findOne.mockResolvedValue(marca);
    politica.tieneProductosActivosParaMarca.mockResolvedValue(true);

    await expect(useCase.execute(1, 1)).rejects.toThrow(ConflictException);
    expect(usuarioService.findOne).not.toHaveBeenCalled();
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('rechaza eliminar marca ya eliminada', async () => {
    const marcaEliminada = Marca.reconstitute({
      id: 1,
      denominacion: 'toyota',
      observacion: null,
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: 1,
    });

    repository.findOne.mockResolvedValue(marcaEliminada);
    politica.tieneProductosActivosParaMarca.mockResolvedValue(false);
    usuarioService.findOne.mockResolvedValue({ id: 1 } as any);

    await expect(useCase.execute(1, 1)).rejects.toThrow(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('rechaza eliminar si el usuario no existe', async () => {
    const marca = Marca.reconstitute({
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

    repository.findOne.mockResolvedValue(marca);
    politica.tieneProductosActivosParaMarca.mockResolvedValue(false);
    usuarioService.findOne.mockResolvedValue(null);

    await expect(useCase.execute(1, 999)).rejects.toThrow(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
