import { ConflictException } from '@nestjs/common';
import { ProductoUniquenessValidator } from './producto-uniqueness.validator';

describe('ProductoUniquenessValidator', () => {
  const repository = { existsByDenominacion: jest.fn(), existsByCodigoProveedor: jest.fn() };
  const validator = new ProductoUniquenessValidator(repository as any);

  beforeEach(() => jest.clearAllMocks());

  describe('validarDenominacionUnica()', () => {
    it('no lanza si la denominación está libre', async () => {
      repository.existsByDenominacion.mockResolvedValue(false);

      await expect(validator.validarDenominacionUnica('aceite', 5)).resolves.toBeUndefined();
      expect(repository.existsByDenominacion).toHaveBeenCalledWith('aceite', 5);
    });

    it('lanza Conflict si ya está en uso', async () => {
      repository.existsByDenominacion.mockResolvedValue(true);

      await expect(validator.validarDenominacionUnica('aceite')).rejects.toThrow(
        new ConflictException('La denominación "aceite" ya está en uso'),
      );
    });
  });

  describe('validarCodigoProveedorUnico()', () => {
    it('no lanza si el código está libre', async () => {
      repository.existsByCodigoProveedor.mockResolvedValue(false);

      await expect(validator.validarCodigoProveedorUnico('P-1', 0)).resolves.toBeUndefined();
      expect(repository.existsByCodigoProveedor).toHaveBeenCalledWith('P-1', 0);
    });

    it('lanza Conflict si ya está en uso', async () => {
      repository.existsByCodigoProveedor.mockResolvedValue(true);

      await expect(validator.validarCodigoProveedorUnico('P-1', 0)).rejects.toThrow(
        new ConflictException('El codigo  "P-1" ya está en uso'),
      );
    });
  });
});
