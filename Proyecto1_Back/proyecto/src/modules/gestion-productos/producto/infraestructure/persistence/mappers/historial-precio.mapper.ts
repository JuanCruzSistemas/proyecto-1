import { HistorialPrecio } from '../../../domain/entities/historial-precio.entity';
import { HistorialPrecioFactory } from '../../../domain/factories/historial-precio.factory';
import { HistorialPrecioOrmEntity } from '../entities/historial-precio-orm.entity';
import { ProductoMapper } from './producto.mapper';

export class HistorialPrecioMapper {
  
  static toDomain(orm: HistorialPrecioOrmEntity): HistorialPrecio {
    return HistorialPrecioFactory.reconstitute({
      id: orm.id,
      precioAnterior: orm.precioAnterior,
      precioNuevo: orm.precioNuevo,
      costoAnterior: orm.costoAnterior,
      costoNuevo: orm.costoNuevo,
      margenAnterior: orm.margenAnterior,
      margenNuevo: orm.margenNuevo,
      motivo: orm.motivo,
      fecha: orm.fecha,
      producto: ProductoMapper.toDomain(orm.producto),
      usuario: orm.usuario,
    });
  }

 
  static toOrm(
    historial: HistorialPrecio,
    target: HistorialPrecioOrmEntity = new HistorialPrecioOrmEntity(),
  ): HistorialPrecioOrmEntity {
    if (historial.getId() !== null) {
      target.id = historial.getId()!;
    }

    target.precioAnterior = historial.getPrecioAnterior();
    target.precioNuevo = historial.getPrecioNuevo();
    target.costoAnterior = historial.getCostoAnterior();
    target.costoNuevo = historial.getCostoNuevo();
    target.margenAnterior = historial.getMargenAnterior();
    target.margenNuevo = historial.getMargenNuevo();
    target.motivo = historial.getMotivo();
    target.fecha = historial.getFecha();

    const producto = historial.getProducto();
    if (producto && producto.getId() !== null) {
      target.productoId = producto.getId()!;
    }

    const usuario = historial.getUsuario();
    if (usuario && usuario.id) {
      target.usuarioId = usuario.id;
    }

    return target;
  }
}
