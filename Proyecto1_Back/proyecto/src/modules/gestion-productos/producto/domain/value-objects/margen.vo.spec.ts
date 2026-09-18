import { Margen } from './margen.vo';
import { MargenInvalidoException } from '../exceptions/margen-invalido.exception';

describe('Margen (VO)', () => {
  it('permite el límite inferior (0)', () => {
    expect(Margen.create(0).getValue()).toBe(0);
  });

  it('permite el límite superior (1)', () => {
    expect(Margen.create(1).getValue()).toBe(1);
  });

  it('permite una fracción intermedia', () => {
    expect(Margen.create(0.3).getValue()).toBe(0.3);
  });

  it('rechaza un valor negativo', () => {
    expect(() => Margen.create(-0.1)).toThrow(MargenInvalidoException);
  });

  it('rechaza un valor mayor a 1', () => {
    expect(() => Margen.create(1.1)).toThrow(MargenInvalidoException);
  });
});
