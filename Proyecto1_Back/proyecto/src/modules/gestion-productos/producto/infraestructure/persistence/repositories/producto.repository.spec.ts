import { HttpStatus } from '@nestjs/common';
import { ProductoRepository } from './producto.repository';
import { ProductoEntity } from '../entities/producto.orm-entity';
import { EntityNotFoundException } from 'src/modules/common/exceptions/entity-notFound-exceptions';
import { DatabaseConnectionException } from 'src/modules/common/exceptions/database-connection.exception';
import { crearProducto, crearProductoOrm, crearUsuario } from '../../../testing/producto.fixtures-spec';

/** QueryBuilder encadenable que registra las condiciones aplicadas. */
const crearQueryBuilder = (resultados: Partial<Record<'getOne' | 'getMany' | 'getManyAndCount' | 'getCount' | 'getExists', unknown>> = {}) => {
  const qb: any = {};
  for (const metodo of ['leftJoinAndSelect', 'leftJoin', 'where', 'andWhere', 'orderBy', 'addOrderBy', 'skip', 'take', 'limit']) {
    qb[metodo] = jest.fn(() => qb);
  }
  qb.getOne = jest.fn().mockResolvedValue(resultados.getOne ?? null);
  qb.getMany = jest.fn().mockResolvedValue(resultados.getMany ?? []);
  qb.getManyAndCount = jest.fn().mockResolvedValue(resultados.getManyAndCount ?? [[], 0]);
  qb.getCount = jest.fn().mockResolvedValue(resultados.getCount ?? 0);
  qb.getExists = jest.fn().mockResolvedValue(resultados.getExists ?? false);
  /** Todas las condiciones (where/andWhere) como texto, para verificar filtros. */
  qb.condiciones = () => [...qb.where.mock.calls, ...qb.andWhere.mock.calls].map((c: unknown[]) => c[0]);
  return qb;
};

