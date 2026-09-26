import { PresentacionDtoMapper } from './presentacion-dto.mapper';
import { Presentacion } from '../../domain/entities/presentacion.entity';

describe('PresentacionDtoMapper', () => {
  describe('toResponseDto', () => {
    it('convierte una Presentacion a PresentacionDto correctamente', () => {
      const presentacion = Presentacion.reconstitute({
        id: 10,
        denominacion: 'caja x 12',
        observacion: 'Presentación estándar',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const dto = PresentacionDtoMapper.toResponseDto(presentacion);

      expect(dto).toEqual({
        id: 10,
        denominacion: 'caja x 12',
        observacion: 'Presentación estándar',
        deletedAt: null,
      });
    });

    it('convierte deletedAt a ISO string cuando existe', () => {
      const deletedDate = new Date('2024-01-01');
      const presentacion = Presentacion.reconstitute({
        id: 5,
        denominacion: 'botella',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: deletedDate,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: 1,
      });

      const dto = PresentacionDtoMapper.toResponseDto(presentacion);

      expect(dto.deletedAt).toBe(deletedDate.toISOString());
    });

    it('usa string vacío para observacion null', () => {
      const presentacion = Presentacion.reconstitute({
        id: 3,
        denominacion: 'sobre',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const dto = PresentacionDtoMapper.toResponseDto(presentacion);

      expect(dto.observacion).toBe('');
    });

    it('usa 0 para id null', () => {
      const presentacion = Presentacion.reconstitute({
        id: null as any,
        denominacion: 'test',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const dto = PresentacionDtoMapper.toResponseDto(presentacion);

      expect(dto.id).toBe(0);
    });
  });

  describe('toReferenciaDto', () => {
    it('convierte una Presentacion a ReferenciaDto correctamente', () => {
      const presentacion = Presentacion.reconstitute({
        id: 10,
        denominacion: 'lata',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const referenciaDto = PresentacionDtoMapper.toReferenciaDto(presentacion);

      expect(referenciaDto).toEqual({
        id: 10,
        denominacion: 'lata',
      });
    });

    it('maneja id null usando 0 como fallback', () => {
      const presentacion = Presentacion.reconstitute({
        id: null as any,
        denominacion: 'paquete',
        observacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        usuarioCreatedId: 1,
        usuarioUpdatedId: null,
        usuarioDeletedId: null,
      });

      const referenciaDto = PresentacionDtoMapper.toReferenciaDto(presentacion);

      expect(referenciaDto.id).toBe(0);
      expect(referenciaDto.denominacion).toBe('paquete');
    });
  });
});
