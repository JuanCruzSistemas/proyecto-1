import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from "../../domain/repositories/producto.repository-interface";

@Injectable()
export class FindEntityByIdUseCase {
    private readonly ENTITY_NAME = 'Producto';
    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository
    ) {}

    async execute(id: number) {
        const entity = await this.repository.findOne(id);
        if (!entity) {
            throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
        }

        return entity;
    }
}