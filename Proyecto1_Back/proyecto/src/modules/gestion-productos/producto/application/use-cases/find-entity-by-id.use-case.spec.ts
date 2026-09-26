import { NotFoundException } from '@nestjs/common';
import { FindEntityByIdUseCase } from './find-entity-by-id.use-case';
import { crearProducto } from '../../testing/producto.fixtures-spec';

describe('FindEntityByIdUseCase', () => {
  const repository = { findOne: jest.fn() };
  const useCase = new FindEntityByIdUseCase(repository as any);

  beforeEach(() => jest.clearAllMocks());

  it('devuelve la entidad de dominio encontrada', async () => {
    const producto = crearProducto();
    repository.findOne.mockResolvedValue(producto);

    await expect(useCase.execute(100)).resolves.toBe(producto);
    expect(repository.findOne).toHaveBeenCalledWith(100);
  });

  it('lanza NotFound si no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(7)).rejects.toThrow(new NotFoundException('Producto con ID 7 no encontrado.'));
  });
});
