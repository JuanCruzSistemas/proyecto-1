import { Producto } from '../../../domain/entities/producto.entity';
import { ProductoFactory } from '../../../domain/factories/producto.factory';
import { ProductoEntity } from '../entities/producto.orm-entity';
import { GetProductoDto } from '../../../application/dto/get-producto.dto';
import { ProductoDto } from '../../../application/dto/producto.dto';
import { MarcaOrmMapper } from 'src/modules/gestion-productos/marca/infraestructure/persistence/mappers/marca.mapper';
import { LineaOrmMapper } from 'src/modules/gestion-productos/linea/infraestructure/persistence/mappers/linea.mapper';
import { PresentacionMapper } from 'src/modules/gestion-productos/presentacion/infraestructure/persistence/mappers/presentacion.mapper';
import { MovimientoStockOrmMapper } from 'src/modules/gestion-productos/movimiento-stock/infraestructure/persistence/mappers/movimiento-stock.mapper';
import { LineaDtoMapper } from 'src/modules/gestion-productos/linea/application/mappers/linea-dto.mapper';
import { MarcaDtoMapper } from 'src/modules/gestion-productos/marca/application/mappers/marca-dto.mapper';
import { PresentacionDtoMapper } from 'src/modules/gestion-productos/presentacion/application/mappers/presentacion-dto.mapper';

export class ProductoMapper {
  static toDomain(orm: ProductoEntity): Producto {
    return ProductoFactory.reconstitute({
      id: orm.id,
      denominacion: orm.denominacion,
      codigoBarra: orm.codigoBarra ?? null,
      proveedor: orm.proveedor ?? null,
      codigoProveedor: orm.codigoProveedor ?? null,
      stock: orm.stock ?? 0,
      utilizaStockMinimo: orm.utilizaStockMinimo,
      utilizaStockMinimoPorEmpresa: orm.utilizaStockMinimoPorEmpresa,
      stockMinimo: orm.stockMinimo ?? 0,
      costo: orm.costo ?? 0,
      margen: (orm.porcentaje ?? 0) / 100,
      fechaCosto: orm.fechaCosto ?? null,
      destacado: orm.destacado ?? false,
      envioGratis: orm.envioGratis ?? false,
      observacion: orm.observacion ?? null,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt ?? null,
      deletedAt: orm.deletedAt ?? null,
      usuarioCreated: orm.usuarioCreated,
      usuarioUpdated: orm.usuarioUpdated ?? null,
      usuarioDeleted: orm.usuarioDeleted ?? null,
      linea: orm.linea ? LineaOrmMapper.toDomain(orm.linea)
                       : (undefined as any),
      marca: orm.marca ? MarcaOrmMapper.toDomain(orm.marca)
                       : (undefined as any),
      presentacion: orm.presentacion ? PresentacionMapper.toDomain(orm.presentacion) : null,
      utilizaPack: orm.utilizaPack,
      cantidadPorPack: orm.cantidadPorPack ?? null,
      imagen: orm.imagen ?? null,
      ubicacion: orm.ubicacion ?? null,
      movimientosStock: (orm.movimientosStock ?? []).map(MovimientoStockOrmMapper.toDomain),
      sistema: orm.sistema,
      codigoReferencia: orm.codigoReferencia ?? null,
      denominacionEditadaManualmente: orm.denominacionEditadaManualmente ?? false,
    });
  }

