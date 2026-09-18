import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { IMarcaRepository, MARCA_REPOSITORY_TOKEN } from '../../domain/interfaces/marca.repository.interface';
import { PoliticaEliminacionMarca } from '../../domain/services/politica-eliminacion-marca.service';

@Injectable()
export class RemoveMarcaUseCase {
  private readonly ENTITY_NAME = 'Marca';

  constructor(
    @Inject(MARCA_REPOSITORY_TOKEN)
    private readonly repository: IMarcaRepository,
    private readonly usuarioService: UsuarioService,
    private readonly validacionesService: PoliticaEliminacionMarca,
  ) {}

  async execute(id: number, usuarioId: number) {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
    }

    ensureNotSistemaEntity(entity.getSistema(), 'Marca');

    const tieneProductosActivos =
      await this.validacionesService.tieneProductosActivosParaMarca(id);
    if (tieneProductosActivos) {
      throw new ConflictException(
        'No se puede eliminar la marca porque está asociada a productos activos.',
      );
    }

    const usuario = await this.usuarioService.findOne(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado.`);
    }

    // Regla de negocio + mutación de dominio: le corresponden al caso de uso, no al
    // repositorio (mismo criterio aplicado en Producto/Marca en la Tarea 4).
    if (entity.getDeletedAt()) {
      throw new NotFoundException(`${this.ENTITY_NAME} ya eliminada.`);
    }
    entity.marcarComoEliminado(usuario.id);

    await this.repository.remove(entity, usuario);

    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'eliminada',
    );
  }
}
