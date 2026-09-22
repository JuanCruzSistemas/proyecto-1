import { Inject, Injectable } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../../producto/domain/repositories/producto.repository-interface';

@Injectable()
export class PoliticaEliminacionMarca {
  constructor(
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly productoRepository: IProductoRepository,
  ) {}

  async tieneProductosActivosParaMarca(marcaId: number): Promise<boolean> {
    return this.productoRepository.existsProductosActivosByMarca(marcaId);
  }
}