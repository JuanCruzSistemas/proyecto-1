import { ReferenciaDto } from "src/modules/common/dto/referencia.dto";
import { Linea } from "../../domain/entities/linea.entity";

export class LineaDtoMapper {
    static toReferenciaDto(domainLinea: Linea): ReferenciaDto {
        return {
            id: domainLinea.getId() ?? 0,
            denominacion: domainLinea.getDenominacion()
        };
    }
}