import { HistorialPrecioRepository } from './historial-precio.repository';
import { HistorialPrecioOrmEntity } from '../entities/historial-precio-orm.entity';
import { HistorialPrecioFactory } from '../../../domain/factories/historial-precio.factory';
import { crearProducto, crearProductoOrm, crearUsuario } from '../../../testing/producto.fixtures-spec';

describe('HistorialPrecioRepository', () => {
  const RELACIONES = ['producto', 'usuario', 'producto.linea', 'producto.marca'];

  const filaOrm = (id = 1) =>
    Object.assign(new HistorialPrecioOrmEntity(), {
      id,
      precioAnterior: 130,
      precioNuevo: 150,
      costoAnterior: 100,
      costoNuevo: 100,
      margenAnterior: 30,
      margenNuevo: 50,
      motivo: 'Ajuste',
      fecha: new Date('2026-04-01'),
      productoId: 100,
      producto: crearProductoOrm(),
      usuario: crearUsuario(),
    });

  const historial = HistorialPrecioFactory.create({
    precioAnterior: 130,
    precioNuevo: 150,
    costoAnterior: 100,
    costoNuevo: 100,
    margenAnterior: 0.3,
    margenNuevo: 0.5,
    motivo: 'Ajuste',
    producto: crearProducto(),
    usuario: crearUsuario(),
  });

  const orm = { save: jest.fn(), findOne: jest.fn(), find: jest.fn() };
  const repository = new HistorialPrecioRepository(orm as any);

  beforeEach(() => {
    jest.clearAllMocks();
    orm.save.mockImplementation(async (e: HistorialPrecioOrmEntity) => ({ ...e, id: 1 }));
    orm.findOne.mockResolvedValue(filaOrm());
  });

  describe('save()', () => {
    it('guarda con el repositorio por defecto y devuelve la fila recargada con relaciones', async () => {
      const guardado = await repository.save(historial);

      expect(orm.save.mock.calls[0][0]).toMatchObject({ productoId: 100, usuarioId: 1, margenNuevo: 50 });
      expect(orm.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: RELACIONES });
      expect(guardado.getId()).toBe(1);
      expect(guardado.getMargenNuevo()).toBe(0.5);
    });

    it('dentro de una unidad de trabajo usa el repositorio transaccional', async () => {
      const uowRepo = { save: jest.fn(async (e) => ({ ...e, id: 2 })), findOne: jest.fn().mockResolvedValue(filaOrm(2)) };
      const uow = { getRepository: jest.fn(() => uowRepo) };

      const guardado = await repository.save(historial, uow as any);

      expect(uow.getRepository).toHaveBeenCalledWith(HistorialPrecioOrmEntity);
      expect(orm.save).not.toHaveBeenCalled();
      expect(guardado.getId()).toBe(2);
    });

    it('falla si no puede recargar la fila guardada', async () => {
      orm.findOne.mockResolvedValue(null);

      await expect(repository.save(historial)).rejects.toThrow('No se pudo cargar el historial guardado con ID: 1');
    });

    it('propaga los errores de base', async () => {
      orm.save.mockRejectedValue(new Error('db'));

      await expect(repository.save(historial)).rejects.toThrow('db');
    });
  });

  describe('findByProductoId()', () => {
    it('devuelve el historial del producto, más reciente primero', async () => {
      orm.find.mockResolvedValue([filaOrm(2), filaOrm(1)]);

      const res = await repository.findByProductoId(100);

      expect(orm.find).toHaveBeenCalledWith({ where: { productoId: 100 }, relations: RELACIONES, order: { fecha: 'DESC' } });
      expect(res.map((h) => h.getId())).toEqual([2, 1]);
    });

    it('propaga los errores de base', async () => {
      orm.find.mockRejectedValue(new Error('db'));

      await expect(repository.findByProductoId(100)).rejects.toThrow('db');
    });
  });
});
