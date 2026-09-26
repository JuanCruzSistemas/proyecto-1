import { MovimientoStock } from '../../../domain/entities/movimiento-stock.entity';
import { MovimientoStockEntity } from '../entities/movimiento-stock.orm-entity';

export class MovimientoStockOrmMapper {
  static toDomain(orm: MovimientoStockEntity): MovimientoStock {
    return MovimientoStock.reconstitute({
      id: orm.id,
      productoId: orm.producto?.id,
      operacionId: orm.operacionId,
      tipoOperacion: orm.tipoOperacion,
      creadoEn: orm.creadoEn
    });
  }
}
