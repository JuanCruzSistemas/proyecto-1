import { Marca } from '../../../domain/entities/marca.entity';
import { MarcaEntity } from '../entities/marca.orm-entity';
import { MarcaDto } from '../../../application/dto/marca.dto';

export class MarcaOrmMapper {
  static toDomain(orm: MarcaEntity): Marca {
    return Marca.reconstitute({
      id: orm.id,
      denominacion: orm.denominacion,
      observacion: orm.observacion ?? null,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      deletedAt: orm.deletedAt ?? null,
      usuarioCreatedId: orm.usuarioCreatedId ?? null,
      usuarioUpdatedId: orm.usuarioUpdatedId ?? null,
      usuarioDeletedId: orm.usuarioDeletedId ?? null,
      sistema: orm.sistema
    });
  }

  static toOrm(marca: Marca, target: MarcaEntity = new MarcaEntity()): MarcaEntity {
    if (marca.getId() !== null) {
      target.id = marca.getId()!;
    }

    target.denominacion = marca.getDenominacion();
    target.observacion = marca.getObservacion() ?? undefined;
    target.usuarioCreatedId = marca.getUsuarioCreatedId() ?? undefined;
    target.usuarioUpdatedId = marca.getUsuarioUpdatedId() ?? undefined;
    target.usuarioDeletedId = marca.getUsuarioDeletedId() ?? undefined;
    target.sistema = marca.getSistema();

    const deletedAt = marca.getDeletedAt();
    if (deletedAt) {
      target.deletedAt = deletedAt;
    }

    return target;
  }

  /**
   * Referencia liviana para asignar la relación `producto.marca` sin traer la fila
   * completa, con TypeORM alcanza con el `id` para resolver la FK al guardar.
   */
  static toOrmReference(marca: Marca): MarcaEntity {
    return { id: marca.getId() } as MarcaEntity;
  }

  static toDto(entity: Marca): MarcaDto {
    const deletedAt = entity.getDeletedAt();
    return {
      id: entity.getId() ?? 0,
      denominacion: entity.getDenominacion(),
      observacion: entity.getObservacion() ?? "",
      sistema: entity.getSistema(),
      deletedAt: deletedAt ? deletedAt.toISOString() : null
    };
  }
}
