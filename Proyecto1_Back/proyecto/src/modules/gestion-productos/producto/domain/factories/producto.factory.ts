import { Producto } from '../entities/producto.entity';
import { ProductoCreateParams, ProductoReconstituteParams } from '../inputs/producto.types';
import { Stock } from '../value-objects/stock.vo';
import { Precio } from '../value-objects/precio.vo';
import { Costo } from '../value-objects/costo.vo';
import { Margen } from '../value-objects/margen.vo';
import { DenominacionRequeridaException } from '../exceptions/denominacion-requerida.exception';

export class ProductoFactory {
    /**
     * Fábrica para un Producto NUEVO, valida invariantes
     */
    public static create(params: ProductoCreateParams): Producto {
        // Sin denominación se autogenera (CR-005); lo que no se admite es una vacía (CR-001)
        if (params.denominacion !== undefined && params.denominacion.trim().length === 0) {
        throw new DenominacionRequeridaException();
        }

        const costo = Costo.create(params.costo);
        const margen = Margen.create(params.margen);
        const precio = Precio.create(costo.getValue(), margen.getValue());

        const producto = new Producto(
            null,
            params.denominacion ?? '',
            params.codigoBarra,
            params.proveedor,
            params.codigoProveedor,
            Stock.create(params.stock),
            params.utilizaStockMinimo,
            params.utilizaStockMinimoPorEmpresa,
            Stock.create(params.stockMinimo),
            costo,
            precio,
            margen,
            new Date(),
            params.destacado,
            params.envioGratis,
            params.observacion,
            new Date(),
            null,
            null,
            params.usuarioCreated,
            null,
            null,
            params.linea,
            params.marca,
            params.presentacion,
            params.utilizaPack,
            params.cantidadPorPack,
            params.imagen,
            params.ubicacion,
            [],
            0,
            params.codigoReferencia,
            false,
        );

        producto.actualizarDenominacion(params.denominacion);

        return producto;
    }

    /**
     * Fábrica para REHIDRATAR desde persistencia, solo usado por el mapper de infraestructura.
     */
    public static reconstitute(params: ProductoReconstituteParams): Producto {
        const costo = Costo.create(params.costo);
        const margen = Margen.create(params.margen);
        const precio = Precio.create(costo.getValue(), margen.getValue());

        return new Producto(
            params.id,
            params.denominacion,
            params.codigoBarra,
            params.proveedor,
            params.codigoProveedor,
            Stock.create(params.stock),
            params.utilizaStockMinimo,
            params.utilizaStockMinimoPorEmpresa,
            Stock.create(params.stockMinimo),
            costo,
            precio,
            margen,
            params.fechaCosto ?? new Date(),
            params.destacado,
            params.envioGratis,
            params.observacion,
            params.createdAt,
            params.updatedAt,
            params.deletedAt,
            params.usuarioCreated,
            params.usuarioUpdated,
            params.usuarioDeleted,
            params.linea,
            params.marca,
            params.presentacion,
            params.utilizaPack,
            params.cantidadPorPack,
            params.imagen,
            params.ubicacion,
            params.movimientosStock,
            params.sistema,
            params.codigoReferencia,
            params.denominacionEditadaManualmente,
        );
    }
}
