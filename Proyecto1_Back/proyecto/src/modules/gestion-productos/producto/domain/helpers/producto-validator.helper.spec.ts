import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ProductoValidator } from './producto-validator.helper';
import { MarcaService } from 'src/modules/gestion-productos/marca/application/services/marca.service';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { PRODUCTO_REPOSITORY_TOKEN } from '../repositories/producto.repository.interface';
import { BaseProductoDto } from '../interfaces/base-producto.interface';

describe('ProductoValidator', () => {
  let validator: ProductoValidator;

  const marcaService = { findEntityById: jest.fn() };
  const usuarioValidator = { validarUsuarioExiste: jest.fn() };
  const repository = { existsByDenominacion: jest.fn() };

  const dto = (overrides: Partial<BaseProductoDto> = {}): BaseProductoDto => ({
    denominacion: 'Producto',
    marcaId: 1,
    lineaId: 2,
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProductoValidator,
        { provide: MarcaService, useValue: marcaService },
        { provide: UsuarioValidator, useValue: usuarioValidator },
        { provide: PRODUCTO_REPOSITORY_TOKEN, useValue: repository },
      ],
    }).compile();

    validator = module.get(ProductoValidator);
  });

  describe('validarMarcaLinea()', () => {
    it('exige lineaId', async () => {
      await expect(validator.validarMarcaLinea(dto({ lineaId: undefined }), 1)).rejects.toThrow(
        'Linea ID is required',
      );
      expect(marcaService.findEntityById).not.toHaveBeenCalled();
    });

    it('exige marcaId', async () => {
      await expect(validator.validarMarcaLinea(dto({ marcaId: undefined }), 1)).rejects.toThrow(
        'Marca ID is required',
      );
    });

    it('busca la marca por id y la devuelve (tipo distinto de 0 no valida)', async () => {
      const marca = { id: 1, sistema: 0 };
      marcaService.findEntityById.mockResolvedValue(marca);

      const resultado = await validator.validarMarcaLinea(dto(), 1);

      expect(marcaService.findEntityById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ marca, linea: undefined });
    });

    it('con tipo 0 rechaza una marca inexistente', async () => {
      marcaService.findEntityById.mockResolvedValue(null);
      await expect(validator.validarMarcaLinea(dto(), 0)).rejects.toThrow(
        new NotFoundException('Marca no encontrada'),
      );
    });

    it('con tipo 0 rechaza una marca del sistema', async () => {
      marcaService.findEntityById.mockResolvedValue({ id: 1, sistema: 1 });
      await expect(validator.validarMarcaLinea(dto(), 0)).rejects.toThrow(
        new BadRequestException('Marca 1 está marcada como del sistema y no puede usarse.'),
      );
    });

    it('con tipo 0 y marca válida falla por la línea, que nunca se busca', async () => {
      // Comportamiento actual: `linea` no se resuelve, por lo que con tipo 0 siempre falla.
      marcaService.findEntityById.mockResolvedValue({ id: 1, sistema: 0 });
      await expect(validator.validarMarcaLinea(dto(), 0)).rejects.toThrow(
        new NotFoundException('Línea no encontrada'),
      );
    });
  });

  describe('validar()', () => {
    it('rechaza una denominación ya en uso sin consultar la marca', async () => {
      repository.existsByDenominacion.mockResolvedValue(true);

      await expect(validator.validar(dto({ denominacion: 'Duplicado' }), 1)).rejects.toThrow(
        new ConflictException('La denominación "Duplicado" ya está en uso.'),
      );
      expect(repository.existsByDenominacion).toHaveBeenCalledWith('Duplicado', 0);
      expect(marcaService.findEntityById).not.toHaveBeenCalled();
    });

    it('con denominación libre valida marca/línea y devuelve el resultado', async () => {
      const marca = { id: 1, sistema: 0 };
      repository.existsByDenominacion.mockResolvedValue(false);
      marcaService.findEntityById.mockResolvedValue(marca);

      await expect(validator.validar(dto(), 1)).resolves.toEqual({ marca, linea: undefined });
    });
  });

  describe('validarUsuarioExiste()', () => {
    it('devuelve el usuario encontrado', async () => {
      const usuario = { id: 5 };
      usuarioValidator.validarUsuarioExiste.mockResolvedValue(usuario);

      await expect(validator.validarUsuarioExiste(5)).resolves.toBe(usuario);
      expect(usuarioValidator.validarUsuarioExiste).toHaveBeenCalledWith(5);
    });

    it('lanza NotFound si no hay usuario', async () => {
      usuarioValidator.validarUsuarioExiste.mockResolvedValue(null);
      await expect(validator.validarUsuarioExiste(5)).rejects.toThrow(
        new NotFoundException('Usuario con ID 5 no encontrado'),
      );
    });

    it('propaga el error del validador de usuarios', async () => {
      usuarioValidator.validarUsuarioExiste.mockRejectedValue(new NotFoundException('x'));
      await expect(validator.validarUsuarioExiste(5)).rejects.toThrow(NotFoundException);
    });
  });
});
