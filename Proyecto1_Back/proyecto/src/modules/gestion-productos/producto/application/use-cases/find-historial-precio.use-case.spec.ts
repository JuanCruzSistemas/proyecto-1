import { NotFoundException } from '@nestjs/common';
import { FindHistorialPrecioUseCase } from './find-historial-precio.use-case';
import { HistorialPrecioDtoMapper } from '../mappers/historial-precio-dto.mapper';

describe('FindHistorialPrecioUseCase', () => {
  let useCase: FindHistorialPrecioUseCase;
  let productoRepository: { findOne: jest.Mock };
  let historialPrecioRepository: { findByProductoId: jest.Mock };

  beforeEach(() => {
    productoRepository = {
      findOne: jest.fn(), // O findById según use tu caso de uso
    };
    historialPrecioRepository = {
      findByProductoId: jest.fn(),
    };

    // Constructor con solo 2 argumentos:
    useCase = new FindHistorialPrecioUseCase(
      productoRepository as any,
      historialPrecioRepository as any,
    );
  });

  it('debe retornar la lista de historial mapeada cuando el producto existe', async () => {
    const productoId = 1;
    const mockEntities = [
      { id: 1, precioAnterior: 100, precioNuevo: 120, motivo: 'Ajuste 1' },
      { id: 2, precioAnterior: 120, precioNuevo: 150, motivo: 'Ajuste 2' },
    ];

    productoRepository.findOne.mockResolvedValue({ id: productoId });
    historialPrecioRepository.findByProductoId.mockResolvedValue(mockEntities);

    jest.spyOn(HistorialPrecioDtoMapper, 'toDto').mockImplementation((entity: any) => ({
      id: entity.id,
      precioAnterior: entity.precioAnterior,
      precioNuevo: entity.precioNuevo,
      costoAnterior: 80,
      costoNuevo: 90,
      margenAnterior: 20,
      margenNuevo: 25,
      motivo: entity.motivo,
      fecha: '2026-09-25',
      usuarioId: 1, // Campo obligatorio requerido por HistorialPrecioDto
      usuarioNombre: 'Admin',
    } as any));

    const result = await useCase.execute(productoId);

    expect(productoRepository.findOne).toHaveBeenCalledWith(expect.anything());
    expect(historialPrecioRepository.findByProductoId).toHaveBeenCalledWith(productoId);
    expect(result).toHaveLength(2);
  });

  it('debe lanzar NotFoundException si el producto consultado no existe', async () => {
    productoRepository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    expect(historialPrecioRepository.findByProductoId).not.toHaveBeenCalled();
  });
});
