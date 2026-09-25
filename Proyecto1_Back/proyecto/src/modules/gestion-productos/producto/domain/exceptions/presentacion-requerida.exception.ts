import { DomainException } from "src/modules/common/exceptions/domain.exception";

export class PresentacionRequeridaException extends DomainException {
    constructor() {
        super('No se puede generar la denominación automática: falta asignar una Presentación al producto.');
    }
}
