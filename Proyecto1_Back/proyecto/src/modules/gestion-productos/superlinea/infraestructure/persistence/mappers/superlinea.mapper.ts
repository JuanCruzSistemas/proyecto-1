import { Superlinea } from '../../../domain/entities/superlinea.entity';
import { SuperlineaEntity } from '../entities/superlinea.orm-entity';

export class SuperlineaOrmMapper {
  static toDomain(row: SuperlineaEntity): Superlinea {
    return Superlinea.reconstitute(row);
  }

  static toOrm(entity: Superlinea): SuperlineaEntity {
    const row = new SuperlineaEntity();
    if (entity.getId() !== null) row.id = entity.getId()!;
    row.denominacion = entity.getDenominacion();
    row.observacion = entity.getObservacion();
    row.createdAt = entity.getCreatedAt();
    row.updatedAt = entity.getUpdatedAt();
    row.deletedAt = entity.getDeletedAt();
    row.usuarioCreatedId = entity.getUsuarioCreatedId();
    row.usuarioUpdatedId = entity.getUsuarioUpdatedId();
    row.usuarioDeletedId = entity.getUsuarioDeletedId();
    row.sistema = entity.getSistema();
    return row;
  }
}
