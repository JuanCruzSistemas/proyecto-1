import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from "../../domain/repositories/producto.repository-interface";
import { AuditoriaMapper } from "src/modules/gestion-sistema/auditoria/mappers/auditoria.mapper";

@Injectable()
export class FindByIdConAuditoria {
    private readonly ENTITY_NAME = 'Producto';
    constructor(
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository
    ) {}

    async execute(id: number) {
        const entity = await this.repository.findByIdConAuditoria(id);
        if (!entity) {
            throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
        }
        return AuditoriaMapper.mapProductoToDto(entity);
    }
}