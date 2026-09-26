import { Test, TestingModule } from '@nestjs/testing';
import { PoliticaEliminacionMarca } from './politica-eliminacion-marca.service';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../../producto/domain/repositories/producto.repository.interface';

describe('PoliticaEliminacionMarca', () => {
  let service: PoliticaEliminacionMarca;
  let productoRepository: jest.Mocked<IProductoRepository>;

  beforeEach(async () => {
    productoRepository = {
      existsProductosActivosByMarca: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliticaEliminacionMarca,
        { provide: PRODUCTO_REPOSITORY_TOKEN, useValue: productoRepository },
      ],
    }).compile();

    service = module.get(PoliticaEliminacionMarca);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('retorna true cuando la marca tiene productos activos', async () => {
    productoRepository.existsProductosActivosByMarca.mockResolvedValue(true);

    const result = await service.tieneProductosActivosParaMarca(1);

    expect(productoRepository.existsProductosActivosByMarca).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('retorna false cuando la marca no tiene productos activos', async () => {
    productoRepository.existsProductosActivosByMarca.mockResolvedValue(false);

    const result = await service.tieneProductosActivosParaMarca(2);

    expect(productoRepository.existsProductosActivosByMarca).toHaveBeenCalledWith(2);
    expect(result).toBe(false);
  });
});
