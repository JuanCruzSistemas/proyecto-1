import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateProductoUseCase } from './create-producto.use-case';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { Producto } from '../../domain/entities/producto.entity';
import { ProductoIntrinsicValidationService } from '../../domain/services/producto-intrinsic-validation.service';
import { ProductoValidationService } from '../../domain/services/producto-validation.service';
import { PresentacionRequeridaException } from '../../domain/exceptions/presentacion-requerida.exception';
import { crearLinea, crearMarca, crearPresentacion, crearUsuario } from '../../testing/producto.fixtures-spec';

describe('CreateProductoUseCase', () => {
  const repository = { create: jest.fn() };
  const relatedEntitiesValidator = { validarYObtenerEntidadesRelacionadas: jest.fn() };
  const uniquenessValidator = { validarDenominacionUnica: jest.fn(), validarCodigoProveedorUnico: jest.fn() };
  const usuarioValidator = { validarUsuarioExiste: jest.fn() };

  // Servicios de dominio reales (sin I/O).
  const useCase = new CreateProductoUseCase(
    repository as any,
    new ProductoIntrinsicValidationService(),
    new ProductoValidationService(),
    relatedEntitiesValidator as any,
    uniquenessValidator as any,
    usuarioValidator as any,
  );

  const dto = (overrides: Partial<CreateProductoDto> = {}): CreateProductoDto =>
    Object.assign(new CreateProductoDto(), {
      marcaId: 20,
      lineaId: 10,
      presentacionId: 30,
      costo: 100,
      porcentaje: 30,
      utilizaStockMinimo: false,
      utilizaPack: false,
      usuarioCreatedId: 1,
      ...overrides,
    });

  const entidades = (overrides = {}) => ({
    marca: crearMarca(),
    linea: crearLinea(),
    presentacion: crearPresentacion(),
    ...overrides,
  });

  const productoGuardado = (): Producto => repository.create.mock.calls[0][0];

  beforeEach(() => {
    jest.clearAllMocks();
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockResolvedValue(entidades());
    usuarioValidator.validarUsuarioExiste.mockResolvedValue(crearUsuario());
    repository.create.mockImplementation(async (p: Producto) => p);
  });

  it('crea el producto con denominación automática y responde el mensaje', async () => {
    const res = await useCase.execute(dto());

    expect(res).toEqual({ mensaje: 'Producto creada con éxito con denominacion: NATURA ACEITES 1L' });
    const producto = productoGuardado();
    expect(producto.getDenominacion()).toBe('NATURA ACEITES 1L');
    expect(producto.getDenominacionEditadaManualmente()).toBe(false);
    expect(producto.getCosto()).toBe(100);
    expect(producto.getMargen()).toBe(0.3);
    expect(producto.getPrecio()).toBeCloseTo(130);
    expect(uniquenessValidator.validarDenominacionUnica).not.toHaveBeenCalled();
  });

  it('con denominación manual valida que sea única', async () => {
    await useCase.execute(dto({ denominacion: 'aceite especial' }));

    expect(uniquenessValidator.validarDenominacionUnica).toHaveBeenCalledWith('aceite especial');
    expect(productoGuardado().getDenominacion()).toBe('aceite especial');
    expect(productoGuardado().getDenominacionEditadaManualmente()).toBe(true);
  });

  it('con código de proveedor valida que sea único', async () => {
    await useCase.execute(dto({ codigoProveedor: 'NAT-9' }));

    expect(uniquenessValidator.validarCodigoProveedorUnico).toHaveBeenCalledWith('NAT-9', 0);
    expect(productoGuardado().getCodigoProveedor()).toBe('NAT-9');
  });

  it('valida entidades relacionadas y usuario con los ids del DTO', async () => {
    await useCase.execute(dto());

    expect(relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas).toHaveBeenCalledWith(20, 10, 30);
    expect(usuarioValidator.validarUsuarioExiste).toHaveBeenCalledWith(1);
    expect(productoGuardado().getUsuarioCreated()).toEqual(crearUsuario());
  });

  it('rechaza marcaId inválido antes de tocar la base', async () => {
    await expect(useCase.execute(dto({ marcaId: 0 }))).rejects.toThrow(BadRequestException);
    expect(relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('propaga el conflicto de denominación duplicada sin persistir', async () => {
    uniquenessValidator.validarDenominacionUnica.mockRejectedValue(new ConflictException('duplicada'));

    await expect(useCase.execute(dto({ denominacion: 'repetida' }))).rejects.toThrow(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('propaga NotFound si la marca o línea no existe', async () => {
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockRejectedValue(new NotFoundException('Marca'));

    await expect(useCase.execute(dto())).rejects.toThrow(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rechaza una marca del sistema', async () => {
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockResolvedValue(
      entidades({ marca: crearMarca(20, 'SISTEMA', 1) }),
    );

    await expect(useCase.execute(dto())).rejects.toThrow('Marca 20 está marcada como del sistema');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('sin denominación ni presentación lanza PresentacionRequeridaException', async () => {
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockResolvedValue(entidades({ presentacion: null }));

    await expect(useCase.execute(dto({ presentacionId: undefined }))).rejects.toThrow(PresentacionRequeridaException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
