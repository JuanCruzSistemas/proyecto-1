import { IProductoRepository } from '../../domain/repositories/producto.repository.interface';
import { TipoActualizacion } from '../dto/aplicar-cambios-masivos.dto';
import { AplicarCambioMasivoUseCase } from './aplicar-cambio-masivo.use-case';

describe('AplicarCambioMasivoUseCase', () => {
  const crearProducto = (id: number, costo: number, margen: number) => ({
    getId: () => id,
    getCosto: () => costo,
    getMargen: () => margen,
    getPrecio: () => costo * (1 + margen),
  });

  const crearFixture = (productos: ReturnType<typeof crearProducto>[]) => {
    const repository = {
      findByIds: jest.fn().mockResolvedValue(productos),
    } as unknown as jest.Mocked<IProductoRepository>;
    return { useCase: new AplicarCambioMasivoUseCase(repository), repository };
  };

  it('reemplaza el margen actual por el margen ingresado', async () => {
    const { useCase } = crearFixture([crearProducto(1, 6000, 0.3)]);

    const [resultado] = await useCase.execute({
      items: [{ id: 1 }],
      valor: 40,
      tipoActualizacion: TipoActualizacion.PORCENTAJE,
    });

    // 40% pisa al 30%: 6000 * 1.40.
    expect(resultado.precioNuevo).toBe(8400);
  });

  it('permite un margen menor al actual', async () => {
    const { useCase } = crearFixture([crearProducto(1, 6000, 0.3)]);

    const [resultado] = await useCase.execute({
      items: [{ id: 1 }],
      valor: 10,
      tipoActualizacion: TipoActualizacion.PORCENTAJE,
    });

    expect(resultado.precioNuevo).toBe(6600);
  });

  it('suma el monto fijo al precio actual', async () => {
    const { useCase } = crearFixture([crearProducto(1, 6000, 0.3)]);

    const [resultado] = await useCase.execute({
      items: [{ id: 1 }],
      valor: -500,
      tipoActualizacion: TipoActualizacion.MONTO,
    });

    expect(resultado.precioNuevo).toBe(7300);
  });

  it('rechaza un margen resultante mayor a 100%', async () => {
    const { useCase } = crearFixture([crearProducto(1, 6000, 0.3)]);

    await expect(
      useCase.execute({
        items: [{ id: 1 }],
        valor: 101,
        tipoActualizacion: TipoActualizacion.PORCENTAJE,
      }),
    ).rejects.toThrow('no es compatible');
  });

  it('rechaza productos inexistentes', async () => {
    const { useCase } = crearFixture([]);

    await expect(
      useCase.execute({
        items: [{ id: 99 }],
        valor: 10,
        tipoActualizacion: TipoActualizacion.PORCENTAJE,
      }),
    ).rejects.toThrow('no encontrado');
  });
});
