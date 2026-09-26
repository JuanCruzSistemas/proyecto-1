import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISuperlineaRepository, SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';
import { SaveSuperlineaDto } from '../dto/superlinea.dto';
import { SuperlineaDtoMapper } from '../mappers/superlinea-dto.mapper';

@Injectable()
export class UpdateSuperlineaUseCase {
  constructor(@Inject(SUPERLINEA_REPOSITORY) private readonly repository: ISuperlineaRepository) {}
  async execute(id: number, dto: SaveSuperlineaDto, usuarioId: number) {
    const entity = await this.repository.findActive(id);
    if (!entity) throw new NotFoundException('SuperLínea no encontrada.');
    ensureNotSistemaEntity(entity.getSistema(), 'SuperLínea');
    entity.actualizarDatos({
      denominacion: dto.denominacion,
      observacion: dto.observacion === undefined ? entity.getObservacion() : dto.observacion,
      usuarioUpdatedId: usuarioId,
    });
    return SuperlineaDtoMapper.toDto(await this.repository.save(entity));
  }
}
