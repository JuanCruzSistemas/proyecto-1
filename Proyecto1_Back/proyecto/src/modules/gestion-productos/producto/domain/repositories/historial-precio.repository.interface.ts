import { HistorialPrecio } from '../entities/historial-precio.entity';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/unit-of-work.interface';

export interface IHistorialPrecioRepository {
  save(historial: HistorialPrecio, uow?: IUnitOfWork): Promise<HistorialPrecio>;
  findByProductoId(productoId: number): Promise<HistorialPrecio[]>;
}

export const HISTORIAL_PRECIO_REPOSITORY_TOKEN = 'IHistorialPrecioRepository';
