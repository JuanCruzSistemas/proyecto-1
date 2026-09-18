import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from "../../domain/interfaces/producto.repository-interface";
import { ProductoMapper } from "../../infraestructure/persistence/mappers/producto.mapper";

@Injectable()
export class FindDtoByIdUseCase {
    private readonly logger = new Logger(FindDtoByIdUseCase.name);
    private readonly ENTITY_NAME = 'Producto';
    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository,
    ) {}

    async execute(id: number) {
        const entity = await this.repository.findOne(id);
        if (!entity) {
            throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
        }
        
        this.logger.log(`b1x`);
        return ProductoMapper.toDto(entity);
    }
}