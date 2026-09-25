import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProductoMapper } from "../../infraestructure/persistence/mappers/producto.mapper";
import { PaginacionUtils } from "src/modules/common/utils/pagination/paginacion-utils";
import { GetProductoDto } from "../dto/get-producto.dto";
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from "../../domain/repositories/producto.repository.interface";

@Injectable()
export class FindByProductoUseCase {
    private readonly logger = new Logger(FindByProductoUseCase.name);
    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository
    ) {}

    async findByRapido(
        codigo: string,
        exacto: boolean,
        skip: number,
        take: number
    ): Promise<{ data: GetProductoDto[]; total: number }> {
        this.logger.warn(`service`);
        const result = await this.repository.findByRapido(
            codigo,
            exacto,
            skip,
            take
        );
        return {
            data: result.data.map((producto) => {
                return ProductoMapper.toBusquedaDto(producto);
            }),
            total: PaginacionUtils.totalItems(result.total)
        };
    }

    async findBy(
        denominacion: string,
        codigoProveedor: string,
        codProveedorExacto: boolean,
        codigoReferencia: string,
        marca_id: number,
        linea_id: number,
        proveedor_id: number,
        conStock: boolean,
        skip: number,
        take: number,
        lineaDenominacion?: string,
        superlineaDenominacion?: string,
    ): Promise<{ data: GetProductoDto[]; total: number }> {
        this.logger.warn(`service`);
        const result = await this.repository.findBy(
            denominacion,
            codigoProveedor,
            codProveedorExacto,
            codigoReferencia,
            marca_id,
            linea_id,
            proveedor_id,
            conStock,
            skip,
            take,
            lineaDenominacion,
            superlineaDenominacion,
        );
        return {
            data: result.data.map((producto) => {
                return ProductoMapper.toBusquedaDto(producto);
            }),
            total: PaginacionUtils.totalItems(result.total)
        };
    }
}