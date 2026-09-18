import { Logger } from '@nestjs/common';
import { Linea } from '../domain/entities/linea.entity';
import { LineaDto } from '../dto/linea.dto';

export class LineaMapper {
  private static readonly logger = new Logger(LineaMapper.name);

  static toDto(entity: Linea): LineaDto {
    const deletedAt = entity.getDeletedAt();
    return {
      id: entity.getId() ?? 0,
      denominacion: entity.getDenominacion(),
      stockMinimo: entity.getStockMinimo(),
      utilizaStockMinimo: entity.getUtilizaStockMinimo(),
      observacion: entity.getObservacion() ?? '',
      sistema: entity.getSistema(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null,

    };
  }
}
