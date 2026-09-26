import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request = require('supertest');
import { App } from 'supertest/types';
import { ProductoController } from './producto.controller';
import { ProductoService } from '../../../application/services/producto.service';
import { UpdatePrecioUseCase } from '../../../application/use-cases/update-precio.use-case';
import { FindHistorialPrecioUseCase } from '../../../application/use-cases/find-historial-precio.use-case';

describe('ProductoController (HTTP)', () => {
  let app: INestApplication<App>;

  const service = {
    create: jest.fn(),
    findAllForMarcas: jest.fn(),
    findAllForPresentaciones: jest.fn(),
    findAllForLineas: jest.fn(),
    findByRapido: jest.fn(),
    findBy: jest.fn(),
    buscarMarcaDesdeProducto: jest.fn(),
    buscarLineaDesdeProducto: jest.fn(),
    findDtoById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByIdConAuditoria: jest.fn(),
  };
  const updatePrecioUseCase = { execute: jest.fn() };
  const findHistorialPrecioUseCase = { execute: jest.fn() };

  // AuthGuard real: se mockea solo la verificación del token y la búsqueda del usuario.
  const jwtService = { verify: jest.fn() };
  const usuarioRepository = { findOneWithRoles: jest.fn() };
  const comoRol = (rol: string) => {
    jwtService.verify.mockReturnValue({ sub: 1 });
    usuarioRepository.findOneWithRoles.mockResolvedValue({ id: 1, roles: [{ denominacion: rol }] });
  };
  const http = () => request(app.getHttpServer());
  const auth = { Authorization: 'Bearer token' };

  const altaValida = {
    marcaId: 20,
    lineaId: 10,
    presentacionId: 30,
    costo: 100,
    porcentaje: 30,
    utilizaStockMinimo: false,
    utilizaPack: false,
    usuarioCreatedId: 1,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        { provide: ProductoService, useValue: service },
        { provide: UpdatePrecioUseCase, useValue: updatePrecioUseCase },
        { provide: FindHistorialPrecioUseCase, useValue: findHistorialPrecioUseCase },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: 'IUsuarioRepository', useValue: usuarioRepository },
      ],
    }).compile();

    app = module.createNestApplication();
    // Misma configuración que main.ts
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined); // el AuthGuard loguea cada request
    comoRol('Administrador');
  });

  describe('autenticación y roles', () => {
    it('sin token responde 401', async () => {
      await http().get('/producto/1').expect(401);
      expect(service.findDtoById).not.toHaveBeenCalled();
    });

    it('un Repositor puede crear productos', async () => {
      comoRol('Repositor');
      service.create.mockResolvedValue({ mensaje: 'ok' });

      await http().post('/producto').set(auth).send(altaValida).expect(201);
    });

    it('un Vendedor puede usar los selectores pero no ver el detalle (403)', async () => {
      comoRol('Vendedor');
      service.findAllForMarcas.mockResolvedValue({ data: [], total: 0 });

      await http().get('/producto/find-all-for-marcas/select?denominacion=').set(auth).expect(200);
      await http().get('/producto/1').set(auth).expect(403);
    });

    it('un Repositor no puede editar ni eliminar (403)', async () => {
      comoRol('Repositor');

      await http().put('/producto/1').set(auth).send({ usuarioUpdatedId: 1 }).expect(403);
      await http().delete('/producto/1?usuarioId=1').set(auth).expect(403);
      expect(service.update).not.toHaveBeenCalled();
      expect(service.remove).not.toHaveBeenCalled();
    });
  });

  describe('POST /producto', () => {
    it('normaliza denominación (MAYÚSCULAS) y código de proveedor (minúsculas) antes de crear', async () => {
      service.create.mockResolvedValue({ mensaje: 'Producto creada' });

      const res = await http()
        .post('/producto')
        .set(auth)
        .send({ ...altaValida, denominacion: '  Aceite Especial  ', codigoProveedor: '  NAT-01 ' })
        .expect(201);

      expect(res.body).toEqual({ mensaje: 'Producto creada' });
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({ denominacion: 'ACEITE ESPECIAL', codigoProveedor: 'nat-01', marcaId: 20 }),
      );
    });

    it('rechaza un alta sin marca ni línea (400)', async () => {
      const res = await http().post('/producto').set(auth).send({ ...altaValida, marcaId: undefined, lineaId: undefined }).expect(400);

      expect(res.body.message).toEqual(expect.arrayContaining(['La marca es obligatoria.', 'La linea es obligatoria.']));
      expect(service.create).not.toHaveBeenCalled();
    });

    it('rechaza costo no positivo y campos no permitidos (400)', async () => {
      await http().post('/producto').set(auth).send({ ...altaValida, costo: 0 }).expect(400);
      await http().post('/producto').set(auth).send({ ...altaValida, sistema: 1 }).expect(400);
      expect(service.create).not.toHaveBeenCalled();
    });

    it('rechaza un código de proveedor que no es texto (400)', async () => {
      await http().post('/producto').set(auth).send({ ...altaValida, codigoProveedor: 123 }).expect(400);
    });
  });

  describe('selectores', () => {
    it.each([
      ['marcas', 'findAllForMarcas'],
      ['presentaciones', 'findAllForPresentaciones'],
      ['lineas', 'findAllForLineas'],
    ] as const)('GET find-all-for-%s/select normaliza el texto a MAYÚSCULAS', async (ruta, metodo) => {
      service[metodo].mockResolvedValue({ data: [{ id: 1 }], total: 1 });

      const res = await http().get(`/producto/find-all-for-${ruta}/select?denominacion= ace `).set(auth).expect(200);

      expect(res.body).toEqual({ data: [{ id: 1 }], total: 1 });
      expect(service[metodo]).toHaveBeenCalledWith('ACE');
    });

    it('con denominación vacía busca todo', async () => {
      service.findAllForLineas.mockResolvedValue({ data: [], total: 0 });

      await http().get('/producto/find-all-for-lineas/select?denominacion=').set(auth).expect(200);

      expect(service.findAllForLineas).toHaveBeenCalledWith('');
    });
  });

  describe('búsquedas', () => {
    it('GET search-by-rapido convierte los parámetros de la query', async () => {
      service.findByRapido.mockResolvedValue({ data: [], total: 0 });

      await http().get('/producto/search-by-rapido?codigo=NAT&exacto=true&skip=5&take=20').set(auth).expect(200);

      expect(service.findByRapido).toHaveBeenCalledWith('NAT', true, 5, 20);
    });

    it('GET search-by pasa todos los filtros al servicio', async () => {
      service.findBy.mockResolvedValue({ data: [], total: 0 });

      await http()
        .get('/producto/search-by?denominacion=ace&codigoProveedor=P1&codProveedorExacto=true&codigoReferencia=R&marcaId=2&lineaId=3&proveedorId=4&conStock=true&skip=0&take=10&lineaDenominacion=lin&superlineaDenominacion=sup')
        .set(auth)
        .expect(200);

      expect(service.findBy).toHaveBeenCalledWith('ACE', 'P1', true, 'R', 2, 3, 4, true, 0, 10, 'lin', 'sup');
    });

    it('GET search-by sin filtros usa los valores por defecto', async () => {
      service.findBy.mockResolvedValue({ data: [], total: 0 });

      await http().get('/producto/search-by').set(auth).expect(200);

      expect(service.findBy).toHaveBeenCalledWith('', undefined, false, undefined, undefined, undefined, undefined, undefined, 0, 10, undefined, undefined);
    });

    it('GET search-by rechaza take=0 (400)', async () => {
      await http().get('/producto/search-by?take=0').set(auth).expect(400);
    });
  });

  describe('GET /producto/:id y relacionados', () => {
    it('devuelve el detalle del producto', async () => {
      service.findDtoById.mockResolvedValue({ id: 7, denominacion: 'X' });

      const res = await http().get('/producto/7').set(auth).expect(200);

      expect(res.body).toEqual({ id: 7, denominacion: 'X' });
      expect(service.findDtoById).toHaveBeenCalledWith(7);
    });

    it('rechaza un id no numérico (400) y propaga el 404', async () => {
      await http().get('/producto/abc').set(auth).expect(400);

      service.findDtoById.mockRejectedValue(new NotFoundException('Producto con ID 7 no encontrado.'));
      await http().get('/producto/7').set(auth).expect(404);
    });

    it('GET marca/:id y linea/:id consultan la marca y línea', async () => {
      service.buscarMarcaDesdeProducto.mockResolvedValue({ id: 20 });
      service.buscarLineaDesdeProducto.mockResolvedValue({ id: 10 });

      await http().get('/producto/marca/20').set(auth).expect(200);
      await http().get('/producto/linea/10').set(auth).expect(200);

      expect(service.buscarMarcaDesdeProducto).toHaveBeenCalledWith(20);
      expect(service.buscarLineaDesdeProducto).toHaveBeenCalledWith(10);
    });

    it('GET :id/audit devuelve la auditoría', async () => {
      service.findByIdConAuditoria.mockResolvedValue({ id: 7, detalle: 'Producto X' });

      const res = await http().get('/producto/7/audit').set(auth).expect(200);

      expect(res.body.detalle).toBe('Producto X');
    });

    it('GET :id/historial-precio devuelve el historial', async () => {
      findHistorialPrecioUseCase.execute.mockResolvedValue([{ id: 1, precioNuevo: 150 }]);

      const res = await http().get('/producto/7/historial-precio').set(auth).expect(200);

      expect(res.body).toEqual([{ id: 1, precioNuevo: 150 }]);
      expect(findHistorialPrecioUseCase.execute).toHaveBeenCalledWith(7);
    });
  });

  describe('PUT /producto/:id', () => {
    it('actualiza con la denominación normalizada', async () => {
      service.update.mockResolvedValue({ mensaje: 'editada' });

      await http().put('/producto/7').set(auth).send({ denominacion: 'nuevo nombre', costo: 150, usuarioUpdatedId: 2 }).expect(200);

      expect(service.update).toHaveBeenCalledWith(7, expect.objectContaining({ denominacion: 'NUEVO NOMBRE', costo: 150, usuarioUpdatedId: 2 }));
    });

    it('exige usuarioUpdatedId (400)', async () => {
      await http().put('/producto/7').set(auth).send({ costo: 150 }).expect(400);
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /producto/:id', () => {
    it('da de baja con el usuario de la query', async () => {
      service.remove.mockResolvedValue({ mensaje: 'eliminada' });

      await http().delete('/producto/7?usuarioId=3').set(auth).expect(200);

      expect(service.remove).toHaveBeenCalledWith(7, 3);
    });

    it('sin usuarioId responde 400', async () => {
      await http().delete('/producto/7').set(auth).expect(400);
      expect(service.remove).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /producto/:id/precio', () => {
    const cambio = { costo: 120, porcentaje: 25, usuarioId: 1, motivo: 'Lista nueva' };

    it('actualiza el precio con historial', async () => {
      updatePrecioUseCase.execute.mockResolvedValue(undefined);

      await http().patch('/producto/7/precio').set(auth).send(cambio).expect(200);

      expect(updatePrecioUseCase.execute).toHaveBeenCalledWith(7, expect.objectContaining(cambio));
    });

    it('exige motivo y costo > 0 (400)', async () => {
      const res = await http().patch('/producto/7/precio').set(auth).send({ ...cambio, motivo: '', costo: 0 }).expect(400);

      expect(res.body.message).toEqual(expect.arrayContaining(['El motivo es obligatorio', 'El costo debe ser mayor a 0']));
      expect(updatePrecioUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
