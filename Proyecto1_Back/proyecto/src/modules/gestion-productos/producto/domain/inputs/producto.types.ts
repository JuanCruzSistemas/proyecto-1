import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Presentacion } from '../../../presentacion/domain/entities/presentacion.entity';
import { MovimientoStock } from '../../../movimiento-stock/domain/entities/movimiento-stock.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';

/**
 * Datos necesarios para dar de alta un Producto nuevo. `margen` es una fracción (de 0 a 1).
 */
export interface ProductoCreateParams {
    denominacion?: string;
    codigoBarra: string | null;
    proveedor: Proveedor | null;
    codigoProveedor: string | null;
    stock: number;
    utilizaStockMinimo: boolean;
    utilizaStockMinimoPorEmpresa: boolean;
    stockMinimo: number;
    costo: number;
    margen: number;
    destacado: boolean;
    envioGratis: boolean;
    observacion: string | null;
    usuarioCreated: Usuario;
    linea: Linea;
    marca: Marca;
    presentacion: Presentacion | null;
    utilizaPack: boolean;
    cantidadPorPack: number | null;
    imagen: string | null;
    ubicacion: string | null;
    codigoReferencia: string | null;
}

/**
 * Datos para rehidratar un Producto ya persistido. Uso exclusivo para el mapper de infraestructura.
 */
export interface ProductoReconstituteParams {
    id: number;
    denominacion: string;
    codigoBarra: string | null;
    proveedor: Proveedor | null;
    codigoProveedor: string | null;
    stock: number;
    utilizaStockMinimo: boolean;
    utilizaStockMinimoPorEmpresa: boolean;
    stockMinimo: number;
    costo: number;
    margen: number;
    fechaCosto: Date | null;
    destacado: boolean;
    envioGratis: boolean;
    observacion: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
    usuarioCreated: Usuario;
    usuarioUpdated: Usuario | null;
    usuarioDeleted: Usuario | null;
    linea: Linea;
    marca: Marca;
    presentacion: Presentacion | null;
    utilizaPack: boolean;
    cantidadPorPack: number | null;
    imagen: string | null;
    ubicacion: string | null;
    movimientosStock: MovimientoStock[];
    sistema: number;
    codigoReferencia: string | null;
    denominacionEditadaManualmente: boolean;
}

/**
 * Datos editables de un Producto ya existente
 */
export interface ProductoActualizarDatosParams {
    denominacion?: string;
    codigoBarra: string | null;
    codigoProveedor: string | null;
    stock: number;
    utilizaStockMinimo: boolean;
    utilizaStockMinimoPorEmpresa: boolean;
    stockMinimo: number;
    costo: number;
    margen: number;
    destacado: boolean;
    envioGratis: boolean;
    observacion: string | null;
    linea: Linea;
    marca: Marca;
    presentacion: Presentacion | null;
    utilizaPack: boolean;
    cantidadPorPack: number | null;
    imagen: string | null;
    ubicacion: string | null;
    codigoReferencia: string | null;
    usuarioUpdated: Usuario;
}
