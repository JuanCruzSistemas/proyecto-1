import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  IHistorialPrecioRepository,
  HISTORIAL_PRECIO_REPOSITORY_TOKEN,
} from '../../domain/repositories/historial-precio.repository.interface';
import {
  IProductoRepository,
  PRODUCTO_REPOSITORY_TOKEN,
} from '../../domain/repositories/producto.repository.interface';
import { HistorialPrecioDto } from '../dto/historial.dto';
import { HistorialPrecioDtoMapper } from '../mappers/historial-precio-dto.mapper';


@Injectable()
export class FindHistorialPrecioUseCase {
  private readonly logger = new Logger(FindHistorialPrecioUseCase.name);

  constructor(
    @Inject(HISTORIAL_PRECIO_REPOSITORY_TOKEN)
    private readonly historialPrecioRepository: IHistorialPrecioRepository,
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly productoRepository: IProductoRepository,
  ) {}

  
  async execute(productoId: number): Promise<HistorialPrecioDto[]> {
    const producto = await this.productoRepository.findOne(productoId);
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    const historiales = await this.historialPrecioRepository.findByProductoId(productoId);

    this.logger.log(
      `Consultando historial de precios para producto ID: ${productoId} - ${historiales.length} registros encontrados`,
    );

    return HistorialPrecioDtoMapper.toDtoList(historiales);
  }
}
