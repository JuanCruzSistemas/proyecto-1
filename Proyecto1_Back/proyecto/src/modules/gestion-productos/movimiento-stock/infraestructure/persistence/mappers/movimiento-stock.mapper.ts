import { MovimientoStock } from '../../../domain/entities/movimiento-stock.entity';
import { MovimientoStockEntity } from '../entities/movimiento-stock.orm-entity';

/** Mapper dominio <-> ORM de MovimientoStock. Ver ARCHITECTURE.md §3.3. */
export class MovimientoStockOrmMapper {
  /** SIEMPRE reconstitute() al leer de infraestructura — nunca create(). */
  static toDomain(orm: MovimientoStockEntity): MovimientoStock {
    return MovimientoStock.reconstitute({
      id: orm.id,
      productoId: orm.producto?.id,
      operacionId: orm.operacionId,
      tipoOperacion: orm.tipoOperacion,
      creadoEn: orm.creadoEn,
    });
  }
}
