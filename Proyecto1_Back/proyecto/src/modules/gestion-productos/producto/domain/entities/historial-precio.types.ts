import { Producto } from './producto.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';


export interface HistorialPrecioCreateParams {
  precioAnterior: number;
  precioNuevo: number;
  costoAnterior: number;
  costoNuevo: number;
  margenAnterior: number;
  margenNuevo: number;
  motivo: string;
  producto: Producto;
  usuario: Usuario;
}


export interface HistorialPrecioReconstituteParams extends HistorialPrecioCreateParams {
  id: number;
  fecha: Date;
}
