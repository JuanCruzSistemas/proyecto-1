import { Injectable } from '@nestjs/common';
import { AplicarCambiosMasivosDto, TipoActualizacion } from '../dto/aplicar-cambios-masivos.dto';

@Injectable()
export class AplicarCambioMasivoUseCase {
  async execute(dto: AplicarCambiosMasivosDto): Promise<any[]> {
    return dto.items.map((item) => ({
      ...item,
      precioOcasionalConIvaNuevo: this.aplicar(item.precioOcasionalConIva, dto),
      precioMayoristaConIvaNuevo: this.aplicar(item.precioMayoristaConIva, dto),
      precioClienteConIvaNuevo: this.aplicar(item.precioClienteConIva, dto),
      precioOfertaConIvaNuevo: this.aplicar(item.precioOfertaConIva, dto),
      dirty: true,
    }));
  }

  private aplicar(precio: number | undefined, dto: AplicarCambiosMasivosDto): number {
    const base = Number(precio ?? 0);
    const nuevoPrecio = dto.tipoActualizacion === TipoActualizacion.PORCENTAJE
      ? base * (1 + dto.valor / 100)
      : base + dto.valor;

    return Number(nuevoPrecio.toFixed(2));
  }
}