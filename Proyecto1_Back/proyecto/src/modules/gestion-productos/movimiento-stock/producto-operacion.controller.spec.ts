import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { App } from 'supertest/types';
import { ProductoOperacionController } from './producto-operacion.controller';
import { ProductoOperacionService } from './producto-operacion.service';

// Controller scaffold de Nest CLI, registrado en AppModule y SIN AuthGuard (ver INFORME.md).
describe('ProductoOperacionController (HTTP)', () => {
  let app: INestApplication<App>;
  const service = {
    create: jest.fn(() => 'creado'),
    findAll: jest.fn(() => 'todos'),
    findOne: jest.fn((id: number) => `uno ${id}`),
    update: jest.fn((id: number) => `actualizado ${id}`),
    remove: jest.fn((id: number) => `eliminado ${id}`),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductoOperacionController],
      providers: [{ provide: ProductoOperacionService, useValue: service }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('POST /producto-operacion delega en create() (sin token)', async () => {
    const res = await request(app.getHttpServer()).post('/producto-operacion').send({}).expect(201);

    expect(res.text).toBe('creado');
    expect(service.create).toHaveBeenCalled();
  });

  it('GET /producto-operacion delega en findAll()', async () => {
    const res = await request(app.getHttpServer()).get('/producto-operacion').expect(200);
    expect(res.text).toBe('todos');
  });

  it('GET, PATCH y DELETE /:id convierten el id a número', async () => {
    await request(app.getHttpServer()).get('/producto-operacion/7').expect(200);
    await request(app.getHttpServer()).patch('/producto-operacion/8').send({}).expect(200);
    await request(app.getHttpServer()).delete('/producto-operacion/9').expect(200);

    expect(service.findOne).toHaveBeenCalledWith(7);
    expect(service.update).toHaveBeenCalledWith(8, {});
    expect(service.remove).toHaveBeenCalledWith(9);
  });

  it('el DTO vacío rechaza cualquier propiedad en el body (400)', async () => {
    await request(app.getHttpServer()).post('/producto-operacion').send({ productoId: 1 }).expect(400);
    expect(service.create).not.toHaveBeenCalled();
  });
});
