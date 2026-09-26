import { Presentacion } from "../../../domain/entities/presentacion.entity";
import { PresentacionEntity } from "../entities/presentacion.orm-entity";

export class PresentacionMapper {
    static toDomain(orm: PresentacionEntity): Presentacion {
        return Presentacion.reconstitute({
            id: orm.id,
            denominacion: orm.denominacion,
            observacion: orm.observacion ?? null,
            createdAt: orm.createdAt,
            updatedAt: orm.updatedAt,
            deletedAt: orm.deletedAt ?? null,
            usuarioCreatedId: orm.usuarioCreatedId ?? null,
            usuarioUpdatedId: orm.usuarioUpdatedId ?? null,
            usuarioDeletedId: orm.usuarioDeletedId ?? null
        });
    }

    static toOrm(domain: Presentacion, target: PresentacionEntity = new PresentacionEntity()): PresentacionEntity {
        if (domain.getId() !== null) {
            target.id = domain.getId()!;
        }

        target.denominacion = domain.getDenominacion();
        target.observacion = domain.getObservacion() ?? undefined;

        target.usuarioCreatedId = domain.getUsuarioCreatedId() ?? undefined;
        target.usuarioUpdatedId = domain.getUsuarioUpdatedId() ?? undefined;
        target.usuarioDeletedId = domain.getUsuarioDeletedId() ?? undefined;

        const deletedAt = domain.getDeletedAt();
        if (deletedAt) {
            target.deletedAt = deletedAt;
        }

        return target;
    }

    static toOrmReference(presentacion: Presentacion | null): PresentacionEntity | null {
        if (presentacion === null) {
            return null;
        }
        return { id: presentacion.getId() } as PresentacionEntity;
    }
}