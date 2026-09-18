import { Logger } from '@nestjs/common';
import { Marca } from '../domain/entities/marca.entity';
import { MarcaDto } from '../dto/marca.dto';

export class MarcaMapper {
  private static readonly logger = new Logger(MarcaMapper.name);

  static toDto(entity: Marca): MarcaDto {
    const deletedAt = entity.getDeletedAt();
    return {
      id: entity.getId() ?? 0,
      denominacion: entity.getDenominacion(),
      observacion: entity.getObservacion() ?? "",
      sistema: entity.getSistema(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null,
    };
  }


}
