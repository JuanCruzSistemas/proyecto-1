import { Inject, Injectable } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../../producto/domain/repositories/producto.repository-interface';

@Injectable()
export class PoliticaEliminacionLinea {
  constructor(
     @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly productoRepository: IProductoRepository,
  ) {}

  async tieneProductosActivosParaLinea(lineaId: number): Promise<boolean> {
    return this.productoRepository.existsProductosActivosByLinea(lineaId);
  }
}