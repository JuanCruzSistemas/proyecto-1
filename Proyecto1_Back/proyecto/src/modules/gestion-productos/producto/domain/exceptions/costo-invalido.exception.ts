import { DomainException } from "src/modules/common/exceptions/domain.exception";

export class CostoInvalidoException extends DomainException {
    constructor(value: number) {
        super(`Costo con valor '${value} inválido'`);
    }
}