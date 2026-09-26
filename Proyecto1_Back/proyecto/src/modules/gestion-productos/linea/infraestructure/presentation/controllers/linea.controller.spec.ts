import { LineaController } from './linea.controller';

describe('LineaController', () => {
  const service = {
    create: jest.fn(), update: jest.fn(), remove: jest.fn(),
    findDtoById: jest.fn(), findByDenominacionFiltered: jest.fn(), findByIdConAuditoria: jest.fn(),
  };
  const controller = new LineaController(service as any);

  beforeEach(() => jest.clearAllMocks());

  it('crea una Línea delegando el DTO al servicio', async () => {
    const dto = { denominacion: 'BEBIDAS', superlineaId: 1 } as any;
    service.create.mockResolvedValue({ mensaje: 'ok' });
    await expect(controller.create(dto)).resolves.toEqual({ mensaje: 'ok' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('transmite filtros y paginación de la búsqueda', async () => {
    service.findByDenominacionFiltered.mockResolvedValue({ data: [], total: 0 });
    await controller.findByDenominacionFiltered({ denominacion: 'beb', skip: 10, take: 5, incluirEliminados: true } as any);
    expect(service.findByDenominacionFiltered).toHaveBeenCalledWith('beb', 10, 5, true);
  });

  it('consulta, actualiza, elimina y devuelve auditoría por ID', async () => {
    const dto = { usuarioUpdatedId: 2, utilizaStockMinimo: false } as any;
    await controller.findOne(4);
    await controller.update(4, dto);
    await controller.remove(4, 2);
    await controller.findByIdConAuditoria(4);
    expect(service.findDtoById).toHaveBeenCalledWith(4);
    expect(service.update).toHaveBeenCalledWith(4, dto);
    expect(service.remove).toHaveBeenCalledWith(4, 2);
    expect(service.findByIdConAuditoria).toHaveBeenCalledWith(4);
  });
});
