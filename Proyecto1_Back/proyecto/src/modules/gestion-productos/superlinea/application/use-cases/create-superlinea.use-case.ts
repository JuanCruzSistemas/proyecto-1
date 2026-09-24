import { Inject, Injectable } from '@nestjs/common';
import { Superlinea } from '../../domain/entities/superlinea.entity';
import { ISuperlineaRepository, SUPERLINEA_REPOSITORY } from '../../domain/interfaces/superlinea.repository.interface';
import { SaveSuperlineaDto } from '../dto/superlinea.dto';
import { SuperlineaDtoMapper } from '../mappers/superlinea-dto.mapper';

@Injectable()
export class CreateSuperlineaUseCase {
  constructor(@Inject(SUPERLINEA_REPOSITORY) private readonly repository: ISuperlineaRepository) {}
  async execute(dto: SaveSuperlineaDto, usuarioId: number) {
    const entity = Superlinea.create({
      denominacion: dto.denominacion,
      observacion: dto.observacion ?? null,
      usuarioCreatedId: usuarioId,
    });
    return SuperlineaDtoMapper.toDto(await this.repository.save(entity));
  }
}
