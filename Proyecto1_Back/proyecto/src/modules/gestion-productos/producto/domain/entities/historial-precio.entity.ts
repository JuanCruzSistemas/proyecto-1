import { Producto } from './producto.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';


export class HistorialPrecio {
  constructor(
    private id: number | null,
    private precioAnterior: number,
    private precioNuevo: number,
    private costoAnterior: number,
    private costoNuevo: number,
    private margenAnterior: number,
    private margenNuevo: number,
    private motivo: string,
    private fecha: Date,
    private producto: Producto,
    private usuario: Usuario,
  ) {}

  

  public getId(): number | null {
    return this.id;
  }

  public getPrecioAnterior(): number {
    return this.precioAnterior;
  }

  public getPrecioNuevo(): number {
    return this.precioNuevo;
  }

  public getCostoAnterior(): number {
    return this.costoAnterior;
  }

  public getCostoNuevo(): number {
    return this.costoNuevo;
  }

  public getMargenAnterior(): number {
    return this.margenAnterior;
  }

  public getMargenNuevo(): number {
    return this.margenNuevo;
  }

  public getMotivo(): string {
    return this.motivo;
  }

  public getFecha(): Date {
    return this.fecha;
  }

  public getProducto(): Producto {
    return this.producto;
  }

  public getUsuario(): Usuario {
    return this.usuario;
  }
}
