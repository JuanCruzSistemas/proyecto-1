import { DomainException } from "src/modules/common/exceptions/domain.exception";

export class MargenInvalidoException extends DomainException {
    constructor(value: number) {
        super(`Margen con valor '${value} inválido. Regla: 0 <= Margen <= 1'`);
    }
}