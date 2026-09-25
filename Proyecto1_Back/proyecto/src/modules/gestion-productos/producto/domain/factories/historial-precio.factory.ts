import { HistorialPrecio } from '../entities/historial-precio.entity';
import {
  HistorialPrecioCreateParams,
  HistorialPrecioReconstituteParams,
} from '../entities/historial-precio.types';


export class HistorialPrecioFactory {
 
  static create(params: HistorialPrecioCreateParams): HistorialPrecio {
    return new HistorialPrecio(
      null, 
      params.precioAnterior,
      params.precioNuevo,
      params.costoAnterior,
      params.costoNuevo,
      params.margenAnterior,
      params.margenNuevo,
      params.motivo,
      new Date(), 
      params.producto,
      params.usuario,
    );
  }

  
  static reconstitute(params: HistorialPrecioReconstituteParams): HistorialPrecio {
    return new HistorialPrecio(
      params.id,
      params.precioAnterior,
      params.precioNuevo,
      params.costoAnterior,
      params.costoNuevo,
      params.margenAnterior,
      params.margenNuevo,
      params.motivo,
      params.fecha,
      params.producto,
      params.usuario,
    );
  }
}
