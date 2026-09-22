import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from '../../domain/repositories/producto.repository-interface';


@Injectable()
export class ProductoUniquenessValidator {
  private readonly logger = new Logger(ProductoUniquenessValidator.name);

  constructor(
    @Inject(PRODUCTO_REPOSITORY_TOKEN)
    private readonly repository: IProductoRepository,
  ) {}

  async validarDenominacionUnica(
    denominacion: string,
    excludeId?: number,
  ): Promise<void> {
    const existingProduct = await this.repository.existsByDenominacion(
      denominacion,
      excludeId,
    );

    if (existingProduct) {
      this.logger.warn(
        `Producto - Denominación duplicada: "${denominacion}"`,
      );
      throw new ConflictException(
        `La denominación "${denominacion}" ya está en uso`,
      );
    }
  }

  async  validarCodigoProveedorUnico(codigoProveedor: string, excludeId: number,) {
    const existingProduct = await this.repository.existsByCodigoProveedor(
      codigoProveedor,
      excludeId,
    );

    if (existingProduct) {
      this.logger.warn(
        `Producto - codigo duplicado: "${codigoProveedor}"`,
      );
      throw new ConflictException(
        `El codigo  "${codigoProveedor}" ya está en uso`,
      );
    }
  }
}