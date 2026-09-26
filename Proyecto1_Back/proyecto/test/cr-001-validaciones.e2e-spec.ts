import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/modules/common/filters/global-exception.filters';
import { DomainExceptionFilter } from '../src/modules/common/filters/domain-exception.filter';
import { Costo } from '../src/modules/gestion-productos/producto/domain/value-objects/costo.vo';
import { Precio } from '../src/modules/gestion-productos/producto/domain/value-objects/precio.vo';
import { Stock } from '../src/modules/gestion-productos/producto/domain/value-objects/stock.vo';
import { ProductoFactory } from '../src/modules/gestion-productos/producto/domain/factories/producto.factory';
import { ProductoCreateParams } from '../src/modules/gestion-productos/producto/domain/inputs/producto.types';
import { CostoInvalidoException } from '../src/modules/gestion-productos/producto/domain/exceptions/costo-invalido.exception';
import { PrecioInvalidoException } from '../src/modules/gestion-productos/producto/domain/exceptions/precio-invalido.exception';
import { StockInvalidoException } from '../src/modules/gestion-productos/producto/domain/exceptions/stock-invalido.exception';
import { MotivoRequeridoException } from '../src/modules/gestion-productos/producto/domain/exceptions/motivo-requerido.exception';
import { DenominacionRequeridaException } from '../src/modules/gestion-productos/producto/domain/exceptions/denominacion-requerida.exception';
import { ProductoService } from '../src/modules/gestion-productos/producto/application/services/producto.service';
import { CreateLineaDto } from '../src/modules/gestion-productos/linea/application/dto/create-linea.dto';
import { Marca } from '../src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Linea } from '../src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { DenominacionRequeridaException as MarcaDenominacionRequerida } from '../src/modules/gestion-productos/marca/domain/exceptions/denominacion-requerida.exception';
import { DenominacionRequeridaException as LineaDenominacionRequerida } from '../src/modules/gestion-productos/linea/domain/exceptions/denominacion-requerida.exception';
import { StockMinimoInvalidoException } from '../src/modules/gestion-productos/linea/domain/exceptions/stock-minimo-invalido.exception';
import { Usuario } from '../src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

/**
 * CR-001 (H.U.1) — "Como usuario, quiero que el sistema rechace valores de costo, precio o stock
 * inválidos al cargar o editar un producto".
 *   CA1: costo negativo → rechazo con mensaje claro de costo.
 *   CA2: stock o stock mínimo negativo → rechazo con mensaje específico del campo.
 *   CA3: datos válidos → el producto se guarda sin errores.
 *
 * Parte 1: reglas de dominio y DTO en aislamiento (sin HTTP ni base).
 * Parte 2: e2e contra la app completa y la base de desarrollo (Docker, puerto 3310).
 * Resultados y hallazgos: INFORME_2.md.
 */

// ─────────────────────────────── Parte 1: reglas en aislamiento ───────────────────────────────

