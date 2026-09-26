import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateLineaUseCase } from './update-linea.use-case';
import { Linea } from '../../domain/entities/linea.entity';

const lineaActiva = () => Linea.reconstitute({ id: 5, superlineaId: 1, denominacion: 'Bebidas', observacion: null,
  utilizaStockMinimo: false, stockMinimo: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  usuarioCreatedId: 1, usuarioUpdatedId: null, usuarioDeletedId: null, sistema: 0 });

describe('UpdateLineaUseCase', () => {
  let repository: any;
  let superlineas: any;
  let uniqueness: any;
  let useCase: UpdateLineaUseCase;

  beforeEach(() => {
    repository = { findOne: jest.fn(), update: jest.fn() };
    superlineas = { assertActive: jest.fn() };
    uniqueness = { validarDenominacionUnica: jest.fn() };
    useCase = new UpdateLineaUseCase(repository, superlineas, uniqueness);
  });

  it('conserva la SuperLínea actual cuando el DTO no la envía', async () => {
    const linea = lineaActiva();
    repository.findOne.mockResolvedValue(linea);
    repository.update.mockResolvedValue(linea);
    await useCase.execute(5, { usuarioUpdatedId: 2, utilizaStockMinimo: false } as any);
    expect(superlineas.assertActive).toHaveBeenCalledWith(1);
    expect(repository.update).toHaveBeenCalledWith(5, linea);
  });

  it('cambia la asociación solo luego de validar la SuperLínea activa', async () => {
    const linea = lineaActiva();
    repository.findOne.mockResolvedValue(linea);
    repository.update.mockResolvedValue(linea);
    await useCase.execute(5, { superlineaId: 2, denominacion: 'Bebidas frías', usuarioUpdatedId: 2,
      utilizaStockMinimo: true, stockMinimo: 4 } as any);
    expect(superlineas.assertActive).toHaveBeenCalledWith(2);
    expect(linea.getSuperlineaId()).toBe(2);
    expect(linea.getDenominacion()).toBe('Bebidas frías');
  });

  it('no muta ni persiste si la SuperLínea nueva es inválida', async () => {
    const linea = lineaActiva();
    repository.findOne.mockResolvedValue(linea);
    superlineas.assertActive.mockRejectedValue(new BadRequestException());
    await expect(useCase.execute(5, { superlineaId: 9, usuarioUpdatedId: 2, utilizaStockMinimo: false } as any))
      .rejects.toThrow(BadRequestException);
    expect(linea.getSuperlineaId()).toBe(1);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('no persiste una denominación duplicada', async () => {
    repository.findOne.mockResolvedValue(lineaActiva());
    uniqueness.validarDenominacionUnica.mockRejectedValue(new ConflictException());
    await expect(useCase.execute(5, { denominacion: 'Duplicada', usuarioUpdatedId: 2, utilizaStockMinimo: false } as any))
      .rejects.toThrow(ConflictException);
    expect(superlineas.assertActive).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rechaza actualizar una Línea inexistente', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(useCase.execute(99, { usuarioUpdatedId: 2, utilizaStockMinimo: false } as any))
      .rejects.toThrow(NotFoundException);
  });
});
