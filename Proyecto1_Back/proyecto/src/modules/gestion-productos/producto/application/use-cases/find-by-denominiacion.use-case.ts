import { Inject, Injectable, Logger } from "@nestjs/common";
import { PaginacionUtils } from "src/modules/common/utils/pagination/paginacion-utils";
import { ProductoMapper } from "../../infraestructure/persistence/mappers/producto.mapper";
import { GetProductoDto } from "../dto/get-producto.dto";
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from "../../domain/repositories/producto.repository-interface";

@Injectable()
export class FindByDenominacionUseCase {
    private readonly logger = new Logger(FindByDenominacionUseCase.name);
    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository
    ) {}

    async execute(
        denominacion: string,
        skip = 0,
        take = 10
    ): Promise<{ data: GetProductoDto[]; total: number }> {
        this.logger.log(`Buscando en srvice producto o ${denominacion}  skip=${skip}, take=${take}`);
        const result = await this.repository.findByDenominacionCodigoProveedorFiltered(
            denominacion,
            skip,
            take
        );
        this.logger.log(result);
        
        return {
            data: result.data.map((producto) => {
                return ProductoMapper.toBusquedaDto(producto);
            }),
            total: PaginacionUtils.totalItems(result.total)
        };
    }
}