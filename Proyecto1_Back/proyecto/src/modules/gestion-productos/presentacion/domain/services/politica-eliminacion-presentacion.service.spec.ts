import { Test, TestingModule } from '@nestjs/testing';
import { PoliticaEliminacionPresentacion } from './politica-eliminacion-presentacion.service';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../../producto/domain/repositories/producto.repository.interface';

describe('PoliticaEliminacionPresentacion', () => {
  let service: PoliticaEliminacionPresentacion;
  let productoRepository: jest.Mocked<IProductoRepository>;

  beforeEach(async () => {
    productoRepository = {
      existsProductosActivosByPresentacion: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliticaEliminacionPresentacion,
        { provide: PRODUCTO_REPOSITORY_TOKEN, useValue: productoRepository },
      ],
    }).compile();

    service = module.get(PoliticaEliminacionPresentacion);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('retorna true cuando la presentación tiene productos activos', async () => {
    productoRepository.existsProductosActivosByPresentacion.mockResolvedValue(true);

    const result = await service.tieneProductosActivosParaPresentacion(1);

    expect(productoRepository.existsProductosActivosByPresentacion).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('retorna false cuando la presentación no tiene productos activos', async () => {
    productoRepository.existsProductosActivosByPresentacion.mockResolvedValue(false);

    const result = await service.tieneProductosActivosParaPresentacion(2);

    expect(productoRepository.existsProductosActivosByPresentacion).toHaveBeenCalledWith(2);
    expect(result).toBe(false);
  });
});
