import { Linea } from '../../../domain/entities/linea.entity';
import { LineaEntity } from '../entities/linea.orm-entity';
import { LineaDto } from '../../../application/dto/linea.dto';

export class LineaOrmMapper {
  static toDomain(orm: LineaEntity): Linea {
    return Linea.reconstitute({
      id: orm.id,
      denominacion: orm.denominacion,
      observacion: orm.observacion ?? null,
      utilizaStockMinimo: orm.utilizaStockMinimo,
      stockMinimo: orm.stockMinimo ?? 0,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt ?? null,
      usuarioCreatedId: orm.usuarioCreatedId ?? null,
      usuarioUpdatedId: orm.usuarioUpdatedId ?? null,
      usuarioDeletedId: orm.usuarioDeletedId ?? null,
      sistema: orm.sistema
    });
  }

  static toOrm(linea: Linea, target: LineaEntity = new LineaEntity()): LineaEntity {
    if (linea.getId() !== null) {
      target.id = linea.getId()!;
    }

    target.denominacion = linea.getDenominacion();
    target.observacion = linea.getObservacion() ?? undefined;
    target.utilizaStockMinimo = linea.getUtilizaStockMinimo();
    target.stockMinimo = linea.getStockMinimo();
    target.usuarioCreatedId = linea.getUsuarioCreatedId() ?? undefined;
    target.usuarioUpdatedId = linea.getUsuarioUpdatedId() ?? undefined;
    target.usuarioDeletedId = linea.getUsuarioDeletedId() ?? undefined;
    target.sistema = linea.getSistema();

    const deletedAt = linea.getDeletedAt();
    if (deletedAt) {
      target.deletedAt = deletedAt;
    }

    return target;
  }

  /**
   * Referencia liviana para asignar la relación `producto.linea` sin traer la fila completa
   */
  static toOrmReference(linea: Linea): LineaEntity {
    return { id: linea.getId() } as LineaEntity;
  }

  static toDto(entity: Linea): LineaDto {
    const deletedAt = entity.getDeletedAt();
    return {
      id: entity.getId() ?? 0,
      denominacion: entity.getDenominacion(),
      stockMinimo: entity.getStockMinimo(),
      utilizaStockMinimo: entity.getUtilizaStockMinimo(),
      observacion: entity.getObservacion() ?? '',
      sistema: entity.getSistema(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null
    };
  }
}
