import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';
import { MessageFrontUtils } from 'src/modules/common/utils/message/message-front.util';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { ILineaRepository, LINEA_REPOSITORY_TOKEN } from '../../domain/interfaces/linea.repository.interface';
import { PoliticaEliminacionLinea } from '../../domain/services/politica-eliminacion-linea.service';

@Injectable()
export class RemoveLineaUseCase {
  private readonly ENTITY_NAME = 'Linea';

  constructor(
    @Inject(LINEA_REPOSITORY_TOKEN)
    private readonly repository: ILineaRepository,
    private readonly usuarioService: UsuarioService,
    private readonly validacionesService: PoliticaEliminacionLinea
  ) {}

  async execute(id: number, usuarioId: number) {
    const entity = await this.repository.findOne(id);
    if (!entity) {
      throw new NotFoundException(`${this.ENTITY_NAME} con ID ${id} no encontrado.`);
    }

    ensureNotSistemaEntity(entity.getSistema(), this.ENTITY_NAME);

    const usuario = await this.usuarioService.findOne(usuarioId);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado.`);
    }

    const tieneProductosActivos =
      await this.validacionesService.tieneProductosActivosParaLinea(id);
    if (tieneProductosActivos) {
      throw new ConflictException('No se puede eliminar la marca porque está asociada a productos activos.');
    }
    
    entity.marcarComoEliminado(usuario.id);
    await this.repository.remove(entity, usuario);
    
    return MessageFrontUtils.createSimple(
      `${this.ENTITY_NAME}`,
      entity.getDenominacion(),
      'eliminada'
    );
  }
}
