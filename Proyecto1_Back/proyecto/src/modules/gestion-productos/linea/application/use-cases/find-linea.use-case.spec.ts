import { FindLineaUseCase } from './find-linea.use-case';
import { Linea } from '../../domain/entities/linea.entity';

describe('FindLineaUseCase', () => {
  const linea = Linea.reconstitute({ id: 1, superlineaId: 7, denominacion: 'Bebidas', observacion: null,
    utilizaStockMinimo: false, stockMinimo: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    usuarioCreatedId: 1, usuarioUpdatedId: null, usuarioDeletedId: null, sistema: 0 });
  const repository = { findByDenominacionFiltered: jest.fn(), findAllFor: jest.fn(), findAllListado: jest.fn() };
  const useCase = new FindLineaUseCase(repository as any);

  beforeEach(() => jest.clearAllMocks());

  it('mapea búsqueda paginada conservando la asociación a SuperLínea y el total', async () => {
    repository.findByDenominacionFiltered.mockResolvedValue({ data: [linea], total: 1 });
    const result = await useCase.findByDenominacionFiltered('beb', 0, 10, false);
    expect(repository.findByDenominacionFiltered).toHaveBeenCalledWith('beb', 0, 10, false);
    expect(result).toEqual({ data: [expect.objectContaining({ id: 1, superlineaId: 7, denominacion: 'Bebidas' })], total: 1 });
  });

  it('devuelve el catálogo de Líneas para selectores', async () => {
    repository.findAllFor.mockResolvedValue([linea]);
    const result = await useCase.findAllFor('beb');
    expect(result.data[0]).toEqual(expect.objectContaining({ superlineaId: 7 }));
    expect(result.total).toBe(1);
  });
});
