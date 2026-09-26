import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { IPresentacionRepository, PRESENTACION_REPOSITORY_TOKEN } from '../../domain/repositories/presentacion.repository.interface';
import { PoliticaEliminacionPresentacion } from '../../domain/services/politica-eliminacion-presentacion.service';

@Injectable()
export class RemovePresentacionUseCase {
  private readonly ENTITY_NAME = 'Presentación';

  constructor(
    @Inject(PRESENTACION_REPOSITORY_TOKEN)
    private readonly repository: IPresentacionRepository,
    private readonly validacionesService: PoliticaEliminacionPresentacion
  ) {}

  async execute(id: number, usuarioId: number) {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrada.`);
    }

    const tieneProductosActivos = await this.validacionesService.tieneProductosActivosParaPresentacion(id);
    if (tieneProductosActivos) {
      throw new ConflictException('No se puede eliminar la presentación porque está asociada a productos activos.');
    }

    if (entity.getDeletedAt()) {
      throw new NotFoundException(`${this.ENTITY_NAME} ya eliminada.`);
    }

    entity.marcarComoEliminado(usuarioId);
    await this.repository.remove(entity, usuarioId);

    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'eliminada'
    );
  }
}
