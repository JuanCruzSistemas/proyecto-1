import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateLineaUseCase } from './create-linea.use-case';
import { Linea } from '../../domain/entities/linea.entity';

describe('CreateLineaUseCase', () => {
  const dto = { denominacion: 'Bebidas', superlineaId: 3, observacion: undefined,
    utilizaStockMinimo: true, stockMinimo: 5, usuarioCreatedId: 1, deletedAt: null };
  let repository: any;
  let superlineas: any;
  let uniqueness: any;
  let useCase: CreateLineaUseCase;

  beforeEach(() => {
    repository = { create: jest.fn() };
    superlineas = { assertActive: jest.fn() };
    uniqueness = { validarDenominacionUnica: jest.fn() };
    useCase = new CreateLineaUseCase(repository, superlineas, uniqueness);
  });

  it('valida unicidad y SuperLínea activa antes de persistir', async () => {
    repository.create.mockImplementation(async (linea: Linea) => linea);
    await useCase.execute(dto);

    expect(uniqueness.validarDenominacionUnica).toHaveBeenCalledWith('Bebidas', 0);
    expect(superlineas.assertActive).toHaveBeenCalledWith(3);
    const lineaEnviada = repository.create.mock.calls[0][0] as Linea;
    expect(lineaEnviada.getSuperlineaId()).toBe(3);
    expect(lineaEnviada.getStockMinimo()).toBe(5);
  });

  it('no guarda si la denominación ya existe', async () => {
    uniqueness.validarDenominacionUnica.mockRejectedValue(new ConflictException());
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(superlineas.assertActive).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('no guarda si la SuperLínea es inválida o está dada de baja', async () => {
    superlineas.assertActive.mockRejectedValue(new BadRequestException('Debe seleccionar una SuperLínea válida y activa.'));
    await expect(useCase.execute(dto)).rejects.toThrow('Debe seleccionar una SuperLínea válida y activa.');
    expect(repository.create).not.toHaveBeenCalled();
  });
});
