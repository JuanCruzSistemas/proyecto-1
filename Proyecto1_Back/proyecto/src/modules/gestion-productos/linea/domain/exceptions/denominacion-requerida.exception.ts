import { DomainException } from "src/modules/common/exceptions/domain.exception";

export class DenominacionRequeridaException extends DomainException {
    constructor() {
        super(`La denominación es obligatoria`);
    }
}
