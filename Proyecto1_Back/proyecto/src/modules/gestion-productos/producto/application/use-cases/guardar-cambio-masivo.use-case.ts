import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository.interface';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { DataSource } from 'typeorm';
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1';
import { IHistorialPrecioRepository, HISTORIAL_PRECIO_REPOSITORY_TOKEN } from '../../domain/repositories/historial-precio.repository.interface';
import { HistorialPrecioFactory } from '../../domain/factories/historial-precio.factory';
import { HistorialPrecio } from '../../domain/entities/historial-precio.entity';

export const MOTIVO_CAMBIO_MASIVO = 'Actualización masiva de precios';

@Injectable()
export class GuardarCambioMasivoUseCase {
  constructor(
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly repository: IProductoRepository,
    @Inject(HISTORIAL_PRECIO_REPOSITORY_TOKEN)
    private readonly historialPrecioRepository: IHistorialPrecioRepository,
    private readonly usuarioValidator: UsuarioValidator,
    private readonly dataSource: DataSource,
  ) {}

  async execute(items: any[], usuarioId: number): Promise<void> {
    const usuario = await this.usuarioValidator.validarUsuarioExiste(usuarioId);
    const productos: { producto: any; historial: HistorialPrecio }[] = [];

    for (const item of items) {
      const producto = await this.repository.findOne(Number(item.id));
      if (!producto) {
        throw new BadRequestException(`Producto con ID ${item.id} no encontrado.`);
      }

      const precioNuevo = Number(item.precioNuevo ?? item.precio);
      const costo = producto.getCosto();
      const precioCompatibleConMargen = costo === 0
        ? precioNuevo === 0
        : precioNuevo >= costo && precioNuevo <= costo * 2;
      if (!Number.isFinite(precioNuevo) || precioNuevo < 0 || !precioCompatibleConMargen) {
        throw new BadRequestException(`El precio del producto ${item.id} no es compatible con su costo y margen permitidos.`,);
      }

      const precioAnterior = producto.getPrecio();
      const margenAnterior = producto.getMargen();
      producto.actualizarPrecio(precioNuevo, usuario);

      const historial = HistorialPrecioFactory.create({
        precioAnterior,
        precioNuevo: producto.getPrecio(),
        costoAnterior: costo,
        costoNuevo: producto.getCosto(),
        margenAnterior,
        margenNuevo: producto.getMargen(),
        motivo: MOTIVO_CAMBIO_MASIVO,
        producto,
        usuario,
      });
      productos.push({ producto, historial });
    }

    // Los precios y sus historiales se guardan en la misma transacción
    const unitOfWork = new TypeOrmUnitOfWork(this.dataSource);
    try {
      await unitOfWork.start();
      for (const { producto, historial } of productos) {
        await this.repository.updateEntity(unitOfWork, producto);
        await this.historialPrecioRepository.save(historial, unitOfWork);
      }
      await unitOfWork.commit();
    } catch (error) {
      await unitOfWork.rollback();
      throw error;
    } finally {
      await unitOfWork.release();
    }
  }
}