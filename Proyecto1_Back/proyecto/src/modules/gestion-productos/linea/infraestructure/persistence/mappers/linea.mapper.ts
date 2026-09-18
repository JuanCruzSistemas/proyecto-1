import { Linea } from '../../../domain/entities/linea.entity';
import { LineaEntity } from '../entities/linea.orm-entity';

/** Mapper dominio <-> ORM de Línea. Ver ARCHITECTURE.md §3.3 e IMPLEMENTATION.md §3.2. */
export class LineaOrmMapper {
  /** SIEMPRE reconstitute() al leer de infraestructura — nunca create(). */
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
      sistema: orm.sistema,
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
    if (deletedAt) target.deletedAt = deletedAt;
    return target;
  }

  /**
   * Referencia liviana para asignar la relación `producto.linea` sin traer la fila
   * completa: a TypeORM le alcanza con el `id` para resolver la FK al guardar.
   */
  static toOrmReference(linea: Linea): LineaEntity {
    return { id: linea.getId() } as LineaEntity;
  }
}
