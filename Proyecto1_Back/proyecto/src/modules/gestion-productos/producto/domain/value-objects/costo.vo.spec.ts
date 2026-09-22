import { Costo } from './costo.vo';
import { CostoInvalidoException } from '../exceptions/costo-invalido.exception';

describe('Costo (VO)', () => {
  it('rechaza un costo igual a 0', () => {
    expect(() => Costo.create(0)).toThrow(CostoInvalidoException);
  });

  it('permite un costo positivo', () => {
    expect(Costo.create(150.5).getValue()).toBe(150.5);
  });

  it('rechaza un costo negativo', () => {
    expect(() => Costo.create(-0.01)).toThrow(CostoInvalidoException);
  });
});
