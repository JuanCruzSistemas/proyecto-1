import { MovimientoStock } from './movimiento-stock.entity';

describe('MovimientoStock (dominio)', () => {
  afterEach(() => jest.useRealTimers());

  it('create() arma un movimiento nuevo sin id y con la fecha actual', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-01T12:00:00Z'));

    const movimiento = MovimientoStock.create({ productoId: 100, operacionId: 5, tipoOperacion: 'venta-producto' });

    expect(movimiento.getId()).toBeNull();
    expect(movimiento.getProductoId()).toBe(100);
    expect(movimiento.getOperacionId()).toBe(5);
    expect(movimiento.getTipoOperacion()).toBe('venta-producto');
    expect(movimiento.getCreadoEn()).toEqual(new Date('2026-06-01T12:00:00Z'));
  });

  it('reconstitute() conserva el id y la fecha persistidos', () => {
    const creadoEn = new Date('2025-12-24');

    const movimiento = MovimientoStock.reconstitute({ id: 9, productoId: 100, operacionId: 5, tipoOperacion: 'compra', creadoEn });

    expect(movimiento.getId()).toBe(9);
    expect(movimiento.getCreadoEn()).toBe(creadoEn);
  });
});
