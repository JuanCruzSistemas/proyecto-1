import { ReferenciaDto } from "src/modules/common/dto/referencia.dto";
import { Presentacion } from "../../domain/entities/presentacion.entity";
import { PresentacionDto } from "../dto/presentacion.dto";

export class PresentacionDtoMapper {
    static toResponseDto(domain: Presentacion): PresentacionDto {
        const deletedAt = domain.getDeletedAt();
        return {
            id: domain.getId() ?? 0,
            denominacion: domain.getDenominacion(),
            observacion: domain.getObservacion() ?? "",
            deletedAt: deletedAt ? deletedAt.toISOString() : null
        };
    }

    static toReferenciaDto(domain: Presentacion): ReferenciaDto {
        return {
            id: domain.getId() ?? 0,
            denominacion: domain.getDenominacion()
        };
    }
}
