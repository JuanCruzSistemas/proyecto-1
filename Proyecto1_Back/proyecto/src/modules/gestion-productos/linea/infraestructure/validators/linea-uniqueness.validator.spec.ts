import { ConflictException } from '@nestjs/common';
import { LineaUniquenessValidator } from './linea-uniqueness.validator';

describe('LineaUniquenessValidator', () => {
  const repository = { findByDenominacionWith: jest.fn() };
  const validator = new LineaUniquenessValidator(repository as any);

  beforeEach(() => jest.clearAllMocks());

  it('normaliza la denominación antes de consultar duplicados', async () => {
    repository.findByDenominacionWith.mockResolvedValue(null);
    await validator.validarDenominacionUnica('  Bebidas frías  ', 0);
    expect(repository.findByDenominacionWith).toHaveBeenCalledWith('BEBIDAS FRÍAS');
  });

  it('permite editar la misma Línea sin considerarla duplicada', async () => {
    repository.findByDenominacionWith.mockResolvedValue({ getId: () => 4 });
    await expect(validator.validarDenominacionUnica('Bebidas', 4)).resolves.toBeUndefined();
  });

  it('rechaza una denominación perteneciente a otra Línea, incluso si está dada de baja', async () => {
    repository.findByDenominacionWith.mockResolvedValue({ getId: () => 8 });
    await expect(validator.validarDenominacionUnica('Bebidas', 4)).rejects.toThrow(ConflictException);
  });
});
