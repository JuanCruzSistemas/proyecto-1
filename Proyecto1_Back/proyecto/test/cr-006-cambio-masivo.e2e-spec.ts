import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/modules/common/filters/global-exception.filters';
import { DomainExceptionFilter } from '../src/modules/common/filters/domain-exception.filter';
import { ProductoFactory } from '../src/modules/gestion-productos/producto/domain/factories/producto.factory';
import { Producto } from '../src/modules/gestion-productos/producto/domain/entities/producto.entity';
import { MargenInvalidoException } from '../src/modules/gestion-productos/producto/domain/exceptions/margen-invalido.exception';
import { AplicarCambioMasivoUseCase } from '../src/modules/gestion-productos/producto/application/use-cases/aplicar-cambio-masivo.use-case';
import { GuardarCambioMasivoUseCase } from '../src/modules/gestion-productos/producto/application/use-cases/guardar-cambio-masivo.use-case';
import { TipoActualizacion } from '../src/modules/gestion-productos/producto/application/dto/aplicar-cambios-masivos.dto';
import { Linea } from '../src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from '../src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Usuario } from '../src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

/**
 * CR-006 (H.U.6) — Actualización masiva de precios por porcentaje o monto fijo, por Línea o global.
 *   CA1: +X% por Línea → cada producto recalcula su precio aplicando el % sobre el valor actual.
 *   CA2: monto fijo → se suma/resta al precio de cada producto alcanzado.
 *   CA3: si algún producto quedaría con precio negativo → se rechaza la operación completa (todo o nada).
 *   CA4: cada cambio queda registrado en el historial de precios (CR-007).
 *
 * Parte 1: casos de uso con repositorio y DataSource mockeados (entidades de dominio reales).
 * Parte 2: e2e contra la app completa y la base de desarrollo.
 * Los tests marcados "CA literal" que fallan son hallazgos: ver INFORME_3.md.
 */

// ─────────────────────────────── Parte 1: casos de uso ───────────────────────────────

