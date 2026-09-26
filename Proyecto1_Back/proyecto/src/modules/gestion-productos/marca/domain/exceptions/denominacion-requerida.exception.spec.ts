import { DenominacionRequeridaException } from './denominacion-requerida.exception';

describe('DenominacionRequeridaException', () => {
  it('crea una excepción con mensaje correcto', () => {
    const exception = new DenominacionRequeridaException();

    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe('La denominación es obligatoria');
  });

  it('extiende de DomainException', () => {
    const exception = new DenominacionRequeridaException();

    expect(exception.constructor.name).toBe('DenominacionRequeridaException');
  });
});
