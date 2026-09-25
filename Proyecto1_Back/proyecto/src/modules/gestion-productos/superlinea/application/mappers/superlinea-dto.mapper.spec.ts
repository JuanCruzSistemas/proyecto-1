import { SuperlineaDtoMapper } from './superlinea-dto.mapper';
import { Superlinea } from '../../domain/entities/superlinea.entity';

describe('SuperlineaDtoMapper', () => {
  it('expone solo los campos públicos de la superlínea', () => {
    const entity = Superlinea.reconstitute({
      id: 3,
      denominacion: 'Bebidas',
      observacion: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      deletedAt: null,
      usuarioCreatedId: 1,
      usuarioUpdatedId: 2,
      usuarioDeletedId: null,
      sistema: 1,
    });

    expect(SuperlineaDtoMapper.toDto(entity)).toEqual({
      id: 3,
      denominacion: 'Bebidas',
      observacion: null,
      sistema: 1,
    });
  });
});