describe('ProductoRepository', () => {
  const orm = {
    create: jest.fn((e: ProductoEntity) => e),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const repository = new ProductoRepository(orm as any);
  let qb: ReturnType<typeof crearQueryBuilder>;

  const usarQueryBuilder = (resultados = {}) => {
    qb = crearQueryBuilder(resultados);
    orm.createQueryBuilder.mockReturnValue(qb);
    return qb;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usarQueryBuilder();
  });

  describe('create()', () => {
    it('persiste el producto mapeado a ORM y devuelve el dominio con el id asignado', async () => {
      orm.save.mockImplementation(async (e: ProductoEntity) => ({ ...crearProductoOrm(), ...e, id: 555 }));

      const creado = await repository.create(crearProducto({ id: null as any }));

      const guardado: ProductoEntity = orm.save.mock.calls[0][0];
      expect(guardado.porcentaje).toBe(30); // fracción 0.3 → 30 %
      expect(guardado.linea).toEqual({ id: 10 });
      expect(creado.getId()).toBe(555);
    });

    it('traduce errores de base a DatabaseConnectionException', async () => {
      orm.save.mockRejectedValue(new Error('boom'));

      await expect(repository.create(crearProducto())).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('findOne()', () => {
    it('trae el producto activo con sus relaciones', async () => {
      usarQueryBuilder({ getOne: crearProductoOrm() });

      const producto = await repository.findOne(100);

      expect(producto!.getId()).toBe(100);
      expect(producto!.getMargen()).toBe(0.3);
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('producto.presentacion', 'presentacion');
      expect(qb.where).toHaveBeenCalledWith('producto.id = :id', { id: 100 });
      expect(qb.condiciones()).toContain('producto.deletedAt IS NULL');
    });

    it('si no existe lanza EntityNotFoundException (404), no devuelve null', async () => {
      usarQueryBuilder({ getOne: null });

      await expect(repository.findOne(1)).rejects.toBeInstanceOf(EntityNotFoundException);
    });

    it('otros errores se traducen a DatabaseConnectionException', async () => {
      usarQueryBuilder();
      qb.getOne.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(repository.findOne(1)).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('findByIdConAuditoria()', () => {
    it('incluye los usuarios de auditoría y también productos dados de baja', async () => {
      usarQueryBuilder({ getOne: crearProductoOrm({ usuarioUpdated: crearUsuario(2, 'Editor') }) });

      const producto = await repository.findByIdConAuditoria(100);

      expect(producto!.getUsuarioUpdated()).toEqual(crearUsuario(2, 'Editor'));
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('producto.usuarioUpdated', 'usuarioUpdated');
      expect(qb.condiciones()).not.toContain('producto.deletedAt IS NULL');
    });

    it('lanza EntityNotFoundException si no existe y traduce otros errores', async () => {
      usarQueryBuilder({ getOne: null });
      await expect(repository.findByIdConAuditoria(1)).rejects.toBeInstanceOf(EntityNotFoundException);

      usarQueryBuilder();
      qb.getOne.mockRejectedValue(new Error('x'));
      await expect(repository.findByIdConAuditoria(1)).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('findByIdWithoutRelations()', () => {
    it('no hace joins y filtra los eliminados', async () => {
      usarQueryBuilder({ getOne: crearProductoOrm() });

      await expect(repository.findByIdWithoutRelations(100)).resolves.toBeDefined();
      expect(qb.leftJoinAndSelect).not.toHaveBeenCalled();
      expect(qb.condiciones()).toContain('producto.deletedAt IS NULL');
    });

    it('lanza EntityNotFoundException si no existe y traduce otros errores', async () => {
      usarQueryBuilder({ getOne: null });
      await expect(repository.findByIdWithoutRelations(1)).rejects.toBeInstanceOf(EntityNotFoundException);

      usarQueryBuilder();
      qb.getOne.mockRejectedValue(new Error('x'));
      await expect(repository.findByIdWithoutRelations(1)).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('update()', () => {
    it('reutiliza la fila existente para que TypeORM haga UPDATE', async () => {
      const existente = crearProductoOrm();
      orm.findOne.mockResolvedValue(existente);
      orm.save.mockImplementation(async (e: ProductoEntity) => e);

      const actualizado = await repository.update(100, crearProducto({ costo: 250 }));

      expect(orm.save.mock.calls[0][0]).toBe(existente);
      expect(existente.costo).toBe(250);
      expect(actualizado.getCosto()).toBe(250);
    });

    it('si no existe, el NotFound queda envuelto como error de base (500) — ver INFORME.md', async () => {
      orm.findOne.mockResolvedValue(null);

      const error = await repository.update(100, crearProducto()).catch((e) => e);

      expect(error).toBeInstanceOf(DatabaseConnectionException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('updateEntity()', () => {
    it('guarda dentro de la unidad de trabajo reutilizando la fila existente', async () => {
      const existente = crearProductoOrm();
      const uowRepo = { findOne: jest.fn().mockResolvedValue(existente), save: jest.fn(async (e) => e) };
      const uow = { getRepository: jest.fn(() => uowRepo) };

      const guardado = await repository.updateEntity(uow as any, crearProducto({ stock: 42 }));

      expect(uow.getRepository).toHaveBeenCalledWith(ProductoEntity);
      expect(uowRepo.findOne).toHaveBeenCalledWith({ where: { id: 100 } });
      expect(uowRepo.save.mock.calls[0][0]).toBe(existente);
      expect(guardado.getStock()).toBe(42);
      expect(orm.save).not.toHaveBeenCalled();
    });

    it('un producto sin id se guarda como fila nueva', async () => {
      const uowRepo = { findOne: jest.fn(), save: jest.fn(async (e) => ({ ...crearProductoOrm(), ...e, id: 9 })) };

      await repository.updateEntity({ getRepository: () => uowRepo } as any, crearProducto({ id: null as any }));

      expect(uowRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('persiste la baja lógica con fecha y usuario', async () => {
      const producto = crearProducto();
      producto.marcarComoEliminado(crearUsuario(3, 'Baja'));
      orm.findOne.mockResolvedValue(crearProductoOrm());
      orm.save.mockImplementation(async (e: ProductoEntity) => e);

      const eliminado = await repository.remove(producto, crearUsuario(3, 'Baja'));

      const guardado: ProductoEntity = orm.save.mock.calls[0][0];
      expect(guardado.deletedAt).toBeInstanceOf(Date);
      expect(guardado.usuarioDeleted).toEqual(crearUsuario(3, 'Baja'));
      expect(eliminado.getDeletedAt()).toBeInstanceOf(Date);
    });

    it('traduce errores a DatabaseConnectionException', async () => {
      orm.findOne.mockRejectedValue(new Error('x'));

      await expect(repository.remove(crearProducto(), crearUsuario())).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('findBy()', () => {
    it('sin filtros solo excluye eliminados, ordena y pagina', async () => {
      usarQueryBuilder({ getManyAndCount: [[crearProductoOrm()], 1] });

      const res = await repository.findBy('', '', false, '', 0, 0, 0, false, 20, 10);

      expect(res.total).toBe(1);
      expect(res.data[0].getId()).toBe(100);
      expect(qb.condiciones()).toEqual(['producto.deletedAt IS NULL']);
      expect(qb.orderBy).toHaveBeenCalledWith('producto.denominacion', 'ASC');
      expect(qb.skip).toHaveBeenCalledWith(20);
      expect(qb.take).toHaveBeenCalledWith(10);
    });

    it('aplica búsqueda parcial por denominación, línea y superlínea', async () => {
      await repository.findBy('ace', '', false, '', 0, 0, 0, false, 0, 10, 'aceites', 'almacen');

      expect(qb.andWhere).toHaveBeenCalledWith("UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'", { denominacion: '%ace%' });
      expect(qb.andWhere).toHaveBeenCalledWith("UPPER(linea.denominacion) LIKE UPPER(:lineaDenominacion) ESCAPE '!'", { lineaDenominacion: '%aceites%' });
      expect(qb.andWhere).toHaveBeenCalledWith("UPPER(superlinea.denominacion) LIKE UPPER(:superlineaDenominacion) ESCAPE '!'", { superlineaDenominacion: '%almacen%' });
    });

    it('código de proveedor exacto y código de referencia se combinan con OR', async () => {
      await repository.findBy('', 'P-1', true, 'R-9', 0, 0, 0, false, 0, 10);

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(UPPER(producto.codigoProveedor) = UPPER(:codigoProveedor) OR UPPER(producto.codigoReferencia) LIKE UPPER(:codigoReferencia))',
        { codigoProveedor: 'P-1', codigoReferencia: '%R-9%' },
      );
    });

    it('código de proveedor parcial usa LIKE', async () => {
      await repository.findBy('', 'P-1', false, '', 0, 0, 0, false, 0, 10);

      expect(qb.andWhere).toHaveBeenCalledWith('(UPPER(producto.codigoProveedor) LIKE UPPER(:codigoProveedor))', { codigoProveedor: '%P-1%' });
    });

    it('filtra por marca, línea, proveedor y stock positivo', async () => {
      await repository.findBy('', '', false, '', 1, 2, 3, true, 0, 10);

      expect(qb.andWhere).toHaveBeenCalledWith('marca.id = :marca_id', { marca_id: 1 });
      expect(qb.andWhere).toHaveBeenCalledWith('linea.id = :linea_id', { linea_id: 2 });
      expect(qb.andWhere).toHaveBeenCalledWith('proveedor.id = :proveedor_id', { proveedor_id: 3 });
      expect(qb.andWhere).toHaveBeenCalledWith('producto.stock > 0');
    });
  });

  describe('findByRapido()', () => {
    it('sin código solo excluye eliminados', async () => {
      usarQueryBuilder({ getManyAndCount: [[crearProductoOrm()], 1] });

      const res = await repository.findByRapido('', false, 0, 10);

      expect(res.total).toBe(1);
      expect(qb.condiciones()).toEqual(['producto.deletedAt IS NULL']);
    });

    it('exacto compara igualdad contra código de proveedor o referencia', async () => {
      await repository.findByRapido('NAT-1', true, 0, 10);

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(producto.codigoProveedor = :codigo OR producto.codigoReferencia = :codigo)',
        { codigo: 'NAT-1' },
      );
    });

    it('no exacto busca parcial también en la denominación', async () => {
      await repository.findByRapido('NAT', false, 5, 5);

      const [condicion, params] = qb.andWhere.mock.calls[0];
      expect(condicion).toContain('producto.denominacion LIKE :codigo');
      expect(params).toEqual({ codigo: '%NAT%' });
      expect(qb.skip).toHaveBeenCalledWith(5);
    });
  });

  describe('isCodigoProveedorDuplicado()', () => {
    it.each([null, '', '   ', '0'])('ignora el código vacío o "0" (%p) sin consultar', async (codigo) => {
      await expect(repository.isCodigoProveedorDuplicado(codigo)).resolves.toBe(false);
      expect(orm.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('consulta excluyendo el propio id', async () => {
      usarQueryBuilder({ getExists: true });

      await expect(repository.isCodigoProveedorDuplicado('P-1', 7)).resolves.toBe(true);
      expect(qb.andWhere).toHaveBeenCalledWith('producto.id != :id', { id: 7 });
    });

    it('sin id no agrega la exclusión', async () => {
      await repository.isCodigoProveedorDuplicado('P-1');
      expect(qb.andWhere).not.toHaveBeenCalled();
    });
  });

  describe('findByDenominacion()', () => {
    it('busca activos por denominación exacta', async () => {
      orm.findOne.mockResolvedValue(crearProductoOrm());

      await expect(repository.findByDenominacion('NATURA ACEITES 1L')).resolves.toBeDefined();
      expect(orm.findOne.mock.calls[0][0].where.denominacion).toBe('NATURA ACEITES 1L');
    });

    it('devuelve null si no existe y traduce errores', async () => {
      orm.findOne.mockResolvedValue(null);
      await expect(repository.findByDenominacion('X')).resolves.toBeNull();

      orm.findOne.mockRejectedValue(new Error('x'));
      await expect(repository.findByDenominacion('X')).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('existsByDenominacion() / existsByCodigoProveedor()', () => {
    it('es true si hay otro producto activo con la misma denominación', async () => {
      usarQueryBuilder({ getCount: 1 });

      await expect(repository.existsByDenominacion('ACEITE', 5)).resolves.toBe(true);
      expect(qb.andWhere).toHaveBeenCalledWith('producto.id != :excludeId', { excludeId: 5 });
    });

    it('sin excludeId no agrega la exclusión y con 0 resultados es false', async () => {
      await expect(repository.existsByDenominacion('ACEITE')).resolves.toBe(false);
      expect(qb.andWhere).toHaveBeenCalledTimes(1); // solo deletedAt IS NULL
    });

    it('existsByCodigoProveedor aplica la misma lógica', async () => {
      usarQueryBuilder({ getCount: 2 });
      await expect(repository.existsByCodigoProveedor('P-1', 3)).resolves.toBe(true);
      expect(qb.andWhere).toHaveBeenCalledWith('producto.id != :excludeId', { excludeId: 3 });

      usarQueryBuilder({ getCount: 0 });
      await expect(repository.existsByCodigoProveedor('P-1', 0)).resolves.toBe(false);
    });

    it('traducen errores a DatabaseConnectionException', async () => {
      usarQueryBuilder();
      qb.getCount.mockRejectedValue(new Error('x'));

      await expect(repository.existsByDenominacion('A')).rejects.toBeInstanceOf(DatabaseConnectionException);
      await expect(repository.existsByCodigoProveedor('A', 0)).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('findByDenominacionCodigoProveedorFiltered()', () => {
    it('pagina los productos activos', async () => {
      usarQueryBuilder({ getManyAndCount: [[crearProductoOrm()], 1] });

      const res = await repository.findByDenominacionCodigoProveedorFiltered('ACE', 10, 5);

      expect(res.total).toBe(1);
      expect(qb.skip).toHaveBeenCalledWith(10);
      expect(qb.take).toHaveBeenCalledWith(5);
    });

    it('NO filtra por la denominación recibida (comportamiento actual) — ver INFORME.md', async () => {
      await repository.findByDenominacionCodigoProveedorFiltered('ACE');

      expect(qb.condiciones()).toEqual(['producto.deletedAt IS NULL']);
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(10);
    });

    it('traduce errores a DatabaseConnectionException', async () => {
      usarQueryBuilder();
      qb.getManyAndCount.mockRejectedValue(new Error('x'));

      await expect(repository.findByDenominacionCodigoProveedorFiltered('A')).rejects.toBeInstanceOf(DatabaseConnectionException);
    });
  });

  describe('existsProductosActivosBy{Presentacion,Marca,Linea}()', () => {
    it.each([
      ['existsProductosActivosByPresentacion', 'producto.presentacion_id = :presentacionId', { presentacionId: 4 }],
      ['existsProductosActivosByMarca', 'producto.marca_id = :marcaId', { marcaId: 4 }],
      ['existsProductosActivosByLinea', 'producto.linea_id = :lineaId', { lineaId: 4 }],
    ] as const)('%s filtra activos por la FK correspondiente', async (metodo, condicion, params) => {
      usarQueryBuilder({ getCount: 1 });

      await expect(repository[metodo](4)).resolves.toBe(true);
      expect(qb.where).toHaveBeenCalledWith(condicion, params);
      expect(qb.andWhere).toHaveBeenCalledWith('producto.deletedAt IS NULL');

      usarQueryBuilder({ getCount: 0 });
      await expect(repository[metodo](4)).resolves.toBe(false);
    });
  });

  describe('findByIds()', () => {
    it('elimina ids repetidos y mapea a dominio', async () => {
      usarQueryBuilder({ getMany: [crearProductoOrm({ id: 1 }), crearProductoOrm({ id: 2 })] });

      const productos = await repository.findByIds([1, 2, 2, 1]);

      expect(qb.where).toHaveBeenCalledWith('producto.id IN (:...ids)', { ids: [1, 2] });
      expect(productos.map((p) => p.getId())).toEqual([1, 2]);
    });

    it('con lista vacía no consulta la base', async () => {
      await expect(repository.findByIds([])).resolves.toEqual([]);
      expect(orm.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});
