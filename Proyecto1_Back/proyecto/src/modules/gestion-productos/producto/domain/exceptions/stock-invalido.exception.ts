import { DomainException } from "../../../../common/exceptions/domain.exception";

export class StockInvalidoException extends DomainException {
    constructor(value: number) {
        super(`Valor de stock '${value}' inválido`);
    }
}