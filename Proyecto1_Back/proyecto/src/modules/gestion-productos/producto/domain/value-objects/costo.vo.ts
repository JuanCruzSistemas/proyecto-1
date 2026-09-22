import { CostoInvalidoException } from "../exceptions/costo-invalido.exception";

export class Costo {
    private constructor(
        private readonly value: number
    ) {}

    public static create(value: number) {
        this.validate(value);
        return new Costo(value);
    }

    private static validate(value: number) {
        if (value < 0) throw new CostoInvalidoException(value);
    }

    public getValue(): number {
        return this.value;
    }
}