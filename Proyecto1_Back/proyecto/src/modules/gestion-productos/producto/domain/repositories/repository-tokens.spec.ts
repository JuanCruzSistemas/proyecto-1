import { Test } from '@nestjs/testing';
import { Inject, Injectable } from '@nestjs/common';
import {
  HISTORIAL_PRECIO_REPOSITORY_TOKEN,
  IHistorialPrecioRepository,
} from './historial-precio.repository.interface';
import { IProductoRepository, PRODUCTO_REPOSITORY_TOKEN } from './producto.repository.interface';

@Injectable()
class ConsumidorDeRepositorios {
  constructor(
    @Inject(PRODUCTO_REPOSITORY_TOKEN) readonly productos: IProductoRepository,
    @Inject(HISTORIAL_PRECIO_REPOSITORY_TOKEN) readonly historial: IHistorialPrecioRepository,
  ) {}
}

describe('Tokens de repositorios de Producto', () => {
  it('tienen los nombres con los que se registran en el módulo', () => {
    expect(PRODUCTO_REPOSITORY_TOKEN).toBe('IProductoRepository');
    expect(HISTORIAL_PRECIO_REPOSITORY_TOKEN).toBe('IHistorialPrecioRepository');
  });

  it('permiten inyectar implementaciones distintas para cada repositorio', async () => {
    const productos = { findOne: jest.fn() } as unknown as IProductoRepository;
    const historial = { findByProductoId: jest.fn() } as unknown as IHistorialPrecioRepository;

    const module = await Test.createTestingModule({
      providers: [
        ConsumidorDeRepositorios,
        { provide: PRODUCTO_REPOSITORY_TOKEN, useValue: productos },
        { provide: HISTORIAL_PRECIO_REPOSITORY_TOKEN, useValue: historial },
      ],
    }).compile();

    const consumidor = module.get(ConsumidorDeRepositorios);
    expect(consumidor.productos).toBe(productos);
    expect(consumidor.historial).toBe(historial);
  });
});