describe('CR-001 — reglas de dominio y DTO', () => {
  const linea = Linea.create({ superlineaId: 1, denominacion: 'Aceites', observacion: null, utilizaStockMinimo: false, stockMinimo: 0, usuarioCreatedId: 1 });
  const marca = Marca.create({ denominacion: 'Natura', observacion: null, usuarioCreatedId: 1 });
  const producto = (overrides: Partial<ProductoCreateParams> = {}) =>
    ProductoFactory.create({
      denominacion: 'Aceite 1L', codigoBarra: null, proveedor: null, codigoProveedor: null,
      stock: 10, utilizaStockMinimo: false, utilizaStockMinimoPorEmpresa: false, stockMinimo: 2,
      costo: 100, margen: 0.3, destacado: false, envioGratis: false, observacion: null,
      usuarioCreated: { id: 1 } as Usuario, linea, marca, presentacion: null,
      utilizaPack: false, cantidadPorPack: null, imagen: null, ubicacion: null, codigoReferencia: null,
      ...overrides,
    });

  describe('Costo (VO)', () => {
    it('rechaza un costo negativo con CostoInvalidoException', () => {
      expect(() => Costo.create(-0.01)).toThrow(CostoInvalidoException);
    });

    it('acepta un costo positivo', () => {
      expect(Costo.create(0.01).getValue()).toBe(0.01);
    });

    it('rechaza también costo 0: la regla real es "> 0", más estricta que el CA1 ("no negativo")', () => {
      expect(() => Costo.create(0)).toThrow(CostoInvalidoException);
    });
  });

  describe('Precio (VO)', () => {
    it.each([[0, 0.5], [-10, 0.3]])('rechaza un resultado <= 0 (costo %p, margen %p)', (costo, margen) => {
      expect(() => Precio.create(costo, margen)).toThrow(PrecioInvalidoException);
    });

    it('rechaza un precio fijado en 0 y acepta uno positivo', () => {
      expect(() => Precio.fromValue(0)).toThrow(PrecioInvalidoException);
      expect(Precio.fromValue(1).getValue()).toBe(1);
    });
  });

  describe('Stock y stock mínimo de Producto', () => {
    it('el VO Stock rechaza negativos y acepta 0', () => {
      expect(() => Stock.create(-1)).toThrow(StockInvalidoException);
      expect(Stock.create(0).getValue()).toBe(0);
    });

    it('la entidad rechaza stock o stock mínimo negativos al crear', () => {
      expect(() => producto({ stock: -1 })).toThrow(StockInvalidoException);
      expect(() => producto({ stockMinimo: -1 })).toThrow(StockInvalidoException);
    });
  });

  describe('Denominación obligatoria (entidades)', () => {
    it.each(['', '   '])('Producto rechaza %p', (denominacion) => {
      expect(() => producto({ denominacion })).toThrow(DenominacionRequeridaException);
    });

    it.each(['', '   '])('Marca rechaza %p al crear y al editar', (denominacion) => {
      expect(() => Marca.create({ denominacion, observacion: null, usuarioCreatedId: 1 })).toThrow(MarcaDenominacionRequerida);
      const m = Marca.create({ denominacion: 'Válida', observacion: null, usuarioCreatedId: 1 });
      expect(() => m.actualizarDatos({ denominacion, observacion: null, usuarioUpdatedId: 1 })).toThrow(MarcaDenominacionRequerida);
    });

    it.each(['', '   '])('Línea rechaza %p al crear y al editar', (denominacion) => {
      const base = { superlineaId: 1, observacion: null, utilizaStockMinimo: false, stockMinimo: 0 };
      expect(() => Linea.create({ ...base, denominacion, usuarioCreatedId: 1 })).toThrow(LineaDenominacionRequerida);
      expect(() => linea.actualizarDatos({ ...base, denominacion, usuarioUpdatedId: 1 })).toThrow(LineaDenominacionRequerida);
    });
  });

  describe('Stock mínimo de Línea', () => {
    const base = { superlineaId: 1, denominacion: 'Aceites', observacion: null, utilizaStockMinimo: true };

    it('la entidad rechaza un stock mínimo negativo al crear y al editar, y acepta 0', () => {
      expect(() => Linea.create({ ...base, stockMinimo: -1, usuarioCreatedId: 1 })).toThrow(StockMinimoInvalidoException);
      expect(() => linea.actualizarDatos({ ...base, stockMinimo: -1, usuarioUpdatedId: 1 })).toThrow(StockMinimoInvalidoException);
      expect(Linea.create({ ...base, stockMinimo: 0, usuarioCreatedId: 1 }).getStockMinimo()).toBe(0);
    });

    it('CreateLineaDto NO valida el stock mínimo negativo: el rechazo recién ocurre en la entidad', async () => {
      const dto = plainToInstance(CreateLineaDto, { usuarioCreatedId: 1, superlineaId: 1, utilizaStockMinimo: true, denominacion: 'aceites', stockMinimo: -5 });
      expect(await validate(dto)).toEqual([]);
    });
  });

  describe('Motivo obligatorio en el ajuste de stock', () => {
    it.each(['', '   '])('Producto.ajustarStock rechaza el motivo %p sin modificar el stock', (motivo) => {
      const p = producto({ stock: 10 });
      expect(() => p.ajustarStock(5, motivo)).toThrow(MotivoRequeridoException);
      expect(p.getStock()).toBe(10);
    });

    it('ProductoService no lo exige: si falta el motivo usa "Ajuste de stock" y el ajuste se aplica', async () => {
      const p = producto({ stock: 10 });
      const ajustarStock = jest.spyOn(p, 'ajustarStock');
      const repository = { findOne: jest.fn().mockResolvedValue(p), updateEntity: jest.fn() };
      const noUsado = {} as never;
      const service = new ProductoService(noUsado, noUsado, noUsado, noUsado, noUsado, noUsado, noUsado, noUsado, repository as any, noUsado, noUsado, noUsado);

      await expect(service.decrementarStock({} as any, 1, 4)).resolves.toBe(6);
      expect(ajustarStock).toHaveBeenCalledWith(-4, 'Ajuste de stock');
    });
  });
});

