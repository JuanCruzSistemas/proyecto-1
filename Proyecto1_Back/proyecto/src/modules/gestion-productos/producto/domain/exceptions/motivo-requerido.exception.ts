import { DomainException } from "src/modules/common/exceptions/domain.exception";

export class MotivoRequeridoException extends DomainException {
    constructor() {
        super(`El motivo es obligatorio para ajustar el stock`);
    }
}