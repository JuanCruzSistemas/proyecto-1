import { NotFoundException } from '@nestjs/common';
import { ProductoRelatedEntitiesValidator } from './producto-related-entities.validator';
import { crearLinea, crearMarca, crearPresentacion } from '../../testing/producto.fixtures-spec';

describe('ProductoRelatedEntitiesValidator', () => {
  const marcaService = { findEntityById: jest.fn() };
  const lineaService = { findEntityById: jest.fn() };
  const findPresentacion = { execute: jest.fn() };
  const validator = new ProductoRelatedEntitiesValidator(marcaService as any, lineaService as any, findPresentacion as any);

  beforeEach(() => {
    jest.clearAllMocks();
    marcaService.findEntityById.mockResolvedValue(crearMarca());
    lineaService.findEntityById.mockResolvedValue(crearLinea());
    findPresentacion.execute.mockResolvedValue(crearPresentacion());
  });

  it('devuelve marca, línea y presentación cuando existen', async () => {
    const res = await validator.validarYObtenerEntidadesRelacionadas(20, 10, 30);

    expect(marcaService.findEntityById).toHaveBeenCalledWith(20);
    expect(lineaService.findEntityById).toHaveBeenCalledWith(10);
    expect(findPresentacion.execute).toHaveBeenCalledWith(30);
    expect(res.marca.getId()).toBe(20);
    expect(res.linea.getId()).toBe(10);
    expect(res.presentacion!.getId()).toBe(30);
  });

  it('sin presentacionId devuelve presentación null y no la busca', async () => {
    const res = await validator.validarYObtenerEntidadesRelacionadas(20, 10);

    expect(res.presentacion).toBeNull();
    expect(findPresentacion.execute).not.toHaveBeenCalled();
  });

  it('lanza NotFound si la marca no existe', async () => {
    marcaService.findEntityById.mockResolvedValue(null);

    await expect(validator.validarYObtenerEntidadesRelacionadas(20, 10)).rejects.toThrow(
      new NotFoundException('Marca con ID 20 no encontrada'),
    );
  });

  it('lanza NotFound si la línea no existe', async () => {
    lineaService.findEntityById.mockResolvedValue(undefined);

    await expect(validator.validarYObtenerEntidadesRelacionadas(20, 10)).rejects.toThrow(
      new NotFoundException('Línea con ID 10 no encontrada'),
    );
  });

  it('propaga el error si la presentación no existe', async () => {
    findPresentacion.execute.mockRejectedValue(new NotFoundException('Presentación con ID 30 no encontrada.'));

    await expect(validator.validarYObtenerEntidadesRelacionadas(20, 10, 30)).rejects.toThrow(NotFoundException);
  });
});
