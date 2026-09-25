import { BadRequestException, Injectable } from '@nestjs/common';
import { AplicarCambiosMasivosDto, TipoActualizacion } from '../dto/aplicar-cambios-masivos.dto';

@Injectable()
export class AplicarCambioMasivoUseCase {
  async execute(dto: AplicarCambiosMasivosDto): Promise<any[]> {
    return dto.items.map((item) => {
      const precioActual = Number(item.precio);
      const precioNuevo = this.aplicar(precioActual, dto);
      const costo = Number(item.costo);
      const precioCompatibleConMargen = costo === 0
        ? precioNuevo === 0
        : precioNuevo >= costo && precioNuevo <= costo * 2;

        if (!Number.isFinite(precioActual) || !Number.isFinite(costo) ||
          !Number.isFinite(precioNuevo) || precioNuevo < 0 || !precioCompatibleConMargen) {
        throw new BadRequestException(
          `El precio calculado para el producto ${item.id} no es compatible con su costo y margen permitidos.`,
        );
      }

      return { ...item, precioNuevo, dirty: true };
    });
  }

  private aplicar(precio: number, dto: AplicarCambiosMasivosDto): number {
    const base = precio;
    const nuevoPrecio = dto.tipoActualizacion === TipoActualizacion.PORCENTAJE
      ? base * (1 + dto.valor / 100)
      : base + dto.valor;

    return Number(nuevoPrecio.toFixed(2));
  }
}