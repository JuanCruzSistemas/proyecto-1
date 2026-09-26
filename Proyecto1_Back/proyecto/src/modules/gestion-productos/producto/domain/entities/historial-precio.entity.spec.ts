import { HistorialPrecio } from './historial-precio.entity';
import { Producto } from './producto.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

describe('HistorialPrecio (dominio)', () => {
  const producto = { getId: () => 1 } as unknown as Producto;
  const usuario = { id: 2 } as unknown as Usuario;
  const fecha = new Date('2026-02-02T10:00:00Z');

  const crear = (id: number | null = 5) => new HistorialPrecio(
    id, 110, 132, 100, 110, 0.1, 0.2, 'Aumento de costo', fecha, producto, usuario
  );

  it('expone todos los datos del cambio de precio', () => {
    const historial = crear();

    expect(historial.getId()).toBe(5);
    expect(historial.getPrecioAnterior()).toBe(110);
    expect(historial.getPrecioNuevo()).toBe(132);
    expect(historial.getCostoAnterior()).toBe(100);
    expect(historial.getCostoNuevo()).toBe(110);
    expect(historial.getMargenAnterior()).toBe(0.1);
    expect(historial.getMargenNuevo()).toBe(0.2);
    expect(historial.getMotivo()).toBe('Aumento de costo');
    expect(historial.getFecha()).toBe(fecha);
    expect(historial.getProducto()).toBe(producto);
    expect(historial.getUsuario()).toBe(usuario);
  });

  it('admite un id nulo para registros todavía no persistidos', () => {
    expect(crear(null).getId()).toBeNull();
  });
});