describe('CR-006 — casos de uso (unitario)', () => {
  const linea = Linea.create({ superlineaId: 1, denominacion: 'Aceites', observacion: null, utilizaStockMinimo: false, stockMinimo: 0, usuarioCreatedId: 1 });
  const marca = Marca.create({ denominacion: 'Natura', observacion: null, usuarioCreatedId: 1 });
  const usuario = { id: 1 } as Usuario;

  /** Producto persistido con costo y margen dados (precio = costo × (1 + margen)). */
  const producto = (id: number, costo: number, margen: number): Producto =>
    ProductoFactory.reconstitute({
      id, denominacion: `P${id}`, codigoBarra: null, proveedor: null, codigoProveedor: null, stock: 1,
      utilizaStockMinimo: false, utilizaStockMinimoPorEmpresa: false, stockMinimo: 0, costo, margen,
      fechaCosto: null, destacado: false, envioGratis: false, observacion: null, createdAt: new Date(),
      updatedAt: null, deletedAt: null, usuarioCreated: usuario, usuarioUpdated: null, usuarioDeleted: null,
      linea, marca, presentacion: null, utilizaPack: false, cantidadPorPack: null, imagen: null, ubicacion: null,
      movimientosStock: [], sistema: 0, codigoReferencia: null, denominacionEditadaManualmente: true,
    });

  describe('Producto.actualizarPrecio (advertencia 1)', () => {
    it('recalcula el margen: el precio sigue siendo costo × (1 + margen)', () => {
      const p = producto(1, 100, 0.3);

      p.actualizarPrecio(150, usuario);

      expect(p.getPrecio()).toBe(150);
      expect(p.getMargen()).toBeCloseTo(0.5);
      expect(p.getCosto() * (1 + p.getMargen())).toBeCloseTo(p.getPrecio());
    });

    it('una edición posterior que recalcula desde costo/margen conserva el precio masivo', () => {
      const p = producto(1, 100, 0.3);
      p.actualizarPrecio(150, usuario);

      p.calcularPrecio();

      expect(p.getPrecio()).toBeCloseTo(150);
    });

    it('rechaza precios fuera de [costo, 2 × costo] (margen entre 0 % y 100 %)', () => {
      expect(() => producto(1, 100, 0.3).actualizarPrecio(99, usuario)).toThrow(MargenInvalidoException);
      expect(() => producto(1, 100, 0.3).actualizarPrecio(201, usuario)).toThrow(MargenInvalidoException);
    });
  });

  describe('AplicarCambioMasivoUseCase (previsualización)', () => {
    const repository = { findByIds: jest.fn() };
    const useCase = new AplicarCambioMasivoUseCase(repository as any);
    const lote = [producto(1, 100, 0.3), producto(2, 200, 0.2)]; // precios 130 y 240

    beforeEach(() => repository.findByIds.mockResolvedValue(lote));

    it('CA1 literal: +10 % sobre el precio actual (130 → 143, 240 → 264)', async () => {
      const res = await useCase.execute({ items: [{ id: 1 }, { id: 2 }], valor: 10, tipoActualizacion: TipoActualizacion.PORCENTAJE });

      expect(res.map((r) => r.precioNuevo)).toEqual([143, 264]);
    });

    it('comportamiento real: PORCENTAJE reemplaza el margen (costo × 1,10 → 110 y 220)', async () => {
      const res = await useCase.execute({ items: [{ id: 1 }, { id: 2 }], valor: 10, tipoActualizacion: TipoActualizacion.PORCENTAJE });

      expect(res.map((r) => r.precioNuevo)).toEqual([110, 220]);
    });

    it('CA2: MONTO suma o resta el importe al precio actual de cada producto', async () => {
      const suma = await useCase.execute({ items: [{ id: 1 }, { id: 2 }], valor: 5, tipoActualizacion: TipoActualizacion.MONTO });
      const resta = await useCase.execute({ items: [{ id: 1 }, { id: 2 }], valor: -5, tipoActualizacion: TipoActualizacion.MONTO });

      expect(suma.map((r) => r.precioNuevo)).toEqual([135, 245]);
      expect(resta.map((r) => r.precioNuevo)).toEqual([125, 235]);
    });

    it('el lote es exactamente el de los ids recibidos (el alcance lo decide la búsqueda previa)', async () => {
      repository.findByIds.mockResolvedValue([lote[0]]);

      const res = await useCase.execute({ items: [{ id: 1 }], valor: 5, tipoActualizacion: TipoActualizacion.MONTO });

      expect(repository.findByIds).toHaveBeenLastCalledWith([1]);
      expect(res).toHaveLength(1);
    });

    it('toma costo y precio de la base, no de lo que manda la grilla', async () => {
      const res = await useCase.execute({ items: [{ id: 1, costo: 1, precio: 1 }], valor: 5, tipoActualizacion: TipoActualizacion.MONTO });

      expect(res[0]).toMatchObject({ costo: 100, precio: 130, precioNuevo: 135, dirty: true });
    });

    it('CA3: si un producto quedaría negativo, rechaza todo el lote', async () => {
      await expect(
        useCase.execute({ items: [{ id: 1 }, { id: 2 }], valor: -150, tipoActualizacion: TipoActualizacion.MONTO }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza un producto inexistente', async () => {
      await expect(
        useCase.execute({ items: [{ id: 99 }], valor: 5, tipoActualizacion: TipoActualizacion.MONTO }),
      ).rejects.toThrow('Producto con ID 99 no encontrado.');
    });
  });

  describe('GuardarCambioMasivoUseCase (persistencia)', () => {
    const queryRunner = {
      connect: jest.fn(), startTransaction: jest.fn(), commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(), release: jest.fn(), manager: {},
    };
    const dataSource = { createQueryRunner: jest.fn(() => queryRunner) };
    const repository = { findOne: jest.fn(), updateEntity: jest.fn() };
    const usuarioValidator = { validarUsuarioExiste: jest.fn().mockResolvedValue(usuario) };
    const useCase = new GuardarCambioMasivoUseCase(repository as any, usuarioValidator as any, dataSource as any);

    const productos = new Map<number, Producto>();
    beforeEach(() => {
      jest.clearAllMocks();
      productos.clear();
      [producto(1, 100, 0.3), producto(2, 200, 0.2), producto(3, 50, 0.4)].forEach((p) => productos.set(p.getId()!, p));
      repository.findOne.mockImplementation(async (id: number) => productos.get(id) ?? null);
      repository.updateEntity.mockResolvedValue(undefined);
    });

    it('guarda todos los productos del lote dentro de una transacción', async () => {
      await useCase.execute([{ id: 1, precioNuevo: 140 }, { id: 2, precioNuevo: 250 }], 1);

      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(repository.updateEntity).toHaveBeenCalledTimes(2);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(productos.get(1)!.getPrecio()).toBe(140);
      expect(productos.get(2)!.getPrecio()).toBe(250);
    });

    it('CA3: un precio negativo en el lote rechaza todo antes de persistir nada', async () => {
      await expect(
        useCase.execute([{ id: 1, precioNuevo: 140 }, { id: 2, precioNuevo: -10 }, { id: 3, precioNuevo: 60 }], 1),
      ).rejects.toThrow(BadRequestException);

      expect(repository.updateEntity).not.toHaveBeenCalled();
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('CA3 (advertencia 5): si falla la persistencia a mitad del lote, hace rollback y no commit', async () => {
      // Con mocks solo se verifica que se pide el rollback; la atomicidad real se prueba en la parte e2e.
      repository.updateEntity.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('falla de base'));

      await expect(useCase.execute([{ id: 1, precioNuevo: 140 }, { id: 2, precioNuevo: 250 }], 1)).rejects.toThrow('falla de base');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('re-valida el precio recibido contra el costo aunque venga del frontend', async () => {
      await expect(useCase.execute([{ id: 1, precioNuevo: 500 }], 1)).rejects.toThrow('no es compatible con su costo');
    });
  });
});

// ─────────────────────────────── Parte 2: e2e contra la base real ───────────────────────────────

describe('CR-006 — e2e (HTTP + base de desarrollo)', () => {
  let app: INestApplication<App>;
  let token: string;
  let usuarioId: number;
  let marcaId: number;
  let lineaId: number | undefined;

  const sufijo = Date.now();
  const productoIds: number[] = [];
  const fixtures = [
    { nombre: 'a', costo: 100, porcentaje: 30 }, // precio 130
    { nombre: 'b', costo: 200, porcentaje: 20 }, // precio 240
    { nombre: 'c', costo: 50, porcentaje: 40 }, // precio 70
  ];

  const http = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });

  // El precio se reconstruye como costo × (1 + porcentaje/100) al leer, con error de punto flotante
  // (p. ej. 114.99999999999999): se compara al centavo. Ver INFORME_3.md.
  const precios = async (): Promise<number[]> => {
    const res = await Promise.all(productoIds.map((id) => http().get(`/api/producto/${id}`).set(auth())));
    return res.map((r) => Math.round(r.body.precio * 100) / 100);
  };
  const historiales = async (): Promise<number[]> => {
    const res = await Promise.all(productoIds.map((id) => http().get(`/api/producto/${id}/historial-precio`).set(auth())));
    return res.map((r) => r.body.length);
  };
  const lote = () => productoIds.map((id) => ({ id }));
  const aplicar = (valor: number, tipoActualizacion: 'PORCENTAJE' | 'MONTO') =>
    http().patch('/api/cambio-precios/aplicar-cambios').set(auth()).send({ items: lote(), valor, tipoActualizacion });
  const guardar = (items: object[]) =>
    http().patch('/api/cambio-precios/guardar-cambios').set(auth()).send({ items, usuarioCreatedId: usuarioId });

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication({ logger: false });

    // Mismo orden y opciones que bootstrap() en src/main.ts.
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalExceptionFilter(), new DomainExceptionFilter());
    await app.init();

    // Usuario del seed; E2E_MAIL / E2E_PASSWORD permiten usar otro si la base local cambió.
    const login = await http()
      .post('/api/auth/login')
      .send({ mail: process.env.E2E_MAIL ?? 'admin@gmail.com', contrasena: process.env.E2E_PASSWORD ?? 'Administrador1?', empresaId: 1 });
    if (login.status !== 201) throw new Error(`Login e2e falló (${login.status}): ${JSON.stringify(login.body)}`);
    token = login.body.accessToken;
    usuarioId = login.body.usuario.id;

    // Fixtures propias: una Línea nueva (con una SuperLínea real) y 3 productos en ella.
    const marcas = await http().get('/api/producto/find-all-for-marcas/select?denominacion=').set(auth());
    const superlineas = await http().get('/api/superlinea').set(auth());
    marcaId = marcas.body.data.find((m: { sistema?: number }) => m.sistema !== 1).id;
    const superlineaId = superlineas.body.find((s: { sistema: number }) => s.sistema !== 1).id;

    const denominacionLinea = `cr006 linea ${sufijo}`;
    const altaLinea = await http().post('/api/linea').set(auth())
      .send({ superlineaId, denominacion: denominacionLinea, utilizaStockMinimo: false, usuarioCreatedId: usuarioId });
    if (altaLinea.status !== 201) throw new Error(`No se pudo crear la Línea de prueba: ${JSON.stringify(altaLinea.body)}`);
    const lineas = await http().get(`/api/linea/search-by?denominacion=${encodeURIComponent(denominacionLinea)}`).set(auth());
    lineaId = lineas.body.data.find((l: { denominacion: string }) => l.denominacion === denominacionLinea.toUpperCase()).id;

    for (const f of fixtures) {
      const alta = await http().post('/api/producto').set(auth()).send({
        denominacion: `cr006 ${f.nombre} ${sufijo}`, marcaId, lineaId, costo: f.costo, porcentaje: f.porcentaje,
        utilizaStockMinimo: false, utilizaPack: false, usuarioCreatedId: usuarioId,
      });
      if (alta.status !== 201) throw new Error(`No se pudo crear el producto de prueba: ${JSON.stringify(alta.body)}`);
    }
    const creados = await http().get(`/api/producto/search-by?lineaId=${lineaId}&take=50`).set(auth());
    productoIds.push(...creados.body.data.sort((x: any, y: any) => x.denominacion.localeCompare(y.denominacion)).map((p: { id: number }) => p.id));
  });

  afterAll(async () => {
    // Productos antes que la Línea (FK). Cada baja por separado: una falla no frena al resto.
    const bajas = [...productoIds.map((id) => `/api/producto/${id}`), ...(lineaId ? [`/api/linea/${lineaId}`] : [])];
    for (const url of bajas) {
      try {
        const res = await http().delete(`${url}?usuarioId=${usuarioId}`).set(auth());
        if (res.status !== 200) console.warn(`Limpieza ${url} → ${res.status}`);
      } catch (e) {
        console.warn(`Limpieza ${url} → ${(e as Error).message}`);
      }
    }
    await app?.close();
  });

  it('alcance por Línea: la búsqueda que usa el frontend devuelve solo los productos de esa Línea (advertencia 2)', async () => {
    expect(productoIds).toHaveLength(3);
    expect(await precios()).toEqual([130, 240, 70]);

    const global = await http().get('/api/producto/search-by?take=1').set(auth());
    expect(global.status).toBe(200);
    expect(global.body.total).toBeGreaterThanOrEqual(3); // sin lineaId = catálogo completo
  });

  it('CA1 literal: +10 % por Línea → cada precio aumenta 10 % sobre el valor actual', async () => {
    const antes = await precios();

    const preview = await aplicar(10, 'PORCENTAJE');
    expect(preview.status).toBe(200);
    expect((await guardar(preview.body)).status).toBe(200);

    expect(await precios()).toEqual(antes.map((p) => Number((p * 1.1).toFixed(2))));
  });

  it('CA2: monto fijo +5 y −3 se suman/restan al precio de cada producto y se persisten', async () => {
    for (const monto of [5, -3]) {
      const antes = await precios();

      const preview = await aplicar(monto, 'MONTO');
      expect(preview.status).toBe(200);
      expect((await guardar(preview.body)).status).toBe(200);

      expect(await precios()).toEqual(antes.map((p) => Number((p + monto).toFixed(2))));
    }
  });

  it('CA3: la previsualización rechaza un lote donde un producto quedaría negativo', async () => {
    const res = await aplicar(-1000, 'MONTO');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no es compatible con su costo/);
  });

  it('CA3: guardar un lote con un precio negativo no modifica NINGÚN producto', async () => {
    const antes = await precios();
    const items = productoIds.map((id, i) => ({ id, precioNuevo: i === 1 ? -10 : antes[i] + 1 }));

    const res = await guardar(items);

    expect(res.status).toBe(400);
    expect(await precios()).toEqual(antes);
  });

  it('el porcentaje negativo se rechaza en el DTO (advertencia 4)', async () => {
    const res = await aplicar(-10, 'PORCENTAJE');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('El porcentaje no puede ser negativo');
  });

  it('guardar-cambios no valida el body: un lote vacío responde 200 sin hacer nada (advertencia 6)', async () => {
    const res = await http().patch('/api/cambio-precios/guardar-cambios').set(auth()).send({ items: [], usuarioCreatedId: usuarioId, extra: 'x' });

    expect(res.status).toBe(200);
  });

  it('CA4: cada cambio masivo queda registrado en el historial de cada producto', async () => {
    const antes = await historiales();

    const preview = await aplicar(1, 'MONTO');
    expect((await guardar(preview.body)).status).toBe(200);

    expect(await historiales()).toEqual(antes.map((n) => n + 1));
  });
});
