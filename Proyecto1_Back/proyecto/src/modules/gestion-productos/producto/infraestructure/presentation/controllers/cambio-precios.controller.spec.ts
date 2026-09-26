import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request = require('supertest');
import { App } from 'supertest/types';
import { CambioPreciosController } from './cambio-precios.controller';
import { AplicarCambioMasivoUseCase } from '../../../application/use-cases/aplicar-cambio-masivo.use-case';
import { GuardarCambioMasivoUseCase } from '../../../application/use-cases/guardar-cambio-masivo.use-case';

describe('CambioPreciosController (HTTP)', () => {
  let app: INestApplication<App>;

  const aplicar = { execute: jest.fn() };
  const guardar = { execute: jest.fn() };
  const jwtService = { verify: jest.fn() };
  const usuarioRepository = { findOneWithRoles: jest.fn() };
  const comoRol = (rol: string) => {
    jwtService.verify.mockReturnValue({ sub: 1 });
    usuarioRepository.findOneWithRoles.mockResolvedValue({ id: 1, roles: [{ denominacion: rol }] });
  };
  const http = () => request(app.getHttpServer());
  const auth = { Authorization: 'Bearer token' };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [CambioPreciosController],
      providers: [
        { provide: AplicarCambioMasivoUseCase, useValue: aplicar },
        { provide: GuardarCambioMasivoUseCase, useValue: guardar },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: 'IUsuarioRepository', useValue: usuarioRepository },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    comoRol('Empleado');
  });

  describe('PATCH /cambio-precios/aplicar-cambios', () => {
    const simulacion = { items: [{ id: 1, costo: 100 }], valor: 15, tipoActualizacion: 'PORCENTAJE' };

    it('devuelve la simulación de precios calculada por el caso de uso', async () => {
      aplicar.execute.mockResolvedValue([{ id: 1, precioNuevo: 115 }]);

      const res = await http().patch('/cambio-precios/aplicar-cambios').set(auth).send(simulacion).expect(200);

      expect(res.body).toEqual([{ id: 1, precioNuevo: 115 }]);
      expect(aplicar.execute).toHaveBeenCalledWith(expect.objectContaining(simulacion));
    });

    it('rechaza un tipo de actualización inválido o un porcentaje negativo (400)', async () => {
      await http().patch('/cambio-precios/aplicar-cambios').set(auth).send({ ...simulacion, tipoActualizacion: 'OTRO' }).expect(400);

      const res = await http().patch('/cambio-precios/aplicar-cambios').set(auth).send({ ...simulacion, valor: -5 }).expect(400);
      expect(res.body.message).toContain('El porcentaje no puede ser negativo');
      expect(aplicar.execute).not.toHaveBeenCalled();
    });

    it('admite un monto negativo', async () => {
      aplicar.execute.mockResolvedValue([]);

      await http().patch('/cambio-precios/aplicar-cambios').set(auth).send({ ...simulacion, tipoActualizacion: 'MONTO', valor: -5 }).expect(200);
    });
  });

  describe('PATCH /cambio-precios/guardar-cambios', () => {
    it('guarda los ítems con el usuario y responde el mensaje estándar', async () => {
      guardar.execute.mockResolvedValue(undefined);
      const items = [{ id: 1, precioNuevo: 115 }];

      const res = await http().patch('/cambio-precios/guardar-cambios').set(auth).send({ items, usuarioCreatedId: 4 }).expect(200);

      expect(guardar.execute).toHaveBeenCalledWith(items, 4);
      expect(res.body).toEqual({ mensaje: ' La actualización de precios masiva se realizo : los productos seleccionados' });
    });
  });

  describe('roles', () => {
    it('sin token responde 401 y un Vendedor recibe 403', async () => {
      await http().patch('/cambio-precios/guardar-cambios').send({ items: [] }).expect(401);

      comoRol('Vendedor');
      await http().patch('/cambio-precios/guardar-cambios').set(auth).send({ items: [] }).expect(403);
      expect(guardar.execute).not.toHaveBeenCalled();
    });
  });
});
