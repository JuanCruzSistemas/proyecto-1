import { Precio } from './precio.vo';
import { PrecioInvalidoException } from '../exceptions/precio-invalido.exception';

describe('Precio (VO)', () => {
  it('se calcula como costo * (1 + margen)', () => {
    expect(Precio.create(100, 0.3).getValue()).toBeCloseTo(130);
  });

  it('rechaza un precio igual a 0', () => {
    expect(() => Precio.create(0, 0.5)).toThrow(PrecioInvalidoException);
  });

  it('rechaza un resultado negativo', () => {
    expect(() => Precio.create(-10, 0.3)).toThrow(PrecioInvalidoException);
  });
});