// ─────────────────────────────── Parte 2: e2e contra la base real ───────────────────────────────

describe('CR-001 — e2e (HTTP + base de desarrollo)', () => {
  let app: INestApplication<App>;
  let token: string;
  let usuarioId: number;
  let marcaId: number;
  let lineaId: number;
  let superlineaId: number;

  const sufijo = Date.now();
  const creados = { productos: [] as number[], lineas: [] as number[], marcas: [] as number[] };

  const http = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const altaProducto = (extra: object = {}) => ({
    marcaId,
    lineaId,
    costo: 100,
    porcentaje: 20,
    stock: 5,
    stockMinimo: 1,
    utilizaStockMinimo: true,
    utilizaPack: false,
    usuarioCreatedId: usuarioId,
    ...extra,
  });

  /** Los POST responden solo { mensaje }: el id se ubica por denominación. */
  const buscarId = async (ruta: string, denominacion: string) => {
    const res = await http().get(`/api/${ruta}?denominacion=${encodeURIComponent(denominacion)}&take=50`).set(auth());
    return (res.body.data ?? []).find((e: { denominacion: string }) => e.denominacion === denominacion.toUpperCase())?.id as number | undefined;
  };

  /** Si una alta que debía rechazarse se aceptó, se registra para limpiarla igual. */
  const registrarSiSeCreo = async (res: request.Response, ruta: 'linea' | 'marca', denominacion: string) => {
    if (res.status >= 200 && res.status < 300) {
      const id = await buscarId(ruta, denominacion);
      if (id) creados[ruta === 'linea' ? 'lineas' : 'marcas'].push(id);
    }
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication({ logger: false });

    // Mismo orden y opciones que bootstrap() en src/main.ts.
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new DomainExceptionFilter(), new GlobalExceptionFilter());
    await app.init();

    // Usuario del seed; E2E_MAIL / E2E_PASSWORD permiten usar otro si la base local cambió.
    const login = await http()
      .post('/api/auth/login')
      .send({ mail: process.env.E2E_MAIL ?? 'admin@gmail.com', contrasena: process.env.E2E_PASSWORD ?? 'Administrador1?', empresaId: 1 });
    if (login.status !== 201) throw new Error(`Login e2e falló (${login.status}): ${JSON.stringify(login.body)}`);
    token = login.body.accessToken;
    usuarioId = login.body.usuario.id;

    // Fixtures reales de la base, sin ids fijos.
    const marcas = await http().get('/api/producto/find-all-for-marcas/select?denominacion=').set(auth());
    const lineas = await http().get('/api/producto/find-all-for-lineas/select?denominacion=').set(auth());
    const superlineas = await http().get('/api/superlinea').set(auth());
    marcaId = marcas.body.data.find((m: { sistema?: number }) => m.sistema !== 1).id;
    lineaId = lineas.body.data.find((l: { sistema?: number }) => l.sistema !== 1).id;
    superlineaId = superlineas.body.find((s: { sistema: number }) => s.sistema !== 1).id;
  });

  afterAll(async () => {
    // Productos antes que líneas y marcas (FKs). Cada baja por separado: una falla no frena al resto.
    const bajas = [
      ...creados.productos.map((id) => `/api/producto/${id}`),
      ...creados.lineas.map((id) => `/api/linea/${id}`),
      ...creados.marcas.map((id) => `/api/marca/${id}`),
    ];
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

  describe('CA3 — datos válidos', () => {
    it('POST /producto con datos válidos → 201 y el producto queda guardado', async () => {
      const denominacion = `cr001 valido ${sufijo}`;

      const res = await http().post('/api/producto').set(auth()).send(altaProducto({ denominacion }));

      expect(res.status).toBe(201);
      const buscado = await http().get(`/api/producto/search-by?denominacion=${encodeURIComponent(denominacion)}`).set(auth());
      const [guardado] = buscado.body.data;
      creados.productos.push(guardado.id);
      expect(guardado).toMatchObject({ denominacion: denominacion.toUpperCase(), costo: 100, stock: 5, stockMinimo: 1 });
    });
  });

  describe('CA1 — costo negativo', () => {
    it('POST /producto con costo negativo → 400 con mensaje de costo', async () => {
      const res = await http().post('/api/producto').set(auth()).send(altaProducto({ costo: -10 }));

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('El costo debe ser mayor a 0.');
    });

    it('PUT /producto/:id (edición) con costo negativo → 400 y el producto no cambia', async () => {
      const id = creados.productos[0];

      const res = await http().put(`/api/producto/${id}`).set(auth()).send({ costo: -10, usuarioUpdatedId: usuarioId });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('El costo debe ser mayor a 0.');
      expect((await http().get(`/api/producto/${id}`).set(auth())).body.costo).toBe(100);
    });
  });

  describe('CA2 — stock y stock mínimo negativos', () => {
    it('POST /producto con stock negativo → 400 con mensaje de stock', async () => {
      const res = await http().post('/api/producto').set(auth()).send(altaProducto({ stock: -1 }));

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(['El stock no puede ser negativo.']);
    });

    it('POST /producto con stock mínimo negativo → 400 con mensaje de stock mínimo', async () => {
      const res = await http().post('/api/producto').set(auth()).send(altaProducto({ stockMinimo: -1 }));

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(['El stock mínimo no puede ser negativo.']);
    });

    it('PUT /producto/:id (edición) con stock negativo → 400', async () => {
      const res = await http().put(`/api/producto/${creados.productos[0]}`).set(auth()).send({ stock: -1, usuarioUpdatedId: usuarioId });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(['El stock no puede ser negativo.']);
    });

    it('POST /linea con stock mínimo negativo → rechazado con mensaje de stock mínimo', async () => {
      const denominacion = `cr001 linea ${sufijo}`;

      const res = await http().post('/api/linea').set(auth()).send({
        superlineaId, denominacion, utilizaStockMinimo: true, stockMinimo: -3, usuarioCreatedId: usuarioId,
      });
      await registrarSiSeCreo(res, 'linea', denominacion);

      expect([400, 422]).toContain(res.status);
      expect(JSON.stringify(res.body.message)).toMatch(/stock m[ií]nimo/i);
    });
  });

  describe('Denominación vacía o solo espacios', () => {
    it.each(['', '   '])('POST /producto con denominación %p → 400', async (denominacion) => {
      const res = await http().post('/api/producto').set(auth()).send(altaProducto({ denominacion }));

      expect(res.status).toBe(400);
      // Se rechaza, pero con un mensaje genérico en lugar de "la denominación es obligatoria".
      expect(res.body.message).toEqual(['La denominación contiene caracteres inválidos ']);
    });

    it.each(['', '   '])('POST /marca con denominación %p → 400 "no puede estar vacía"', async (denominacion) => {
      const res = await http().post('/api/marca').set(auth()).send({ denominacion, usuarioCreatedId: usuarioId });
      await registrarSiSeCreo(res, 'marca', denominacion);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('La denominación no puede estar vacía.');
    });

    it.each(['', '   '])('POST /linea con denominación %p → 400 "no puede estar vacía"', async (denominacion) => {
      const res = await http().post('/api/linea').set(auth()).send({
        superlineaId, denominacion, utilizaStockMinimo: false, usuarioCreatedId: usuarioId,
      });
      await registrarSiSeCreo(res, 'linea', denominacion);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('La denominación no puede estar vacía.');
    });
  });
});
