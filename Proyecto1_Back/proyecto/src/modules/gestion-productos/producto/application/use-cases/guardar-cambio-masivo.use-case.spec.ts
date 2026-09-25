import { DataSource } from 'typeorm';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { IProductoRepository } from '../../domain/interfaces/producto.repository-interface';
import { GuardarCambioMasivoUseCase } from './guardar-cambio-masivo.use-case';

describe('GuardarCambioMasivoUseCase', () => {
  const usuario = {};

  const crearProducto = (id: number) => ({
    getId: () => id,
    getCosto: () => 100,
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
    const usuarioValidator = {
      validarUsuarioExiste: jest.fn().mockResolvedValue(usuario),
    } as unknown as jest.Mocked<UsuarioValidator>;
    const useCase = new GuardarCambioMasivoUseCase(repository, usuarioValidator, dataSource);

    return { useCase, repository, dataSource, queryRunner };
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