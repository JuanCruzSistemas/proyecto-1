import { FindByProductoUseCase } from './find-by-producto.use-case';
import { crearProducto } from '../../testing/producto.fixtures-spec';

describe('FindByProductoUseCase', () => {
  const repository = { findByRapido: jest.fn(), findBy: jest.fn() };
  const useCase = new FindByProductoUseCase(repository as any);

  beforeEach(() => jest.clearAllMocks());

  describe('findByRapido()', () => {
    it('delega en el repositorio y mapea al DTO de búsqueda', async () => {
      repository.findByRapido.mockResolvedValue({
        data: [crearProducto({ codigoProveedor: null, cantidadPorPack: null })],
        total: 1,
      });

      const res = await useCase.findByRapido('NAT', true, 0, 10);

      expect(repository.findByRapido).toHaveBeenCalledWith('NAT', true, 0, 10);
      expect(res.total).toBe(1);
      expect(res.data[0]).toMatchObject({
        id: 100,
        codigoProveedor: '',
        codigoProveedorDenominacion: ' - NATURA ACEITES 1L',
        cantidadPorPack: 0,
        precio: 130,
      });
    });
  });

  describe('findBy()', () => {
    it('pasa todos los filtros al repositorio en orden', async () => {
      repository.findBy.mockResolvedValue({ data: [crearProducto()], total: 12 });

      const res = await useCase.findBy('ACE', 'P-1', true, 'REF', 20, 10, 5, true, 10, 5, 'ACEITES', 'ALMACEN');

      expect(repository.findBy).toHaveBeenCalledWith('ACE', 'P-1', true, 'REF', 20, 10, 5, true, 10, 5, 'ACEITES', 'ALMACEN');
      expect(res.total).toBe(12);
      expect(res.data).toHaveLength(1);
      expect(res.data[0].denominacion).toBe('NATURA ACEITES 1L');
    });

    it('devuelve lista vacía cuando no hay resultados', async () => {
      repository.findBy.mockResolvedValue({ data: [], total: 0 });

      await expect(
        useCase.findBy('', '', false, '', 0, 0, 0, false, 0, 10),
      ).resolves.toEqual({ data: [], total: 0 });
    });
  });
});
