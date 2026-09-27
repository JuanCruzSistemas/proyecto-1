import { DataSource } from 'typeorm';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { IProductoRepository } from '../../domain/repositories/producto.repository.interface';
import { IHistorialPrecioRepository } from '../../domain/repositories/historial-precio.repository.interface';
import { GuardarCambioMasivoUseCase, MOTIVO_CAMBIO_MASIVO } from './guardar-cambio-masivo.use-case';

describe('GuardarCambioMasivoUseCase', () => {
  const usuario = {};

  const crearProducto = (id: number) => ({
    getId: () => id,
    getCosto: () => 100,
    getPrecio: () => 130,
    getMargen: () => 0.3,
    actualizarPrecio: jest.fn(),
  });

  const crearFixture = () => {
    const queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };
    const dataSource = {
      createQueryRunner: jest.fn(() => queryRunner),
    } as unknown as DataSource;
    const repository = {
      findOne: jest.fn(),
      updateEntity: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<IProductoRepository>;
    const historialPrecioRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<IHistorialPrecioRepository>;
    const usuarioValidator = {
      validarUsuarioExiste: jest.fn().mockResolvedValue(usuario),
    } as unknown as jest.Mocked<UsuarioValidator>;
    const useCase = new GuardarCambioMasivoUseCase(repository, historialPrecioRepository, usuarioValidator, dataSource);

    return { useCase, repository, historialPrecioRepository, dataSource, queryRunner };
  };

  it('valida todos los precios antes de iniciar escrituras', async () => {
    const { useCase, repository, dataSource } = crearFixture();
    const productos = [crearProducto(1), crearProducto(2)];
    (repository.findOne as jest.Mock)
      .mockResolvedValueOnce(productos[0])
      .mockResolvedValueOnce(productos[1]);

    await expect(
      useCase.execute(
        [{ id: 1, precioNuevo: 150 }, { id: 2, precioNuevo: -1 }],
        1,
      ),
    ).rejects.toThrow('no es compatible');

    expect(repository.updateEntity).not.toHaveBeenCalled();
    expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
  });

  it('registra un historial por producto con motivo de cambio masivo dentro de la transacción', async () => {
    const { useCase, repository, historialPrecioRepository, queryRunner } = crearFixture();
    const productos = [crearProducto(1), crearProducto(2)];
    (repository.findOne as jest.Mock)
      .mockResolvedValueOnce(productos[0])
      .mockResolvedValueOnce(productos[1]);

    await useCase.execute(
      [{ id: 1, precioNuevo: 150 }, { id: 2, precioNuevo: 160 }],
      1,
    );

    expect(historialPrecioRepository.save).toHaveBeenCalledTimes(2);
    const historial = (historialPrecioRepository.save as jest.Mock).mock.calls[0][0];
    expect(historial.getMotivo()).toBe(MOTIVO_CAMBIO_MASIVO);
    expect(historial.getPrecioAnterior()).toBe(130);
    expect(historial.getMargenAnterior()).toBe(0.3);
    expect(historial.getCostoAnterior()).toBe(100);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('revierte la transacción si falla una escritura del lote', async () => {
    const { useCase, repository, queryRunner } = crearFixture();
    const productos = [crearProducto(1), crearProducto(2)];
    (repository.findOne as jest.Mock)
      .mockResolvedValueOnce(productos[0])
      .mockResolvedValueOnce(productos[1]);
    (repository.updateEntity as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('fallo de persistencia'));

    await expect(
      useCase.execute(
        [{ id: 1, precioNuevo: 150 }, { id: 2, precioNuevo: 160 }],
        1,
      ),
    ).rejects.toThrow('fallo de persistencia');

    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });
});