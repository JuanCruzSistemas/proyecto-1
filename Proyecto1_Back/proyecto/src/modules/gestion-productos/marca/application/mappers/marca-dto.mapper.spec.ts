import { MarcaDtoMapper } from './marca-dto.mapper';
import { Marca } from '../../domain/entities/marca.entity';

describe('MarcaDtoMapper', () => {
  it('convierte una Marca a ReferenciaDto correctamente', () => {
    const marca = Marca.reconstitute({
      id: 10,
      denominacion: 'volkswagen',
      observacion: null,
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    const referenciaDto = MarcaDtoMapper.toReferenciaDto(marca);

    expect(referenciaDto).toEqual({
      id: 10,
      denominacion: 'volkswagen',
    });
  });

  it('maneja id null usando 0 como fallback', () => {
    const marca = Marca.reconstitute({
      id: null as any,
      denominacion: 'fiat',
      observacion: null,
      sistema: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    const referenciaDto = MarcaDtoMapper.toReferenciaDto(marca);

    expect(referenciaDto.id).toBe(0);
    expect(referenciaDto.denominacion).toBe('fiat');
  });

  it('mantiene la denominación tal como está en la entidad', () => {
    const marca = Marca.reconstitute({
      id: 20,
      denominacion: 'RENAULT',
      observacion: 'Test',
      sistema: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: null,
      usuarioDeletedId: null,
    });

    const referenciaDto = MarcaDtoMapper.toReferenciaDto(marca);

    expect(referenciaDto.denominacion).toBe('RENAULT');
  });
});
