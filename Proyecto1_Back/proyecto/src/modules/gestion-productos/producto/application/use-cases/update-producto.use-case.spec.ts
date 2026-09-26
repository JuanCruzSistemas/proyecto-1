import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateProductoUseCase } from './update-producto.use-case';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { Producto } from '../../domain/entities/producto.entity';
import { ProductoIntrinsicValidationService } from '../../domain/services/producto-intrinsic-validation.service';
import { ProductoValidationService } from '../../domain/services/producto-validation.service';
import {
  crearLinea,
  crearMarca,
  crearPresentacion,
  crearProducto,
  crearUsuario,
} from '../../testing/producto.fixtures-spec';

describe('UpdateProductoUseCase', () => {
  const repository = { findOne: jest.fn(), update: jest.fn() };
  const relatedEntitiesValidator = { validarYObtenerEntidadesRelacionadas: jest.fn() };
  const uniquenessValidator = { validarDenominacionUnica: jest.fn() };
  const usuarioValidator = { validarUsuarioExiste: jest.fn() };

  const useCase = new UpdateProductoUseCase(
    repository as any,
    new ProductoIntrinsicValidationService(),
    new ProductoValidationService(),
    relatedEntitiesValidator as any,
    uniquenessValidator as any,
    usuarioValidator as any,
  );

  const dto = (overrides: Partial<UpdateProductoDto> = {}): UpdateProductoDto =>
    Object.assign(new UpdateProductoDto(), { usuarioUpdatedId: 2, ...overrides });

  const editor = crearUsuario(2, 'Editor');

  beforeEach(() => {
    jest.clearAllMocks();
    repository.findOne.mockResolvedValue(crearProducto());
    repository.update.mockImplementation(async (_id: number, p: Producto) => p);
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockResolvedValue({
      marca: crearMarca(),
      linea: crearLinea(),
      presentacion: crearPresentacion(),
    });
    usuarioValidator.validarUsuarioExiste.mockResolvedValue(editor);
  });

  it('actualiza solo lo enviado, conserva el resto y responde el mensaje', async () => {
    const res = await useCase.execute(100, dto({ costo: 200, stock: 3 }));

    expect(res).toEqual({ mensaje: 'Producto editada con éxito con denominacion: NATURA ACEITES 1L' });
    const [id, producto] = repository.update.mock.calls[0];
    expect(id).toBe(100);
    expect(producto.getCosto()).toBe(200);
    expect(producto.getStock()).toBe(3);
    expect(producto.getMargen()).toBe(0.3);
    expect(producto.getPrecio()).toBeCloseTo(260);
    expect(producto.getCodigoProveedor()).toBe('NAT-1');
    expect(producto.getUsuarioUpdated()).toBe(editor);
  });

  it('si no vienen marca/línea/presentación usa las actuales del producto', async () => {
    await useCase.execute(100, dto());

    expect(relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas).toHaveBeenCalledWith(20, 10, 30);
    expect(uniquenessValidator.validarDenominacionUnica).not.toHaveBeenCalled();
  });

  it('usa los ids nuevos cuando vienen en el DTO', async () => {
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockResolvedValue({
      marca: crearMarca(21, 'OTRA'),
      linea: crearLinea(11, 'VINAGRES'),
      presentacion: crearPresentacion(31, '500ML'),
    });

    await useCase.execute(100, dto({ marcaId: 21, lineaId: 11, presentacionId: 31 }));

    expect(relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas).toHaveBeenCalledWith(21, 11, 31);
    // Denominación automática: se regenera con las entidades nuevas.
    expect(repository.update.mock.calls[0][1].getDenominacion()).toBe('OTRA VINAGRES 500ML');
  });

  it('con denominación nueva valida unicidad excluyendo el propio id', async () => {
    await useCase.execute(100, dto({ denominacion: 'nombre manual' }));

    expect(uniquenessValidator.validarDenominacionUnica).toHaveBeenCalledWith('nombre manual', 100);
    const producto = repository.update.mock.calls[0][1];
    expect(producto.getDenominacion()).toBe('nombre manual');
    expect(producto.getDenominacionEditadaManualmente()).toBe(true);
  });

  it('producto sin presentación y sin presentacionId pasa undefined al validador', async () => {
    repository.findOne.mockResolvedValue(crearProducto({ presentacion: null, denominacionEditadaManualmente: true }));
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockResolvedValue({
      marca: crearMarca(),
      linea: crearLinea(),
      presentacion: null,
    });

    await useCase.execute(100, dto());

    expect(relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas).toHaveBeenCalledWith(20, 10, undefined);
  });

  it('lanza NotFound si el producto no existe', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(100, dto())).rejects.toThrow(new NotFoundException('Producto con ID 100 no encontrado.'));
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('lanza error interno si el producto persistido no tiene línea o marca', async () => {
    repository.findOne.mockResolvedValue(crearProducto({ linea: undefined as any }));

    await expect(useCase.execute(100, dto())).rejects.toThrow(InternalServerErrorException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('propaga el conflicto de denominación sin persistir', async () => {
    uniquenessValidator.validarDenominacionUnica.mockRejectedValue(new ConflictException('duplicada'));

    await expect(useCase.execute(100, dto({ denominacion: 'repetida' }))).rejects.toThrow(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('rechaza cambiar a una línea del sistema', async () => {
    relatedEntitiesValidator.validarYObtenerEntidadesRelacionadas.mockResolvedValue({
      marca: crearMarca(),
      linea: crearLinea(11, 'SISTEMA', 1),
      presentacion: crearPresentacion(),
    });

    await expect(useCase.execute(100, dto({ lineaId: 11 }))).rejects.toThrow('Línea 11 está marcada como del sistema');
    expect(repository.update).not.toHaveBeenCalled();
  });
});
