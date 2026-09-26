import { NotFoundException } from '@nestjs/common';
import { FindDtoByIdUseCase } from './find-dto-by-id.use-case';
import { crearProducto } from '../../testing/producto.fixtures-spec';

describe('FindDtoByIdUseCase', () => {
  const repository = { findOne: jest.fn() };
  const useCase = new FindDtoByIdUseCase(repository as any);

  beforeEach(() => jest.clearAllMocks());

  it('devuelve el producto como ProductoDto (margen expresado en %)', async () => {
    repository.findOne.mockResolvedValue(crearProducto({ costo: 200, margen: 0.25 }));

    const dto = await useCase.execute(100);

    expect(repository.findOne).toHaveBeenCalledWith(100);
    expect(dto).toMatchObject({
      id: 100,
      denominacion: 'NATURA ACEITES 1L',
      costo: 200,
      precio: 250,
      porcentaje: 25,
      linea: { id: 10, denominacion: 'ACEITES' },
      marca: { id: 20, denominacion: 'NATURA' },
      presentacion: { id: 30, denominacion: '1L' },
      observacion: '',
      denominacionEditadaManualmente: false,
    });
  });

  it('lanza NotFound si no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(5)).rejects.toThrow(new NotFoundException('Producto con ID 5 no encontrado.'));
  });
});
