import { DomainException } from "src/modules/common/exceptions/domain.exception";

export class StockMinimoInvalidoException extends DomainException {
    constructor(valor: number) {
        super(`El stock mínimo no puede ser negativo (valor recibido: ${valor})`);
    }
}
