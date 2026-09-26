import { aplicarBusquedaParcial } from './producto-search.helper';

describe('aplicarBusquedaParcial', () => {
  const crearQuery = () => ({ andWhere: jest.fn() });

  it('agrega una condición LIKE por cada filtro completo', () => {
    const query = crearQuery();

    aplicarBusquedaParcial(query as any, { denominacion: 'ace', lineaDenominacion: 'lin', superlineaDenominacion: 'sup' });

    expect(query.andWhere).toHaveBeenCalledTimes(3);
    expect(query.andWhere).toHaveBeenCalledWith("UPPER(producto.denominacion) LIKE UPPER(:denominacion) ESCAPE '!'", { denominacion: '%ace%' });
    expect(query.andWhere).toHaveBeenCalledWith("UPPER(linea.denominacion) LIKE UPPER(:lineaDenominacion) ESCAPE '!'", { lineaDenominacion: '%lin%' });
    expect(query.andWhere).toHaveBeenCalledWith("UPPER(superlinea.denominacion) LIKE UPPER(:superlineaDenominacion) ESCAPE '!'", { superlineaDenominacion: '%sup%' });
  });

  it('ignora filtros vacíos, solo espacios o ausentes', () => {
    const query = crearQuery();

    aplicarBusquedaParcial(query as any, { denominacion: '   ', lineaDenominacion: '' });

    expect(query.andWhere).not.toHaveBeenCalled();
  });

  it('recorta espacios y escapa los comodines para buscarlos literalmente', () => {
    const query = crearQuery();

    aplicarBusquedaParcial(query as any, { denominacion: '  50%_off!  ' });

    expect(query.andWhere.mock.calls[0][1]).toEqual({ denominacion: '%50!%!_off!!%' });
  });
});
