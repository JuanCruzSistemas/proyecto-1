import { StockInvalidoException } from "../exceptions/stock-invalido.exception";

export class Stock {
    private constructor(
        private readonly value: number
    ) {}

    public static create(value: number) {
        this.validateValue(value);
        return new Stock(value);
    }

    private static validateValue(value: number): void {
        if (value < 0) throw new StockInvalidoException(value);
    }

    public getValue(): number {
        return this.value;
    }
}