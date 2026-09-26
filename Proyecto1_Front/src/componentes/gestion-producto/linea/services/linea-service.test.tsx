import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  obtener: vi.fn(),
  obtenerId: vi.fn(),
  listar: vi.fn(),
}));

vi.mock('../../../../utils/crudFactory', () => ({
  createCrudService: () => ({ obtener: mocks.obtener, obtenerId: mocks.obtenerId }),
}));

vi.mock('../../superlinea/services/superlinea-service', () => ({
  default: { listar: mocks.listar },
}));

import LineaService from './linea-service';

describe('LineaService', () => {
  it('enriquece cada Línea con la denominación de su SuperLínea al listar', async () => {
    mocks.obtener.mockResolvedValue({ data: [
      { id: 1, denominacion: 'Gaseosas', superlineaId: 7 },
    ], total: 1 });
    mocks.listar.mockResolvedValue([{ id: 7, denominacion: 'Bebidas' }]);

    const resultado = await LineaService.obtener({ denominacion: 'gas' });

    expect(mocks.obtener).toHaveBeenCalledWith({ denominacion: 'gas' });
    expect(resultado.data[0].superlinea).toEqual({ id: 7, denominacion: 'Bebidas' });
  });

  it('informa la asociación no disponible sin perder el identificador', async () => {
    mocks.obtenerId.mockResolvedValue({ id: 2, denominacion: 'Lácteos', superlineaId: 9 });
    mocks.listar.mockResolvedValue([{ id: 7, denominacion: 'Bebidas' }]);

    const resultado = await LineaService.obtenerId(2);

    expect(resultado.superlinea).toEqual({
      id: 9,
      denominacion: 'SuperLínea #9 (no disponible)',
    });
  });

  it('distingue una Línea sin asociación en los datos heredados', async () => {
    mocks.obtenerId.mockResolvedValue({ id: 3, denominacion: 'Sin clasificar', superlineaId: 0 });
    mocks.listar.mockResolvedValue([]);

    const resultado = await LineaService.obtenerId(3);

    expect(resultado.superlinea).toEqual({ id: 0, denominacion: 'Sin asignación' });
  });
});
