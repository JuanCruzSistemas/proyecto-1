import { FindByDenominacionUseCase } from './find-by-denominiacion.use-case';
import { crearProducto } from '../../testing/producto.fixtures-spec';

describe('FindByDenominacionUseCase', () => {
  const repository = { findByDenominacionCodigoProveedorFiltered: jest.fn() };
  const useCase = new FindByDenominacionUseCase(repository as any);

  beforeEach(() => jest.clearAllMocks());

  it('busca con la paginación recibida y mapea al DTO de búsqueda', async () => {
    repository.findByDenominacionCodigoProveedorFiltered.mockResolvedValue({
      data: [crearProducto({ id: 1, codigoProveedor: 'A-1', denominacion: 'ACEITE' })],
      total: 31,
    });

    const res = await useCase.execute('ACE', 20, 5);

    expect(repository.findByDenominacionCodigoProveedorFiltered).toHaveBeenCalledWith('ACE', 20, 5);
    expect(res.total).toBe(31);
    expect(res.data).toEqual([
      expect.objectContaining({
        id: 1,
        denominacion: 'ACEITE',
        codigoProveedor: 'A-1',
        codigoProveedorDenominacion: 'A-1 - ACEITE',
        proveedor: '',
      }),
    ]);
  });

  it('usa skip=0 y take=10 por defecto', async () => {
    repository.findByDenominacionCodigoProveedorFiltered.mockResolvedValue({ data: [], total: 0 });

    await expect(useCase.execute('X')).resolves.toEqual({ data: [], total: 0 });
    expect(repository.findByDenominacionCodigoProveedorFiltered).toHaveBeenCalledWith('X', 0, 10);
  });
});
