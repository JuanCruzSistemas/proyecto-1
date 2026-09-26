import { PresentacionEntity } from './presentacion.orm-entity';

describe('PresentacionEntity', () => {
  it('crea una instancia de PresentacionEntity', () => {
    const entity = new PresentacionEntity();

    expect(entity).toBeInstanceOf(PresentacionEntity);
  });

  it('permite asignar propiedades básicas', () => {
    const entity = new PresentacionEntity();
    entity.id = 1;
    entity.denominacion = 'caja x 12';
    entity.observacion = 'Test';

    expect(entity.id).toBe(1);
    expect(entity.denominacion).toBe('caja x 12');
    expect(entity.observacion).toBe('Test');
  });

  it('permite asignar campos de auditoría', () => {
    const entity = new PresentacionEntity();
    const now = new Date();
    entity.createdAt = now;
    entity.updatedAt = now;
    entity.usuarioCreatedId = 1;
    entity.usuarioUpdatedId = 2;

    expect(entity.createdAt).toBe(now);
    expect(entity.updatedAt).toBe(now);
    expect(entity.usuarioCreatedId).toBe(1);
    expect(entity.usuarioUpdatedId).toBe(2);
  });

  it('permite asignar deletedAt', () => {
    const entity = new PresentacionEntity();
    const deletedDate = new Date();
    entity.deletedAt = deletedDate;
    entity.usuarioDeletedId = 3;

    expect(entity.deletedAt).toBe(deletedDate);
    expect(entity.usuarioDeletedId).toBe(3);
  });

  it('observacion puede ser opcional', () => {
    const entity = new PresentacionEntity();
    entity.denominacion = 'botella';

    expect(entity.observacion).toBeUndefined();
  });
});
