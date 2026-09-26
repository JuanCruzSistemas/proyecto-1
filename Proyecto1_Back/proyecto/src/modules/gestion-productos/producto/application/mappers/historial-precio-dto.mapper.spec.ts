import { HistorialPrecioDtoMapper } from './historial-precio-dto.mapper';
import { HistorialPrecio } from '../../domain/entities/historial-precio.entity';
import { Producto } from '../../domain/entities/producto.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

describe('HistorialPrecioDtoMapper', () => {
  const crearUsuario = () =>
    ({
      id: 5,
      denominacion: 'Juan Pérez',
    }) as Usuario;

  const crearProductoMock = () => ({}) as Producto;

  const crearHistorialPrecio = (overrides = {}) =>
    new HistorialPrecio(
      1,
      100.0,
      120.0,
      80.0,
      90.0,
      0.25,
      0.33,
      'Actualización de precios',
      new Date('2024-01-15'),
      crearProductoMock(),
      crearUsuario(),
    );

  describe('toDto', () => {
    it('mapea correctamente un historial a DTO', () => {
      const historial = crearHistorialPrecio();

      const dto = HistorialPrecioDtoMapper.toDto(historial);

      expect(dto.id).toBe(1);
      expect(dto.precioAnterior).toBe(100.0);
      expect(dto.precioNuevo).toBe(120.0);
      expect(dto.costoAnterior).toBe(80.0);
      expect(dto.costoNuevo).toBe(90.0);
      expect(dto.margenAnterior).toBe(0.25);
      expect(dto.margenNuevo).toBe(0.33);
      expect(dto.motivo).toBe('Actualización de precios');
      expect(dto.fecha).toEqual(new Date('2024-01-15'));
      expect(dto.usuarioNombre).toBe('Juan Pérez');
      expect(dto.usuarioId).toBe(5);
    });

    it('extrae correctamente la información del usuario', () => {
      const historial = crearHistorialPrecio();

      const dto = HistorialPrecioDtoMapper.toDto(historial);

      expect(dto.usuarioNombre).toBe('Juan Pérez');
      expect(dto.usuarioId).toBe(5);
    });

    it('maneja correctamente valores numéricos de precios y costos', () => {
      const historial = crearHistorialPrecio();

      const dto = HistorialPrecioDtoMapper.toDto(historial);

      expect(typeof dto.precioAnterior).toBe('number');
      expect(typeof dto.precioNuevo).toBe('number');
      expect(typeof dto.costoAnterior).toBe('number');
      expect(typeof dto.costoNuevo).toBe('number');
    });

    it('maneja correctamente valores decimales de márgenes', () => {
      const historial = crearHistorialPrecio();

      const dto = HistorialPrecioDtoMapper.toDto(historial);

      expect(typeof dto.margenAnterior).toBe('number');
      expect(typeof dto.margenNuevo).toBe('number');
      expect(dto.margenAnterior).toBeGreaterThanOrEqual(0);
      expect(dto.margenNuevo).toBeGreaterThanOrEqual(0);
    });

    it('preserva la fecha sin transformaciones', () => {
      const fechaOriginal = new Date('2024-03-20T10:30:00Z');
      const historial = new HistorialPrecio(
        2,
        150,
        180,
        100,
        120,
        0.5,
        0.5,
        'Test',
        fechaOriginal,
        crearProductoMock(),
        crearUsuario(),
      );

      const dto = HistorialPrecioDtoMapper.toDto(historial);

      expect(dto.fecha).toBe(fechaOriginal);
    });

    it('maneja ID nulo correctamente', () => {
      const historial = new HistorialPrecio(
        null,
        100,
        120,
        80,
        90,
        0.25,
        0.33,
        'Test',
        new Date(),
        crearProductoMock(),
        crearUsuario(),
      );

      const dto = HistorialPrecioDtoMapper.toDto(historial);

      expect(dto.id).toBe(0);
    });
  });

  describe('toDtoList', () => {
    it('mapea correctamente una lista vacía', () => {
      const dtos = HistorialPrecioDtoMapper.toDtoList([]);

      expect(dtos).toEqual([]);
    });

    it('mapea correctamente una lista con un elemento', () => {
      const historial = crearHistorialPrecio();

      const dtos = HistorialPrecioDtoMapper.toDtoList([historial]);

      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe(1);
      expect(dtos[0].usuarioNombre).toBe('Juan Pérez');
    });

    it('mapea correctamente una lista con múltiples elementos', () => {
      const historial1 = new HistorialPrecio(
        1,
        100,
        120,
        80,
        90,
        0.25,
        0.33,
        'Primer cambio',
        new Date('2024-01-15'),
        crearProductoMock(),
        crearUsuario(),
      );

      const historial2 = new HistorialPrecio(
        2,
        120,
        150,
        90,
        110,
        0.33,
        0.36,
        'Segundo cambio',
        new Date('2024-02-20'),
        crearProductoMock(),
        crearUsuario(),
      );

      const dtos = HistorialPrecioDtoMapper.toDtoList([historial1, historial2]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].id).toBe(1);
      expect(dtos[0].motivo).toBe('Primer cambio');
      expect(dtos[1].id).toBe(2);
      expect(dtos[1].motivo).toBe('Segundo cambio');
    });

    it('preserva el orden de la lista original', () => {
      const historiales = [
        new HistorialPrecio(
          3,
          100,
          120,
          80,
          90,
          0.25,
          0.33,
          'Tercero',
          new Date('2024-03-01'),
          crearProductoMock(),
          crearUsuario(),
        ),
        new HistorialPrecio(
          1,
          100,
          120,
          80,
          90,
          0.25,
          0.33,
          'Primero',
          new Date('2024-01-01'),
          crearProductoMock(),
          crearUsuario(),
        ),
        new HistorialPrecio(
          2,
          100,
          120,
          80,
          90,
          0.25,
          0.33,
          'Segundo',
          new Date('2024-02-01'),
          crearProductoMock(),
          crearUsuario(),
        ),
      ];

      const dtos = HistorialPrecioDtoMapper.toDtoList(historiales);

      expect(dtos[0].id).toBe(3);
      expect(dtos[1].id).toBe(1);
      expect(dtos[2].id).toBe(2);
    });
  });
});
