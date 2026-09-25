import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AplicarCambiosMasivosDto, TipoActualizacion } from '../dto/aplicar-cambios-masivos.dto';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository.interface';
import { Producto } from '../../domain/entities/producto.entity';

@Injectable()
export class AplicarCambioMasivoUseCase {
  constructor(
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly repository: IProductoRepository,
  ) {}

  async execute(dto: AplicarCambiosMasivosDto): Promise<any[]> {
    // Costo, margen y precio se toman de la base (fuente de verdad), no de la grilla del frontend.
    const productos = await this.repository.findByIds(dto.items.map((item) => Number(item.id)));
    const productosPorId = new Map(productos.map((producto) => [producto.getId(), producto]));

    return dto.items.map((item) => {
      const producto = productosPorId.get(Number(item.id));
      if (!producto) {
        throw new BadRequestException(`Producto con ID ${item.id} no encontrado.`);
      }

      const costo = producto.getCosto();
      const precioActual = producto.getPrecio();
      const precioNuevo = this.aplicar(producto, dto);
      const precioCompatibleConMargen = costo === 0
        ? precioNuevo === 0
        : precioNuevo >= costo && precioNuevo <= costo * 2;

      if (!Number.isFinite(precioActual) || !Number.isFinite(costo) ||
        !Number.isFinite(precioNuevo) || precioNuevo < 0 || !precioCompatibleConMargen) {
        throw new BadRequestException(
          `El precio calculado para el producto ${item.id} no es compatible con su costo y margen permitidos.`,
        );
      }

      return { ...item, costo, precio: precioActual, precioNuevo, dirty: true };
    });
  }

  private aplicar(producto: Producto, dto: AplicarCambiosMasivosDto): number {
    // PORCENTAJE es el nuevo margen y reemplaza al actual (30% con valor 10 => 10%).
    const nuevoPrecio = dto.tipoActualizacion === TipoActualizacion.PORCENTAJE
      ? producto.getCosto() * (1 + dto.valor / 100)
      : producto.getPrecio() + dto.valor;

    return Number(nuevoPrecio.toFixed(2));
  }
}
