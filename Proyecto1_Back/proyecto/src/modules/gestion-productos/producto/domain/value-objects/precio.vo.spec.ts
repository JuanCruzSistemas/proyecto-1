import { Precio } from './precio.vo';
import { PrecioInvalidoException } from '../exceptions/precio-invalido.exception';

describe('Precio (VO)', () => {
  it('se calcula como costo * (1 + margen)', () => {
    expect(Precio.create(100, 0.3).getValue()).toBeCloseTo(130);
  });

  it('permite precio 0 cuando el costo es 0', () => {
    expect(Precio.create(0, 0.5).getValue()).toBe(0);
  });

  it('rechaza un resultado negativo', () => {
    expect(() => Precio.create(-10, 0.3)).toThrow(PrecioInvalidoException);
  });
});