  /**
   * Vuelca un Producto del dominio a su forma de TypeORM para persistirla. Si se pasa `target`
   * (una fila ya traída desde la BD), se reutiliza esa instancia para que TypeORM la
   * trate como si fueraun UPDATE, si no, se crea una fila nueva.
   */
  static toOrm(producto: Producto, target: ProductoEntity = new ProductoEntity()): ProductoEntity {
    if (producto.getId() !== null) {
      target.id = producto.getId()!;
    }

    target.denominacion = producto.getDenominacion();

    target.codigoBarra = producto.getCodigoBarra() ?? undefined;
    target.codigoProveedor = producto.getCodigoProveedor() ?? undefined;

    target.stock = producto.getStock();
    target.utilizaStockMinimo = producto.getUtilizaStockMinimo();
    target.utilizaStockMinimoPorEmpresa = producto.getUtilizaStockMinimoPorEmpresa();
    target.stockMinimo = producto.getStockMinimo();

    target.costo = producto.getCosto();
    target.precio = producto.getPrecio();
    target.porcentaje = producto.getMargen() * 100; // acá se convierte de fracción => porcentaje (0.30 => 30%)
    target.fechaCosto = producto.getFechaCosto() ?? undefined;

    target.destacado = producto.isDestacado();
    target.envioGratis = producto.hasEnvioGratis();
    target.observacion = producto.getObservacion() ?? undefined;

    target.usuarioCreated = producto.getUsuarioCreated();

    const usuarioUpdated = producto.getUsuarioUpdated();
    if (usuarioUpdated) {
      target.usuarioUpdated = usuarioUpdated;
    }

    const usuarioDeleted = producto.getUsuarioDeleted();
    if (usuarioDeleted) {
      target.usuarioDeleted = usuarioDeleted;
    }

    target.linea = LineaOrmMapper.toOrmReference(producto.getLinea());
    target.marca = MarcaOrmMapper.toOrmReference(producto.getMarca());
    target.presentacion = PresentacionMapper.toOrmReference(producto.getPresentacion());

    target.utilizaPack = producto.getUtilizaPack();
    target.cantidadPorPack = producto.getCantidadPorPack();

    target.imagen = producto.getImagen() ?? undefined;
    target.ubicacion = producto.getUbicacion() ?? undefined;
    target.sistema = producto.getSistema();
    target.codigoReferencia = producto.getCodigoReferencia() ?? undefined;
    target.denominacionEditadaManualmente = producto.getDenominacionEditadaManualmente();

    const deletedAt = producto.getDeletedAt();
    if (deletedAt) {
      target.deletedAt = deletedAt;
    }

    const proveedor = producto.getProveedor();
    if (proveedor) {
      target.proveedor = proveedor;
    }

    return target;
  }

  static toBusquedaDto(producto: Producto): GetProductoDto {
    return {
      id: producto.getId() ?? 0,
      denominacion: producto.getDenominacion(),
      observacion: producto.getObservacion() ?? '',
      codigoProveedorDenominacion: (producto.getCodigoProveedor() ?? '') + ' - ' + producto.getDenominacion(),
      codigoProveedor: producto.getCodigoProveedor() ?? '',
      proveedor: '',
      stock: producto.getStock(),
      costo: producto.getCosto(),
      precio: producto.getPrecio(),
      ubicacion: producto.getUbicacion() ?? '',
      utilizaStockMinimo: producto.getUtilizaStockMinimo(),
      stockMinimo: producto.getStockMinimo(),
      utilizaPack: producto.getUtilizaPack(),
      cantidadPorPack: producto.getCantidadPorPack() ?? 0,
      sistema: producto.getSistema(),
      codigoReferencia: producto.getCodigoReferencia() ?? '',
    };
  }
  
  static toDto(producto: Producto): ProductoDto {
    return {
      id: producto.getId() ?? 0,
      denominacion: producto.getDenominacion(),
      observacion: producto.getObservacion() ?? '',
      codigoProveedor: producto.getCodigoProveedor() ?? '',
      codigoBarra: producto.getCodigoBarra() ?? '',

      stock: producto.getStock(),
      costo: producto.getCosto(),
      precio: producto.getPrecio(),
      porcentaje: producto.getMargen() * 100,

      destacado: producto.isDestacado(),
      envioGratis: producto.hasEnvioGratis(),

      linea: LineaDtoMapper.toReferenciaDto(producto.getLinea()),
      marca: MarcaDtoMapper.toReferenciaDto(producto.getMarca()),
      presentacion: producto.getPresentacion()
                            ? PresentacionDtoMapper.toReferenciaDto(producto.getPresentacion()!)
                            : null,
      ubicacion: producto.getUbicacion() ?? '',

      utilizaStockMinimo: producto.getUtilizaStockMinimo(),
      stockMinimo: producto.getStockMinimo(),

      utilizaPack: producto.getUtilizaPack(),
      cantidadPorPack: producto.getCantidadPorPack() ?? 0,
      
      sistema: producto.getSistema(),
      codigoReferencia: producto.getCodigoReferencia() ?? '',
      denominacionEditadaManualmente: producto.getDenominacionEditadaManualmente(),
    };
  }
}
