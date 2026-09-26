import { ProductoRepository } from '../src/modules/gestion-productos/producto/infraestructure/persistence/repositories/producto.repository';

describe('CR-004 - Búsqueda parcial de productos', () => {
  const crearEscenario = () => {
    const query = {
      leftJoinAndSelect: jest.fn(),
      leftJoin: jest.fn(),
      andWhere: jest.fn(),
      orderBy: jest.fn(),
      addOrderBy: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    } as any;

    for (const metodo of [
      'leftJoinAndSelect', 'leftJoin', 'andWhere', 'orderBy',
      'addOrderBy', 'skip', 'take',
    ]) {
      query[metodo].mockReturnValue(query);
    }

    const typeormRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(query),
    } as any;

    return {
      query,
      repository: new ProductoRepository(typeormRepository),
    };
  };

  const buscar = (
    repository: ProductoRepository,
    filtros: {
      denominacion?: string;
      lineaDenominacion?: string;
      superlineaDenominacion?: string;
    },
  ) => repository.findBy(
    filtros.denominacion ?? '',
    '',
    false,
    '',
    0,
    0,
    0,
    false,
    0,
    10,
    filtros.lineaDenominacion,
    filtros.superlineaDenominacion,
  );

  it.each(['coca', 'cola'])(
    'HU-004.1 busca "%s" en cualquier parte de la denominación',
    async (texto) => {
      const { repository, query } = crearEscenario();

      await buscar(repository, { denominacion: texto });

      expect(query.andWhere).toHaveBeenCalledWith(
        "UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'",
        { denominacion: `%${texto}%` },
      );
    },
  );

  it.each(['gas', 'jugos'])(
    'HU-004.2 busca "%s" en cualquier parte de la denominación de Línea',
    async (texto) => {
      const { repository, query } = crearEscenario();

      await buscar(repository, { lineaDenominacion: texto });

      expect(query.andWhere).toHaveBeenCalledWith(
        "UPPER(linea.denominacion) LIKE UPPER(:lineaDenominacion) ESCAPE '!'",
        { lineaDenominacion: `%${texto}%` },
      );
    },
  );

  it.each(['beb', 'bebidas'])(
    'HU-004.3 busca "%s" en cualquier parte de la denominación de SuperLínea',
    async (texto) => {
      const { repository, query } = crearEscenario();

      await buscar(repository, { superlineaDenominacion: texto });

      expect(query.leftJoin).toHaveBeenCalledWith('linea.superlinea', 'superlinea');
      expect(query.andWhere).toHaveBeenCalledWith(
        "UPPER(superlinea.denominacion) LIKE UPPER(:superlineaDenominacion) ESCAPE '!'",
        { superlineaDenominacion: `%${texto}%` },
      );
    },
  );

  it('HU-004.4 combina denominación y SuperLínea sin aceptar resultados que cumplan solo una', async () => {
    const { repository, query } = crearEscenario();

    await buscar(repository, { denominacion: 'cola', superlineaDenominacion: 'beb' });

    expect(query.andWhere.mock.calls.slice(0, 2)).toEqual([
      ["UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'", { denominacion: '%cola%' }],
      ["UPPER(superlinea.denominacion) LIKE UPPER(:superlineaDenominacion) ESCAPE '!'", { superlineaDenominacion: '%beb%' }],
    ]);
  });

  it('HU-004.4 combina denominación, Línea y SuperLínea mediante condiciones AND', async () => {
    const { repository, query } = crearEscenario();

    await buscar(repository, {
      denominacion: 'cola',
      lineaDenominacion: 'gas',
      superlineaDenominacion: 'beb',
    });

    expect(query.andWhere.mock.calls.slice(0, 3)).toEqual([
      ["UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'", { denominacion: '%cola%' }],
      ["UPPER(linea.denominacion) LIKE UPPER(:lineaDenominacion) ESCAPE '!'", { lineaDenominacion: '%gas%' }],
      ["UPPER(superlinea.denominacion) LIKE UPPER(:superlineaDenominacion) ESCAPE '!'", { superlineaDenominacion: '%beb%' }],
    ]);
  });

  it('HU-004.4 devuelve vacío si la combinación de Línea y SuperLínea no coincide', async () => {
    const { repository } = crearEscenario();

    await expect(buscar(repository, {
      lineaDenominacion: 'gaseosas',
      superlineaDenominacion: 'alimentos',
    })).resolves.toEqual({ data: [], total: 0 });
  });

  it('CA-C01 aplica una comparación insensible a mayúsculas y minúsculas', async () => {
    const escenarioMinusculas = crearEscenario();
    const escenarioMayusculas = crearEscenario();

    await buscar(escenarioMinusculas.repository, { denominacion: 'coca' });
    await buscar(escenarioMayusculas.repository, { denominacion: 'COCA' });

    expect(escenarioMinusculas.query.andWhere.mock.calls[0][0])
      .toBe("UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'");
    expect(escenarioMayusculas.query.andWhere.mock.calls[0][0])
      .toBe("UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'");
  });

  it('CA-C02 elimina los espacios exteriores del texto buscado', async () => {
    const { repository, query } = crearEscenario();

    await buscar(repository, { denominacion: '  coca  ' });

    expect(query.andWhere).toHaveBeenCalledWith(
      "UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'",
      { denominacion: '%coca%' },
    );
  });

  it('CA-C03 y CA-C05 ignora filtros vacíos después de limpiarlos', async () => {
    const { repository, query } = crearEscenario();

    await buscar(repository, {
      denominacion: '   ',
      lineaDenominacion: '',
      superlineaDenominacion: '  ',
    });

    expect(query.andWhere).toHaveBeenCalledTimes(1);
    expect(query.andWhere).toHaveBeenCalledWith('producto.deletedAt IS NULL');
  });

  it('devuelve una lista vacía y total cero cuando no existen coincidencias', async () => {
    const { repository } = crearEscenario();

    await expect(buscar(repository, { denominacion: 'inexistente' }))
      .resolves.toEqual({ data: [], total: 0 });
  });

  it('CA-C06 conserva los filtros y el total al solicitar otra página', async () => {
    const { repository, query } = crearEscenario();
    query.getManyAndCount.mockResolvedValue([[], 24]);

    const resultado = await repository.findBy(
      'cola', '', false, '', 0, 0, 0, false, 10, 10, 'gas', 'beb',
    );

    expect(query.andWhere).toHaveBeenCalledWith(
      "UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'",
      { denominacion: '%cola%' },
    );
    expect(query.andWhere).toHaveBeenCalledWith(
      "UPPER(linea.denominacion) LIKE UPPER(:lineaDenominacion) ESCAPE '!'",
      { lineaDenominacion: '%gas%' },
    );
    expect(query.andWhere).toHaveBeenCalledWith(
      "UPPER(superlinea.denominacion) LIKE UPPER(:superlineaDenominacion) ESCAPE '!'",
      { superlineaDenominacion: '%beb%' },
    );
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(query.take).toHaveBeenCalledWith(10);
    expect(resultado.total).toBe(24);
  });

  it('CA-C07 usa skip cero al comenzar una búsqueda nueva', async () => {
    const { repository, query } = crearEscenario();

    await buscar(repository, { denominacion: 'sprite' });

    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.take).toHaveBeenCalledWith(10);
  });

  it('trata los comodines ingresados por el usuario como caracteres literales', async () => {
    const { repository, query } = crearEscenario();

    await buscar(repository, { denominacion: '50%_OFF!' });

    expect(query.andWhere).toHaveBeenCalledWith(
      "UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'",
      { denominacion: '%50!%!_OFF!!%' },
    );
  });
});
