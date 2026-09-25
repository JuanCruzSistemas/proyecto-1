import { PrecioInvalidoException } from "../exceptions/precio-invalido.exception";

export class Precio {
    private constructor(
        private readonly value: number
    ) {}

    public static create(costo: number, margen: number) {
        const value = costo * (1 + margen);
        this.validate(value);
        return new Precio(value);
    }

    public static fromValue(value: number) {
        this.validate(value);
        return new Precio(value);
    }

    private static validate(value: number) {
        if (value <= 0) throw new PrecioInvalidoException(value);
    }

    public getValue() {
        return this.value;
    }
}