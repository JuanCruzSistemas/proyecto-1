import { ConflictException, NotFoundException } from '@nestjs/common';
import { RemoveLineaUseCase } from './remove-linea.use-case';
import { Linea } from '../../domain/entities/linea.entity';

const linea = () => Linea.reconstitute({ id: 5, superlineaId: 1, denominacion: 'Bebidas', observacion: null,
  utilizaStockMinimo: false, stockMinimo: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  usuarioCreatedId: 1, usuarioUpdatedId: null, usuarioDeletedId: null, sistema: 0 });

describe('RemoveLineaUseCase', () => {
  let repository: any;
  let usuarios: any;
  let politica: any;
  let useCase: RemoveLineaUseCase;

  beforeEach(() => {
    repository = { findOne: jest.fn(), remove: jest.fn() };
    usuarios = { findOne: jest.fn() };
    politica = { tieneProductosActivosParaLinea: jest.fn() };
    useCase = new RemoveLineaUseCase(repository, usuarios, politica);
  });

  it('impide la baja si tiene productos activos y no marca la Línea como eliminada', async () => {
    const entidad = linea();
    repository.findOne.mockResolvedValue(entidad);
    usuarios.findOne.mockResolvedValue({ id: 2 });
    politica.tieneProductosActivosParaLinea.mockResolvedValue(true);
    await expect(useCase.execute(5, 2)).rejects.toThrow(ConflictException);
    expect(entidad.getDeletedAt()).toBeNull();
    expect(repository.remove).not.toHaveBeenCalled();
  });

  it('realiza baja lógica cuando no tiene productos activos', async () => {
    const entidad = linea();
    repository.findOne.mockResolvedValue(entidad);
    usuarios.findOne.mockResolvedValue({ id: 2 });
    politica.tieneProductosActivosParaLinea.mockResolvedValue(false);
    repository.remove.mockResolvedValue(entidad);
    await useCase.execute(5, 2);
    expect(entidad.getDeletedAt()).toBeInstanceOf(Date);
    expect(entidad.getUsuarioDeletedId()).toBe(2);
    expect(repository.remove).toHaveBeenCalledWith(entidad, { id: 2 });
  });

  it('rechaza una Línea o usuario inexistente sin borrar nada', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(useCase.execute(99, 2)).rejects.toThrow(NotFoundException);
    repository.findOne.mockResolvedValue(linea());
    usuarios.findOne.mockResolvedValue(null);
    await expect(useCase.execute(5, 99)).rejects.toThrow(NotFoundException);
    expect(repository.remove).not.toHaveBeenCalled();
  });
});
