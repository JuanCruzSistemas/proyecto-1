import { ReferenciaDto } from "src/modules/common/dto/referencia.dto";
import { Marca } from "../../domain/entities/marca.entity";

export class MarcaDtoMapper {
    static toReferenciaDto(domainMarca: Marca): ReferenciaDto {
        return {
            id: domainMarca.getId() ?? 0,
            denominacion: domainMarca.getDenominacion()
        };
    }
}