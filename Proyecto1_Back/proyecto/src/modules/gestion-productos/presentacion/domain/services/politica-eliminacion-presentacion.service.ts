import { Inject, Injectable } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../../producto/domain/repositories/producto.repository.interface';

@Injectable()
export class PoliticaEliminacionPresentacion {
  constructor(
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly productoRepository: IProductoRepository,
  ) {}

  async tieneProductosActivosParaPresentacion(presentacionId: number): Promise<boolean> {
    return this.productoRepository.existsProductosActivosByPresentacion(presentacionId);
  }
}
