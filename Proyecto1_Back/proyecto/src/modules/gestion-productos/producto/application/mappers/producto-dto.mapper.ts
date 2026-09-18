import { Producto } from '../../domain/entities/producto.entity';
import { Linea } from 'src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from 'src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { ProductoDto } from '../dto/producto.dto';

export class ProductoDtoMapper {
  static toResponseDto(domainProducto: Producto): ProductoDto {
    return {
      id: domainProducto.getId() ?? 0,
      denominacion: domainProducto.getDenominacion(),
      observacion: domainProducto.getObservacion() ?? '',
      codigoProveedor: domainProducto.getCodigoProveedor() ?? '',
      codigoBarra: domainProducto.getCodigoBarra() ?? '',
      stock: domainProducto.getStock(),
      costo: domainProducto.getCosto(),
      precio: domainProducto.getPrecio(),
      porcentaje: domainProducto.getMargen() * 100,
      destacado: domainProducto.isDestacado(),
      envioGratis: domainProducto.hasEnvioGratis(),
      linea: {
        id: domainProducto.getLinea().getId() ?? 0,
        denominacion: domainProducto.getLinea().getDenominacion(),
      },
      marca: {
        id: domainProducto.getMarca().getId() ?? 0,
        denominacion: domainProducto.getMarca().getDenominacion(),
      },
      ubicacion: domainProducto.getUbicacion() ?? '',
      utilizaStockMinimo: domainProducto.getUtilizaStockMinimo(),
      stockMinimo: domainProducto.getStockMinimo(),
      utilizaPack: domainProducto.getUtilizaPack(),
      cantidadPorPack: domainProducto.getCantidadPorPack() ?? 0,
      sistema: domainProducto.getSistema(),
      codigoReferencia: domainProducto.getCodigoReferencia() ?? '',
    };
  }

  static createDtoToDomain(
    dto: CreateProductoDto,
    linea: Linea,
    marca: Marca,
    usuarioCreated: Usuario,
  ): Producto {
    return Producto.create({
      denominacion: dto.denominacion,
      codigoBarra: dto.codigoBarra ?? null,
      proveedor: null,
      codigoProveedor: dto.codigoProveedor ?? null,
      stock: dto.stock ?? 0,
      utilizaStockMinimo: dto.utilizaStockMinimo,
      utilizaStockMinimoPorEmpresa: false,
      stockMinimo: dto.stockMinimo ?? 0,
      costo: dto.costo ?? 0,
      // `porcentaje` llega como porcentaje (ej.: 30 = 30%); el dominio espera una
      // fracción (0-1). `dto.precio` no se usa: el precio es un VO derivado de
      // costo y margen, nunca un dato de entrada independiente.
      margen: (dto.porcentaje ?? 0) / 100, // el porcentaje llega como, por ejemplo, 30 (30%), la entidad lo usa como 0.30
      destacado: dto.destacado ?? false,
      envioGratis: dto.envioGratis ?? false,
      observacion: dto.observacion ?? null,
      usuarioCreated,
      linea,
      marca,
      utilizaPack: dto.utilizaPack,
      cantidadPorPack: dto.cantidadPorPack ?? null,
      imagen: null,
      ubicacion: dto.ubicacion ?? null,
      codigoReferencia: dto.codigoReferencia ?? null,
    });
  }

  static updateDtoToDomain(
    dto: UpdateProductoDto,
    productoActual: Producto,
    linea: Linea,
    marca: Marca,
    usuarioUpdated: Usuario,
  ): Producto {
    productoActual.actualizarDatos({
      denominacion: dto.denominacion ?? productoActual.getDenominacion(),
      codigoBarra: dto.codigoBarra ?? productoActual.getCodigoBarra(),
      codigoProveedor: dto.codigoProveedor ?? productoActual.getCodigoProveedor(),
      stock: dto.stock ?? productoActual.getStock(),
      utilizaStockMinimo: dto.utilizaStockMinimo ?? productoActual.getUtilizaStockMinimo(),
      utilizaStockMinimoPorEmpresa: productoActual.getUtilizaStockMinimoPorEmpresa(),
      stockMinimo: dto.stockMinimo ?? productoActual.getStockMinimo(),
      costo: dto.costo ?? productoActual.getCosto(),
      margen: dto.porcentaje !== undefined ? dto.porcentaje / 100
                                           : productoActual.getMargen(),
      destacado: dto.destacado ?? productoActual.isDestacado(),
      envioGratis: dto.envioGratis ?? productoActual.hasEnvioGratis(),
      observacion: dto.observacion ?? productoActual.getObservacion(),
      linea,
      marca,
      utilizaPack: dto.utilizaPack ?? productoActual.getUtilizaPack(),
      cantidadPorPack: dto.cantidadPorPack ?? productoActual.getCantidadPorPack(),
      imagen: productoActual.getImagen(),
      ubicacion: dto.ubicacion ?? productoActual.getUbicacion(),
      codigoReferencia: dto.codigoReferencia ?? productoActual.getCodigoReferencia(),
      usuarioUpdated,
    });
    
    return productoActual;
  }
}
