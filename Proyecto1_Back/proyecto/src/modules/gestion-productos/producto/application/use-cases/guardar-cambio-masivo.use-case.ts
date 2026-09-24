import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository.interface';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';

@Injectable()
export class GuardarCambioMasivoUseCase {
  constructor(
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly repository: IProductoRepository,
    private readonly usuarioValidator: UsuarioValidator,
  ) {}

  async execute(items: any[], usuarioId: number): Promise<void> {
    const usuario = await this.usuarioValidator.validarUsuarioExiste(usuarioId);
    const productos: { producto: any; precioNuevo: number }[] = [];

    for (const item of items) {
      const producto = await this.repository.findOne(Number(item.id));
      if (!producto) {
        throw new BadRequestException(`Producto con ID ${item.id} no encontrado.`);
      }

      const precioNuevo = Number(
        item.precioOcasionalConIvaNuevo ?? item.precioOcasionalConIva,
      );
      if (!Number.isFinite(precioNuevo) || precioNuevo <= 0) {
        throw new BadRequestException(`Precio inválido para el producto ${item.id}.`);
      }

      productos.push({ producto, precioNuevo });
    }

    for (const { producto, precioNuevo } of productos) {
      producto.actualizarPrecio(precioNuevo, usuario);
      await this.repository.update(producto.getId()!, producto);
    }
  }
}