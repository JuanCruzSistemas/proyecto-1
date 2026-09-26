import { HistorialPrecioMapper } from './historial-precio.mapper';
import { HistorialPrecioOrmEntity } from '../entities/historial-precio-orm.entity';
import { HistorialPrecioFactory } from '../../../domain/factories/historial-precio.factory';
import { crearProducto, crearProductoOrm, crearUsuario } from '../../../testing/producto.fixtures-spec';

describe('HistorialPrecioMapper (ORM)', () => {
  const fecha = new Date('2026-04-01T09:00:00Z');

  it('toDomain() convierte márgenes de porcentaje a fracción y rehidrata el producto', () => {
    const orm = Object.assign(new HistorialPrecioOrmEntity(), {
      id: 3,
      precioAnterior: 130,
      precioNuevo: 150,
      costoAnterior: 100,
      costoNuevo: 100,
      margenAnterior: 30,
      margenNuevo: 50,
      motivo: 'Lista nueva',
      fecha,
      producto: crearProductoOrm(),
      usuario: crearUsuario(4),
    });

    const historial = HistorialPrecioMapper.toDomain(orm);

    expect(historial.getId()).toBe(3);
    expect(historial.getMargenAnterior()).toBe(0.3);
    expect(historial.getMargenNuevo()).toBe(0.5);
    expect(historial.getPrecioNuevo()).toBe(150);
    expect(historial.getMotivo()).toBe('Lista nueva');
    expect(historial.getFecha()).toBe(fecha);
    expect(historial.getProducto().getId()).toBe(100);
    expect(historial.getUsuario()).toEqual(crearUsuario(4));
  });

  const historial = (overrides: { id?: number; producto?: any; usuario?: any } = {}) =>
    HistorialPrecioFactory.reconstitute({
      id: overrides.id ?? 3,
      precioAnterior: 130,
      precioNuevo: 150,
      costoAnterior: 100,
      costoNuevo: 110,
      margenAnterior: 0.3,
      margenNuevo: 0.25,
      motivo: 'Ajuste',
      fecha,
      producto: 'producto' in overrides ? overrides.producto : crearProducto(),
      usuario: 'usuario' in overrides ? overrides.usuario : crearUsuario(4),
    });

  it('toOrm() guarda márgenes en porcentaje y las FKs de producto y usuario', () => {
    const orm = HistorialPrecioMapper.toOrm(historial());

    expect(orm).toMatchObject({
      id: 3,
      precioAnterior: 130,
      precioNuevo: 150,
      costoAnterior: 100,
      costoNuevo: 110,
      margenAnterior: 30,
      margenNuevo: 25,
      motivo: 'Ajuste',
      fecha,
      productoId: 100,
      usuarioId: 4,
    });
  });

  it('toOrm() omite id y FKs cuando no están disponibles', () => {
    const nuevo = HistorialPrecioFactory.create({
      precioAnterior: 1,
      precioNuevo: 2,
      costoAnterior: 1,
      costoNuevo: 1,
      margenAnterior: 0,
      margenNuevo: 1,
      motivo: 'x',
      producto: crearProducto({ id: null as any }),
      usuario: {} as any,
    });

    const orm = HistorialPrecioMapper.toOrm(nuevo);

    expect(orm).not.toHaveProperty('id');
    expect(orm).not.toHaveProperty('productoId');
    expect(orm).not.toHaveProperty('usuarioId');
  });

  it('toOrm() reutiliza el target recibido', () => {
    const target = new HistorialPrecioOrmEntity();
    expect(HistorialPrecioMapper.toOrm(historial(), target)).toBe(target);
  });
});
