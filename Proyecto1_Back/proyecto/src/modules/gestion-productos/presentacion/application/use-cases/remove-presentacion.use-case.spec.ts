import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RemovePresentacionUseCase } from './remove-presentacion.use-case';
import { PoliticaEliminacionPresentacion } from '../../domain/services/politica-eliminacion-presentacion.service';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { IProductoRepository } from 'src/modules/gestion-productos/producto/domain/repositories/producto.repository-interface';
import { Presentacion } from '../../domain/entities/presentacion.entity';

describe('RemovePresentacionUseCase', () => {
  let useCase: RemovePresentacionUseCase;
  let repository: jest.Mocked<IPresentacionRepository>;
  let productoRepository: jest.Mocked<Pick<IProductoRepository, 'existsProductosActivosByPresentacion'>>;

  const crearPresentacion = () =>
    Presentacion.reconstitute({
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
    productoRepository = { existsProductosActivosByPresentacion: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemovePresentacionUseCase,
        PoliticaEliminacionPresentacion,
        { provide: PRESENTACION_REPOSITORY_TOKEN, useValue: repository },
        { provide: 'IProductoRepository', useValue: productoRepository },
      ],
    }).compile();

    useCase = module.get(RemovePresentacionUseCase);
  });

  it('marca la presentación como eliminada y persiste esa entidad mutada', async () => {
    const presentacion = crearPresentacion();
    repository.findOne.mockResolvedValue(presentacion);
    productoRepository.existsProductosActivosByPresentacion.mockResolvedValue(false);
    repository.remove.mockResolvedValue(presentacion);

    await useCase.execute(1, 2);

    expect(presentacion.getDeletedAt()).not.toBeNull();
    expect(repository.remove).toHaveBeenCalledWith(presentacion, 2);
  });

  it('rechaza eliminar una presentación asociada a productos activos', async () => {
    const presentacion = crearPresentacion();
    repository.findOne.mockResolvedValue(presentacion);
    productoRepository.existsProductosActivosByPresentacion.mockResolvedValue(true);

    await expect(useCase.execute(1, 2)).rejects.toThrow(ConflictException);
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si la presentación no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999, 2)).rejects.toThrow(NotFoundException);
  });
});
