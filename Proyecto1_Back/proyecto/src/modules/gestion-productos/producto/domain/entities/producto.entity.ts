import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { MovimientoStock } from '../../../movimiento-stock/domain/entities/movimiento-stock.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';
import { Stock } from '../value-objects/stock.vo';
import { Precio } from '../value-objects/precio.vo';
import { Costo } from '../value-objects/costo.vo';
import { Margen } from '../value-objects/margen.vo';
import { ProductoActualizarDatosParams } from './producto.types';
import { MotivoRequeridoException } from '../exceptions/motivo-requerido.exception';

/**
 * No instanciar directamente. Usar siempre `ProductoFactory.create()` /
 * `ProductoFactory.reconstitute()`
 */
export class Producto {
    constructor(
        private id: number | null,
        private denominacion: string,
        private codigoBarra: string | null,

        // ======= Proveedor ========
        private proveedor: Proveedor | null,
        private codigoProveedor: string | null,

        private stock: Stock,
        private utilizaStockMinimo: boolean = false,
        private utilizaStockMinimoPorEmpresa: boolean = false,
        private stockMinimo: Stock,

        private costo: Costo,
        private precio: Precio,
        private margen: Margen,
        private fechaCosto: Date,

        private destacado: boolean = false,
        private envioGratis: boolean = false,

        private observacion: string | null,

        private createdAt: Date,
        private updatedAt: Date | null,
        private deletedAt: Date | null,

        private usuarioCreated: Usuario,
        private usuarioUpdated: Usuario | null,
        private usuarioDeleted: Usuario | null,

        // ==========  Línea ==========
        private linea: Linea,

        // ==========  MARCA ==========
        private marca: Marca,

        private utilizaPack: boolean = false,
        private cantidadPorPack: number | null,

        private imagen: string | null,
        private ubicacion: string | null,

        private movimientosStock: MovimientoStock[],

        private sistema: number = 0,
        private codigoReferencia: string | null,
    ) {}

    public actualizarDatos(params: ProductoActualizarDatosParams): void {
        const costo = Costo.create(params.costo);
        const margen = Margen.create(params.margen);
        const precio = Precio.create(costo.getValue(), margen.getValue());

        this.denominacion = params.denominacion;
        this.codigoBarra = params.codigoBarra;
        this.codigoProveedor = params.codigoProveedor;
        this.stock = Stock.create(params.stock);
        this.utilizaStockMinimo = params.utilizaStockMinimo;
        this.utilizaStockMinimoPorEmpresa = params.utilizaStockMinimoPorEmpresa;
        this.stockMinimo = Stock.create(params.stockMinimo);
        this.costo = costo;
        this.margen = margen;
        this.precio = precio;
        this.fechaCosto = new Date();
        this.destacado = params.destacado;
        this.envioGratis = params.envioGratis;
        this.observacion = params.observacion;
        this.linea = params.linea;
        this.marca = params.marca;
        this.utilizaPack = params.utilizaPack;
        this.cantidadPorPack = params.cantidadPorPack;
        this.imagen = params.imagen;
        this.ubicacion = params.ubicacion;
        this.codigoReferencia = params.codigoReferencia;
        this.usuarioUpdated = params.usuarioUpdated;
        this.updatedAt = new Date();
    }

    public calcularPrecio(): void {
        this.precio = Precio.create(
            this.costo.getValue(),
            this.margen.getValue()
        );
    }

    public estaBajoMinimo(): boolean {
        return this.stock.getValue() < this.stockMinimo.getValue();
    }

    public ajustarStock(cantidad: number, motivo: string): void {
    if (!motivo || motivo.trim().length === 0) {
        throw new MotivoRequeridoException();
    }
    const nuevoStock = Stock.create(this.stock.getValue() + cantidad);
    this.stock = nuevoStock;
}

    public marcarComoEliminado(usuarioDeleted: Usuario): void {
        this.deletedAt = new Date();
        this.usuarioDeleted = usuarioDeleted;
    }

    public getId(): number | null {
        return this.id;
    }

    public getDenominacion(): string {
        return this.denominacion;
    }

    public getCodigoBarra(): string | null {
        return this.codigoBarra;
    }

    public getProveedor(): Proveedor | null {
        return this.proveedor;
    }

    public getCodigoProveedor(): string | null {
        return this.codigoProveedor;
    }

    public getStock(): number {
        return this.stock.getValue();
    }

    public getUtilizaStockMinimo(): boolean {
        return this.utilizaStockMinimo;
    }

    public getUtilizaStockMinimoPorEmpresa(): boolean {
        return this.utilizaStockMinimoPorEmpresa;
    }

    public getStockMinimo(): number {
        return this.stockMinimo.getValue();
    }

    public getCosto(): number {
        return this.costo.getValue();
    }

    public getPrecio(): number {
        return this.precio.getValue();
    }

    public getMargen(): number {
        return this.margen.getValue();
    }

    public getFechaCosto(): Date | null {
        return this.fechaCosto;
    }

    public isDestacado(): boolean {
        return this.destacado;
    }

    public hasEnvioGratis(): boolean {
        return this.envioGratis;
    }

    public getObservacion(): string | null {
        return this.observacion;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date | null {
        return this.updatedAt;
    }

    public getDeletedAt(): Date | null {
        return this.deletedAt;
    }

    public getUsuarioCreated(): Usuario {
        return this.usuarioCreated;
    }

    public getUsuarioUpdated(): Usuario | null {
        return this.usuarioUpdated;
    }

    public getUsuarioDeleted(): Usuario | null {
        return this.usuarioDeleted;
    }

    public getLinea(): Linea {
        return this.linea;
    }

    public getMarca(): Marca {
        return this.marca;
    }

    public getUtilizaPack(): boolean {
        return this.utilizaPack;
    }

    public getCantidadPorPack(): number | null {
        return this.cantidadPorPack;
    }

    public getImagen(): string | null {
        return this.imagen;
    }

    public getUbicacion(): string | null {
        return this.ubicacion;
    }

    public getMovimientosStock(): MovimientoStock[] {
        return this.movimientosStock;
    }

    public getSistema(): number {
        return this.sistema;
    }

    public getCodigoReferencia(): string | null {
        return this.codigoReferencia;
    }
}
