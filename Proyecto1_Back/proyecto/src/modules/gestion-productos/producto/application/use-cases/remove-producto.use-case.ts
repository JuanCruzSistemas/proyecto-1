import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { FindEntityByIdUseCase } from "./find-entity-by-id.use-case";
import { MessageFrontUtils } from "src/modules/common/utils/message/message-front.util";
import { ensureNotSistemaEntity } from "src/modules/common/utils/atrituto-sistema";
import { UsuarioService } from "src/modules/gestion-usuario/usuario/application/services/usuario.service";
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from "../../domain/interfaces/producto.repository-interface";

@Injectable()
export class RemoveProductoUseCase {
    private readonly ENTITY_NAME = 'Producto';
    constructor(
        private readonly findEntityByIdUseCase: FindEntityByIdUseCase,
        private readonly usuarioService: UsuarioService,
        @Inject(PRODUCTO_REPOSITORY_TOKEN)
        private readonly repository: IProductoRepository,
    ) {}

    async execute(id: number, usuarioId: number) {
        const entity = await this.findEntityByIdUseCase.execute(id);

        if (!entity) {
            throw new NotFoundException(
                `${this.ENTITY_NAME} con ID ${id} no encontrado.`,
            );
        }

        ensureNotSistemaEntity(entity.getSistema(), this.ENTITY_NAME);

        const usuario = await this.usuarioService.findOne(usuarioId);
        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado.`);
        }

        if (entity.getDeletedAt()) {
            throw new NotFoundException(`${this.ENTITY_NAME} ya eliminado.`);
        }
        entity.marcarComoEliminado(usuario);

        await this.repository.remove(entity, usuario);
        return MessageFrontUtils.createSimple(
            `${this.ENTITY_NAME}`,
            entity.getDenominacion(),
            'eliminada',
        );
    }
}