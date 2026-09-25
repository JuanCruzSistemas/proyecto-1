import { HistorialPrecioFactory } from './historial-precio.factory';
import { HistorialPrecio } from '../entities/historial-precio.entity';
import { Producto } from '../entities/producto.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import {
  HistorialPrecioCreateParams,
  HistorialPrecioReconstituteParams,
} from '../entities/historial-precio.types';

describe('HistorialPrecioFactory', () => {
  const producto = { getId: () => 10 } as unknown as Producto;
  const usuario = { id: 4 } as unknown as Usuario;

  const createParams: HistorialPrecioCreateParams = {
    precioAnterior: 130,
    precioNuevo: 150,
    costoAnterior: 100,
    costoNuevo: 100,
    margenAnterior: 0.3,
    margenNuevo: 0.5,
    motivo: 'Actualización de lista',
    producto,
    usuario,
  };

  describe('create()', () => {
    afterEach(() => jest.useRealTimers());

    it('crea un registro nuevo sin id y con la fecha actual', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-04-20T15:30:00Z'));

      const historial = HistorialPrecioFactory.create(createParams);

      expect(historial).toBeInstanceOf(HistorialPrecio);
      expect(historial.getId()).toBeNull();
      expect(historial.getFecha()).toEqual(new Date('2026-04-20T15:30:00Z'));
    });

    it('conserva los valores anteriores y nuevos de precio, costo y margen', () => {
      const historial = HistorialPrecioFactory.create(createParams);

      expect(historial.getPrecioAnterior()).toBe(130);
      expect(historial.getPrecioNuevo()).toBe(150);
      expect(historial.getCostoAnterior()).toBe(100);
      expect(historial.getCostoNuevo()).toBe(100);
      expect(historial.getMargenAnterior()).toBe(0.3);
      expect(historial.getMargenNuevo()).toBe(0.5);
      expect(historial.getMotivo()).toBe('Actualización de lista');
      expect(historial.getProducto()).toBe(producto);
      expect(historial.getUsuario()).toBe(usuario);
    });

    it('cada llamada genera una instancia independiente', () => {
      const a = HistorialPrecioFactory.create(createParams);
      const b = HistorialPrecioFactory.create(createParams);
      expect(a).not.toBe(b);
    });
  });

  describe('reconstitute()', () => {
    it('rehidrata el registro con su id y fecha persistidos', () => {
      const params: HistorialPrecioReconstituteParams = {
        ...createParams,
        id: 99,
        fecha: new Date('2025-11-11T11:11:00Z'),
      };

      const historial = HistorialPrecioFactory.reconstitute(params);

      expect(historial.getId()).toBe(99);
      expect(historial.getFecha()).toEqual(new Date('2025-11-11T11:11:00Z'));
      expect(historial.getPrecioAnterior()).toBe(130);
      expect(historial.getPrecioNuevo()).toBe(150);
      expect(historial.getCostoAnterior()).toBe(100);
      expect(historial.getCostoNuevo()).toBe(100);
      expect(historial.getMargenAnterior()).toBe(0.3);
      expect(historial.getMargenNuevo()).toBe(0.5);
      expect(historial.getMotivo()).toBe('Actualización de lista');
      expect(historial.getProducto()).toBe(producto);
      expect(historial.getUsuario()).toBe(usuario);
    });
  });
});
