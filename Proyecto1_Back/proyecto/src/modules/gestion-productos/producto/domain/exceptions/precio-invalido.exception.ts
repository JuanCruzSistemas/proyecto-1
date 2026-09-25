import { DomainException } from "src/modules/common/exceptions/domain.exception";

export class PrecioInvalidoException extends DomainException {
    constructor(value: number) {
        super(`Precio con valor '${value} inválido. Regla: Precio > 0'`);
    }
}