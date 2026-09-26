import { NotFoundException } from '@nestjs/common';
import { FindByIdConAuditoria } from './find-by-id-auditoria.use-case';
import { crearProducto, crearUsuario } from '../../testing/producto.fixtures-spec';

describe('FindByIdConAuditoria', () => {
  const repository = { findByIdConAuditoria: jest.fn() };
  const useCase = new FindByIdConAuditoria(repository as any);

  beforeEach(() => jest.clearAllMocks());

  it('devuelve los datos de auditoría del producto', async () => {
    repository.findByIdConAuditoria.mockResolvedValue(
      crearProducto({
        usuarioCreated: crearUsuario(1, 'Creador'),
        usuarioUpdated: crearUsuario(2, 'Editor'),
        updatedAt: new Date('2026-02-01T12:00:00Z'),
      }),
    );

    const dto = await useCase.execute(100);

    expect(repository.findByIdConAuditoria).toHaveBeenCalledWith(100);
    expect(dto).toMatchObject({
      id: 100,
      detalle: 'Producto NATURA ACEITES 1L',
      usuarioCreated: 'Creador',
      usuarioUpdated: 'Editor',
      usuarioDeleted: '',
      deletedAt: '',
    });
    expect(dto.createdAt).not.toBe('');
    expect(dto.updatedAt).not.toBe('');
  });

  it('lanza NotFound si no existe', async () => {
    repository.findByIdConAuditoria.mockResolvedValue(null);

    await expect(useCase.execute(9)).rejects.toThrow(new NotFoundException('Producto con ID 9 no encontrado.'));
  });
});
