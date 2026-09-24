import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdatePrecioUseCase } from './update-precio.use-case';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository.interface';
import { ProductoFactory } from '../../domain/factories/producto.factory';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { UpdatePrecioDto } from '../dto/update-precio.dto';
import { DataSource } from 'typeorm';
import {
  HISTORIAL_PRECIO_REPOSITORY_TOKEN,
  IHistorialPrecioRepository,
} from '../../domain/repositories/historial-precio.repository.interface';

describe('UpdatePrecioUseCase', () => {
  let useCase: UpdatePrecioUseCase;
  let repository: jest.Mocked<IProductoRepository>;
  let usuarioValidator: jest.Mocked<Pick<UsuarioValidator, 'validarUsuarioExiste'>>;
  let historialPrecioRepository: jest.Mocked<IHistorialPrecioRepository>;
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
  };

  const usuario = { id: 1 } as Usuario;
  const linea = Linea.create({
    superlineaId: 1,
    denominacion: 'Aceites',
    observacion: null,
    utilizaStockMinimo: false,
    stockMinimo: 0,
    usuarioCreatedId: 1,
  });
  const marca = Marca.create({
    denominacion: 'Genérica',
    observacion: null,
    usuarioCreatedId: 1,
  });

  const crearProducto = () =>
    ProductoFactory.create({
      denominacion: 'Producto de prueba',
      codigoBarra: null,
      proveedor: null,
      codigoProveedor: null,
      stock: 10,
      utilizaStockMinimo: false,
      utilizaStockMinimoPorEmpresa: false,
      stockMinimo: 2,
      costo: 100,
      margen: 0.2,
      destacado: false,
      envioGratis: false,
      observacion: null,
      usuarioCreated: usuario,
      linea,
      marca,
      presentacion: null,
      utilizaPack: false,
      cantidadPorPack: null,
      imagen: null,
      ubicacion: null,
      codigoReferencia: null,
    });

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByIdConAuditoria: jest.fn(),
      findByDenominacion: jest.fn(),
      findBy: jest.fn(),
      findByRapido: jest.fn(),
      findByIdWithoutRelations: jest.fn(),
      update: jest.fn(),
      updateEntity: jest.fn(),
      remove: jest.fn(),
      isCodigoProveedorDuplicado: jest.fn(),
      findByDenominacionCodigoProveedorFiltered: jest.fn(),
      existsByDenominacion: jest.fn(),
      existsByCodigoProveedor: jest.fn(),
      existsProductosActivosByMarca: jest.fn(),
      existsProductosActivosByLinea: jest.fn(),
      existsProductosActivosByPresentacion: jest.fn(),
      findByIds: jest.fn(),
    };
    usuarioValidator = { validarUsuarioExiste: jest.fn().mockResolvedValue(usuario) };
    historialPrecioRepository = {
      save: jest.fn(),
      findByProductoId: jest.fn(),
    };
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    const dataSource = { createQueryRunner: jest.fn().mockReturnValue(queryRunner) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePrecioUseCase,
        { provide: PRODUCTO_REPOSITORY_TOKEN, useValue: repository },
        { provide: HISTORIAL_PRECIO_REPOSITORY_TOKEN, useValue: historialPrecioRepository },
        { provide: UsuarioValidator, useValue: usuarioValidator },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    useCase = module.get(UpdatePrecioUseCase);
  });

  it('recalcula costo y precio a partir del porcentaje y persiste el producto y su historial en una transacción', async () => {
    const producto = crearProducto();
    repository.findOne.mockResolvedValue(producto);
    repository.updateEntity.mockResolvedValue(producto);

    const dto: UpdatePrecioDto = { costo: 200, porcentaje: 50, usuarioId: usuario.id, motivo: 'Aumento del proveedor' };
    await useCase.execute(1, dto);

    expect(producto.getCosto()).toBe(200);
    expect(producto.getPrecio()).toBeCloseTo(300);
    expect(repository.updateEntity).toHaveBeenCalledWith(expect.anything(), producto);

    const [historial, uow] = historialPrecioRepository.save.mock.calls[0];
    expect(uow).toBeDefined();
    expect(historial.getMotivo()).toBe('Aumento del proveedor');
    expect(historial.getPrecioAnterior()).toBeCloseTo(120);
    expect(historial.getPrecioNuevo()).toBeCloseTo(300);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('hace rollback si falla el guardado del historial', async () => {
    const producto = crearProducto();
    repository.findOne.mockResolvedValue(producto);
    repository.updateEntity.mockResolvedValue(producto);
    historialPrecioRepository.save.mockRejectedValue(new Error('fallo historial'));

    await expect(
      useCase.execute(1, { costo: 200, porcentaje: 50, usuarioId: usuario.id, motivo: 'Aumento' }),
    ).rejects.toThrow('fallo historial');

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('lanza NotFoundException si el producto no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      useCase.execute(999, { costo: 1, porcentaje: 1, usuarioId: usuario.id, motivo: 'Aumento' }),
    ).rejects.toThrow(NotFoundException);
    expect(repository.updateEntity).not.toHaveBeenCalled();
    expect(historialPrecioRepository.save).not.toHaveBeenCalled();
  });
});
