import { MarcaEntity } from './marca.orm-entity';

describe('MarcaEntity', () => {
  it('crea una instancia de MarcaEntity', () => {
    const marcaEntity = new MarcaEntity();

    expect(marcaEntity).toBeInstanceOf(MarcaEntity);
  });

  it('permite asignar propiedades básicas', () => {
    const marcaEntity = new MarcaEntity();
    marcaEntity.id = 1;
    marcaEntity.denominacion = 'toyota';
    marcaEntity.observacion = 'Test';
    marcaEntity.sistema = 0;

    expect(marcaEntity.id).toBe(1);
    expect(marcaEntity.denominacion).toBe('toyota');
    expect(marcaEntity.observacion).toBe('Test');
    expect(marcaEntity.sistema).toBe(0);
  });

  it('permite asignar campos de auditoría', () => {
    const marcaEntity = new MarcaEntity();
    const now = new Date();
    marcaEntity.createdAt = now;
    marcaEntity.updatedAt = now;
    marcaEntity.usuarioCreatedId = 1;
    marcaEntity.usuarioUpdatedId = 2;

    expect(marcaEntity.createdAt).toBe(now);
    expect(marcaEntity.updatedAt).toBe(now);
    expect(marcaEntity.usuarioCreatedId).toBe(1);
    expect(marcaEntity.usuarioUpdatedId).toBe(2);
  });

  it('permite asignar deletedAt', () => {
    const marcaEntity = new MarcaEntity();
    const deletedDate = new Date();
    marcaEntity.deletedAt = deletedDate;
    marcaEntity.usuarioDeletedId = 3;

    expect(marcaEntity.deletedAt).toBe(deletedDate);
    expect(marcaEntity.usuarioDeletedId).toBe(3);
  });

  it('observacion puede ser opcional', () => {
    const marcaEntity = new MarcaEntity();
    marcaEntity.denominacion = 'honda';

    expect(marcaEntity.observacion).toBeUndefined();
  });
});
