import { HistorialPrecio } from '../../domain/entities/historial-precio.entity';
import { HistorialPrecioDto } from '../dto/historial.dto';


export class HistorialPrecioDtoMapper {
 
   
  static toDto(historial: HistorialPrecio): HistorialPrecioDto {
    const usuario = historial.getUsuario();
    
    return {
      id: historial.getId() ?? 0,
      precioAnterior: historial.getPrecioAnterior(),
      precioNuevo: historial.getPrecioNuevo(),
      costoAnterior: historial.getCostoAnterior(),
      costoNuevo: historial.getCostoNuevo(),
      margenAnterior: historial.getMargenAnterior(),
      margenNuevo: historial.getMargenNuevo(),
      motivo: historial.getMotivo(),
      fecha: historial.getFecha(),
      usuarioNombre: usuario.denominacion,
      usuarioId: usuario.id,
    };
  }

  static toDtoList(historiales: HistorialPrecio[]): HistorialPrecioDto[] {
    return historiales.map((historial) => this.toDto(historial));
  }
}
