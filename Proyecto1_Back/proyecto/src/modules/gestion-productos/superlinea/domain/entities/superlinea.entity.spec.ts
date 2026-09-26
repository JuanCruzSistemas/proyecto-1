import { Superlinea } from './superlinea.entity';
import { SuperlineaInvalidaError } from './superlinea-invalida.error';
import { SuperlineaReconstituteParams } from './superlinea.types';

describe('Superlinea (dominio)', () => {
  afterEach(() => jest.useRealTimers());

  const reconstituteParams = (overrides: Partial<SuperlineaReconstituteParams> = {}): SuperlineaReconstituteParams => ({
    id: 4,
    denominacion: 'Bebidas',
    observacion: 'Frías y calientes',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-02-01'),
    deletedAt: null,
    usuarioCreatedId: 1,
    usuarioUpdatedId: 2,
    usuarioDeletedId: null,
    sistema: 0,
    ...overrides,
  });

  describe('create()', () => {
    it('crea una superlínea nueva con auditoría inicial', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-10T12:00:00Z'));

      const superlinea = Superlinea.create({ denominacion: 'Bebidas', observacion: 'obs', usuarioCreatedId: 7 });

      expect(superlinea.getId()).toBeNull();
      expect(superlinea.getDenominacion()).toBe('Bebidas');
      expect(superlinea.getObservacion()).toBe('obs');
      expect(superlinea.getCreatedAt()).toEqual(new Date('2026-01-10T12:00:00Z'));
      expect(superlinea.getUpdatedAt()).toEqual(new Date('2026-01-10T12:00:00Z'));
      expect(superlinea.getDeletedAt()).toBeNull();
      expect(superlinea.getUsuarioCreatedId()).toBe(7);
      expect(superlinea.getUsuarioUpdatedId()).toBeNull();
      expect(superlinea.getUsuarioDeletedId()).toBeNull();
      expect(superlinea.getSistema()).toBe(0);
    });

    it('normaliza la denominación quitando espacios en los extremos', () => {
      const superlinea = Superlinea.create({ denominacion: '  Lácteos  ', observacion: null, usuarioCreatedId: 1 });
      expect(superlinea.getDenominacion()).toBe('Lácteos');
    });

    it.each(['', '    ', undefined, null, 123])('rechaza la denominación %p', (denominacion) => {
      const crear = () =>
        Superlinea.create({ denominacion: denominacion as string, observacion: null, usuarioCreatedId: 1 });
      expect(crear).toThrow(SuperlineaInvalidaError);
      expect(crear).toThrow('La denominación es obligatoria.');
    });

    it('acepta hasta 255 caracteres (medidos sin espacios extremos)', () => {
      const superlinea = Superlinea.create({
        denominacion: ` ${'a'.repeat(255)} `,
        observacion: null,
        usuarioCreatedId: 1,
      });
      expect(superlinea.getDenominacion()).toHaveLength(255);
    });

    it('rechaza más de 255 caracteres', () => {
      expect(() =>
        Superlinea.create({ denominacion: 'a'.repeat(256), observacion: null, usuarioCreatedId: 1 }),
      ).toThrow('La denominación admite hasta 255 caracteres.');
    });
  });

  describe('reconstitute()', () => {
    it('rehidrata exactamente el estado persistido', () => {
      const superlinea = Superlinea.reconstitute(
        reconstituteParams({ deletedAt: new Date('2025-03-01'), usuarioDeletedId: 3, sistema: 1 }),
      );

      expect(superlinea.getId()).toBe(4);
      expect(superlinea.getDenominacion()).toBe('Bebidas');
      expect(superlinea.getObservacion()).toBe('Frías y calientes');
      expect(superlinea.getCreatedAt()).toEqual(new Date('2025-01-01'));
      expect(superlinea.getUpdatedAt()).toEqual(new Date('2025-02-01'));
      expect(superlinea.getDeletedAt()).toEqual(new Date('2025-03-01'));
      expect(superlinea.getUsuarioCreatedId()).toBe(1);
      expect(superlinea.getUsuarioUpdatedId()).toBe(2);
      expect(superlinea.getUsuarioDeletedId()).toBe(3);
      expect(superlinea.getSistema()).toBe(1);
    });

    it('no revalida la denominación persistida', () => {
      expect(() => Superlinea.reconstitute(reconstituteParams({ denominacion: '' }))).not.toThrow();
    });
  });

  describe('actualizarDatos()', () => {
    it('actualiza denominación, observación y auditoría', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-05T05:00:00Z'));
      const superlinea = Superlinea.reconstitute(reconstituteParams());

      superlinea.actualizarDatos({ denominacion: '  Snacks ', observacion: null, usuarioUpdatedId: 9 });

      expect(superlinea.getDenominacion()).toBe('Snacks');
      expect(superlinea.getObservacion()).toBeNull();
      expect(superlinea.getUsuarioUpdatedId()).toBe(9);
      expect(superlinea.getUpdatedAt()).toEqual(new Date('2026-05-05T05:00:00Z'));
      expect(superlinea.getCreatedAt()).toEqual(new Date('2025-01-01'));
    });

    it('rechaza una denominación inválida sin modificar la entidad', () => {
      const superlinea = Superlinea.reconstitute(reconstituteParams());

      expect(() =>
        superlinea.actualizarDatos({ denominacion: '   ', observacion: 'nueva', usuarioUpdatedId: 9 }),
      ).toThrow(SuperlineaInvalidaError);

      expect(superlinea.getDenominacion()).toBe('Bebidas');
      expect(superlinea.getObservacion()).toBe('Frías y calientes');
      expect(superlinea.getUsuarioUpdatedId()).toBe(2);
    });
  });

  describe('marcarComoEliminado()', () => {
    it('registra la fecha y el usuario de la baja', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-09-01T00:00:00Z'));
      const superlinea = Superlinea.reconstitute(reconstituteParams());

      superlinea.marcarComoEliminado(11);

      expect(superlinea.getDeletedAt()).toEqual(new Date('2026-09-01T00:00:00Z'));
      expect(superlinea.getUsuarioDeletedId()).toBe(11);
    });
  });

  describe('SuperlineaInvalidaError', () => {
    it('es un Error con el mensaje recibido', () => {
      const error = new SuperlineaInvalidaError('mensaje');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('mensaje');
    });
  });
});
