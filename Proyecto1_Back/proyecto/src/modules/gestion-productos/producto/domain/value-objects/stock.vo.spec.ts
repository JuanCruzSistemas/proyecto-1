import { Stock } from './stock.vo';
import { StockInvalidoException } from '../exceptions/stock-invalido.exception';

describe('Stock (VO)', () => {
  it('permite stock 0', () => {
    expect(Stock.create(0).getValue()).toBe(0);
  });

  it('permite un stock positivo', () => {
    expect(Stock.create(12.5).getValue()).toBe(12.5);
  });

  it('rechaza un stock negativo', () => {
    expect(() => Stock.create(-1)).toThrow(StockInvalidoException);
  });
});
