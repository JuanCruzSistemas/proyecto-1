import { Presentacion } from './presentacion.entity';

describe('Presentacion', () => {
  describe('create', () => {
    it('crea una nueva presentación', () => {
      const presentacion = Presentacion.create({
        denominacion: 'caja x 12',
        observacion: 'Test',
        usuarioCreatedId: 1,
      });

      expect(presentacion.getId()).toBeNull();
      expect(presentacion.getDenominacion()).toBe('caja x 12');
      expect(presentacion.getObservacion()).toBe('Test');
      expect(presentacion.getUsuarioCreatedId()).toBe(1);
      expect(presentacion.getDeletedAt()).toBeNull();
    });

    it('crea presentación con observacion null', () => {
      const presentacion = Presentacion.create({
        denominacion: 'botella',
        observacion: null,
        usuarioCreatedId: 1,
      });

      expect(presentacion.getObservacion()).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('reconst itute desde base de datos', () => {
      const fecha = new Date();
      const presentacion = Presentacion.reconstitute({
        id: 1,
        denominacion: 'sobre',
        observacion: 'Test',
        createdAt: fecha,
        updatedAt: fecha,
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      expect(presentacion.getId()).toBe(1);
      expect(presentacion.getDenominacion()).toBe('sobre');
    });
  });

  describe('actualizarDatos', () => {
    it('actualiza los datos de la presentación', () => {
      const presentacion = Presentacion.create({
        denominacion: 'lata',
        observacion: null,
        usuarioCreatedId: 1,
      });

      presentacion.actualizarDatos({
        denominacion: 'lata 500ml',
        observacion: 'Actualizado',
        usuarioUpdatedId: 2,
      });

      expect(presentacion.getDenominacion()).toBe('lata 500ml');
      expect(presentacion.getObservacion()).toBe('Actualizado');
      expect(presentacion.getUsuarioUpdatedId()).toBe(2);
    });
  });

  describe('marcarComoEliminado', () => {
    it('marca la presentación como eliminada', () => {
      const presentacion = Presentacion.create({
        denominacion: 'paquete',
        observacion: null,
        usuarioCreatedId: 1,
      });

      presentacion.marcarComoEliminado(3);

      expect(presentacion.getDeletedAt()).toBeDefined();
      expect(presentacion.getDeletedAt()).not.toBeNull();
      expect(presentacion.getUsuarioDeletedId()).toBe(3);
    });
  });
});
