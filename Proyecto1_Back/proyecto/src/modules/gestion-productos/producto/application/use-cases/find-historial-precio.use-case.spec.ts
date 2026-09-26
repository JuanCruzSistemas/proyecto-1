import { NotFoundException } from '@nestjs/common';
import { FindHistorialPrecioUseCase } from './find-historial-precio.use-case';
import { HistorialPrecioFactory } from '../../domain/factories/historial-precio.factory';
import { crearProducto, crearUsuario } from '../../testing/producto.fixtures-spec';

describe('FindHistorialPrecioUseCase', () => {
  const historialRepository = { findByProductoId: jest.fn() };
  const productoRepository = { findOne: jest.fn() };
  const useCase = new FindHistorialPrecioUseCase(historialRepository as any, productoRepository as any);

  beforeEach(() => jest.clearAllMocks());

  it('devuelve el historial del producto como DTOs', async () => {
    const producto = crearProducto();
    productoRepository.findOne.mockResolvedValue(producto);
    historialRepository.findByProductoId.mockResolvedValue([
      HistorialPrecioFactory.reconstitute({
        id: 1,
        precioAnterior: 130,
        precioNuevo: 150,
        costoAnterior: 100,
        costoNuevo: 100,
        margenAnterior: 0.3,
        margenNuevo: 0.5,
        motivo: 'Ajuste',
        fecha: new Date('2026-03-01T00:00:00Z'),
        producto,
        usuario: crearUsuario(),
      }),
    ]);

    const res = await useCase.execute(100);

    expect(productoRepository.findOne).toHaveBeenCalledWith(100);
    expect(historialRepository.findByProductoId).toHaveBeenCalledWith(100);
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ id: 1, precioAnterior: 130, precioNuevo: 150, motivo: 'Ajuste' });
  });

  it('devuelve lista vacía si el producto no tiene cambios de precio', async () => {
    productoRepository.findOne.mockResolvedValue(crearProducto());
    historialRepository.findByProductoId.mockResolvedValue([]);

    await expect(useCase.execute(100)).resolves.toEqual([]);
  });

  it('lanza NotFound si el producto no existe, sin consultar el historial', async () => {
    productoRepository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(3)).rejects.toThrow(new NotFoundException('Producto con ID 3 no encontrado'));
    expect(historialRepository.findByProductoId).not.toHaveBeenCalled();
  });
});
