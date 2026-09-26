import { ConflictException, ForbiddenException, INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request = require('supertest');
import { App } from 'supertest/types';
import { SuperlineaController } from './superlinea.controller';
import { SuperlineaService } from '../../../application/services/superlinea.service';
import { SuperlineaInvalidaError } from '../../../domain/entities/superlinea-invalida.error';

describe('SuperlineaController (HTTP)', () => {
  let app: INestApplication<App>;

  const service = {
    list: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Se usa el AuthGuard real: el token se "verifica" con este mock y el usuario sale del repositorio mockeado.
  const jwtService = { verify: jest.fn() };
  const usuarioRepository = { findOneWithRoles: jest.fn() };
  const configService = { get: jest.fn().mockReturnValue('secret') };

  const comoRol = (rol: string, id = 42) => {
    jwtService.verify.mockReturnValue({ sub: id });
    usuarioRepository.findOneWithRoles.mockResolvedValue({ id, roles: [{ denominacion: rol }] });
  };
  const auth = { Authorization: 'Bearer token-de-prueba' };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SuperlineaController],
      providers: [
        { provide: SuperlineaService, useValue: service },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: 'IUsuarioRepository', useValue: usuarioRepository },
      ],
    }).compile();

    app = module.createNestApplication();
    // Misma configuración global que main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined); // el guard loguea en cada request
    comoRol('Administrador');
  });

  describe('autenticación y roles', () => {
    it('sin token responde 401', async () => {
      const res = await request(app.getHttpServer()).get('/superlinea');

      expect(res.status).toBe(401);
      expect(service.list).not.toHaveBeenCalled();
    });

    it('con token inválido responde 401', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      const res = await request(app.getHttpServer()).get('/superlinea').set(auth);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token inválido');
    });

    it('un Empleado puede consultar', async () => {
      comoRol('Empleado');
      service.list.mockResolvedValue([]);

      await request(app.getHttpServer()).get('/superlinea').set(auth).expect(200);
    });

    it.each([
      ['post', '/superlinea'],
      ['put', '/superlinea/1'],
      ['delete', '/superlinea/1'],
    ] as const)('un Empleado no puede hacer %s %s (403)', async (metodo, url) => {
      comoRol('Empleado');

      const res = await request(app.getHttpServer())[metodo](url).set(auth).send({ denominacion: 'X' });

      expect(res.status).toBe(403);
      expect(service.create).not.toHaveBeenCalled();
      expect(service.update).not.toHaveBeenCalled();
      expect(service.remove).not.toHaveBeenCalled();
    });

    it('Root puede crear', async () => {
      comoRol('Root');
      service.create.mockResolvedValue({ id: 1 });

      await request(app.getHttpServer()).post('/superlinea').set(auth).send({ denominacion: 'X' }).expect(201);
    });
  });

  describe('GET /superlinea', () => {
    it('devuelve el listado del servicio', async () => {
      const lista = [{ id: 1, denominacion: 'Bebidas', observacion: null, sistema: 0 }];
      service.list.mockResolvedValue(lista);

      const res = await request(app.getHttpServer()).get('/superlinea').set(auth).expect(200);

      expect(res.body).toEqual(lista);
    });
  });

  describe('GET /superlinea/:id', () => {
    it('convierte el id a número y devuelve la superlínea', async () => {
      service.findOne.mockResolvedValue({ id: 7, denominacion: 'Snacks', observacion: null, sistema: 0 });

      const res = await request(app.getHttpServer()).get('/superlinea/7').set(auth).expect(200);

      expect(service.findOne).toHaveBeenCalledWith(7);
      expect(res.body.denominacion).toBe('Snacks');
    });

    it('rechaza un id no numérico con 400', async () => {
      await request(app.getHttpServer()).get('/superlinea/abc').set(auth).expect(400);
      expect(service.findOne).not.toHaveBeenCalled();
    });

    it('propaga el 404 del servicio', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('SuperLínea no encontrada.'));

      const res = await request(app.getHttpServer()).get('/superlinea/7').set(auth).expect(404);

      expect(res.body.message).toBe('SuperLínea no encontrada.');
    });
  });

  describe('POST /superlinea', () => {
    it('crea con el dto recortado y el id del usuario autenticado', async () => {
      service.create.mockResolvedValue({ id: 1, denominacion: 'Bebidas', observacion: null, sistema: 0 });

      const res = await request(app.getHttpServer())
        .post('/superlinea')
        .set(auth)
        .send({ denominacion: '  Bebidas  ', observacion: null })
        .expect(201);

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ denominacion: 'Bebidas', observacion: null }),
        42,
      );
      expect(res.body.id).toBe(1);
    });

    it('rechaza una denominación vacía con 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/superlinea')
        .set(auth)
        .send({ denominacion: '   ' })
        .expect(400);

      expect(res.body.message).toContain('La denominación es obligatoria.');
      expect(service.create).not.toHaveBeenCalled();
    });

    it('rechaza propiedades no permitidas con 400', async () => {
      await request(app.getHttpServer())
        .post('/superlinea')
        .set(auth)
        .send({ denominacion: 'Bebidas', sistema: 1 })
        .expect(400);

      expect(service.create).not.toHaveBeenCalled();
    });

    it('traduce el error de dominio a 400 mediante el filtro', async () => {
      service.create.mockRejectedValue(new SuperlineaInvalidaError('La denominación admite hasta 255 caracteres.'));

      const res = await request(app.getHttpServer()).post('/superlinea').set(auth).send({ denominacion: 'X' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ statusCode: 400, message: 'La denominación admite hasta 255 caracteres.' });
    });
  });

  describe('PUT /superlinea/:id', () => {
    it('actualiza con id numérico, dto y usuario', async () => {
      service.update.mockResolvedValue({ id: 3, denominacion: 'Lácteos', observacion: 'x', sistema: 0 });

      await request(app.getHttpServer())
        .put('/superlinea/3')
        .set(auth)
        .send({ denominacion: 'Lácteos', observacion: 'x' })
        .expect(200);

      expect(service.update).toHaveBeenCalledWith(3, expect.objectContaining({ denominacion: 'Lácteos', observacion: 'x' }), 42);
    });

    it('propaga el 403 al intentar modificar una del sistema', async () => {
      service.update.mockRejectedValue(new ForbiddenException('SuperLínea marcado como del sistema'));

      await request(app.getHttpServer()).put('/superlinea/3').set(auth).send({ denominacion: 'X' }).expect(403);
    });
  });

  describe('DELETE /superlinea/:id', () => {
    it('da de baja con el usuario autenticado', async () => {
      service.remove.mockResolvedValue({ mensaje: 'SuperLínea dada de baja.' });

      const res = await request(app.getHttpServer()).delete('/superlinea/3').set(auth).expect(200);

      expect(service.remove).toHaveBeenCalledWith(3, 42);
      expect(res.body).toEqual({ mensaje: 'SuperLínea dada de baja.' });
    });

    it('propaga el 409 cuando tiene líneas activas', async () => {
      service.remove.mockRejectedValue(new ConflictException('No se puede eliminar: tiene líneas activas asociadas.'));

      const res = await request(app.getHttpServer()).delete('/superlinea/3').set(auth).expect(409);

      expect(res.body.message).toBe('No se puede eliminar: tiene líneas activas asociadas.');
    });
  });
});
