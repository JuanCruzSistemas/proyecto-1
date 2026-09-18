import { MargenInvalidoException } from "../exceptions/margen-invalido.exception";

export class Margen {
    private constructor(
        private readonly value: number
    ) {}

    public static create(value: number) {
        this.validate(value);
        return new Margen(value);
    }

    private static validate(value: number): void {
        if (value > 1 || value < 0) {
            throw new MargenInvalidoException(value);
        }
    }

    public getValue(): number {
        return this.value;
    }
}