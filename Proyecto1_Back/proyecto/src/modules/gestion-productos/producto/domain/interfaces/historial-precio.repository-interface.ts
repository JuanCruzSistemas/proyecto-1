import { HistorialPrecio } from '../entities/historial-precio.entity';

export interface IHistorialPrecioRepository {
  save(historial: HistorialPrecio): Promise<HistorialPrecio>;
  findByProductoId(productoId: number): Promise<HistorialPrecio[]>;
}

export const HISTORIAL_PRECIO_REPOSITORY_TOKEN = 'IHistorialPrecioRepository';
