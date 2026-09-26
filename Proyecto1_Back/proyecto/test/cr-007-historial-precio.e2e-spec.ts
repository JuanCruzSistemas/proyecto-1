import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/modules/common/filters/global-exception.filters';
import { DomainExceptionFilter } from '../src/modules/common/filters/domain-exception.filter';
import { ProductoFactory } from '../src/modules/gestion-productos/producto/domain/factories/producto.factory';
import { Producto } from '../src/modules/gestion-productos/producto/domain/entities/producto.entity';
import { HistorialPrecio } from '../src/modules/gestion-productos/producto/domain/entities/historial-precio.entity';
import { HistorialPrecioFactory } from '../src/modules/gestion-productos/producto/domain/factories/historial-precio.factory';
import { CostoInvalidoException } from '../src/modules/gestion-productos/producto/domain/exceptions/costo-invalido.exception';
import { MargenInvalidoException } from '../src/modules/gestion-productos/producto/domain/exceptions/margen-invalido.exception';
import { PresentacionRequeridaException } from '../src/modules/gestion-productos/producto/domain/exceptions/presentacion-requerida.exception';
import { UpdatePrecioUseCase } from '../src/modules/gestion-productos/producto/application/use-cases/update-precio.use-case';
import { UpdatePrecioDto } from '../src/modules/gestion-productos/producto/application/dto/update-precio.dto';
import { HistorialPrecioMapper } from '../src/modules/gestion-productos/producto/infraestructure/persistence/mappers/historial-precio.mapper';
import { ProductoEntity } from '../src/modules/gestion-productos/producto/infraestructure/persistence/entities/producto.orm-entity';
import { Linea } from '../src/modules/gestion-productos/linea/domain/entities/linea.entity';
import { Marca } from '../src/modules/gestion-productos/marca/domain/entities/marca.entity';
import { Usuario } from '../src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

/**
 * CR-007 (H.U.7) — Historial de cambios de precio.
 *   CA1: cambiar el precio crea un registro con precio anterior, precio nuevo, fecha y motivo.
 *   CA2: un precio nuevo <= 0 se rechaza.
 *   CA3: el historial de un producto se consulta ordenado cronológicamente.
 *   CA4: sin motivo, el sistema exige que se ingrese uno.
 *
 * Parte 1: UpdatePrecioUseCase / DTO / mapper con repositorios y DataSource mockeados.
 * Parte 2: e2e contra la app completa y la base de desarrollo.
 * Los tests que fallan son hallazgos: ver INFORME_4.md.
 */

// ─────────────────────────────── Parte 1: unitario ───────────────────────────────

describe('CR-007 — caso de uso, DTO y mapper (unitario)', () => {
  const linea = Linea.create({ superlineaId: 1, denominacion: 'Aceites', observacion: null, utilizaStockMinimo: false, stockMinimo: 0, usuarioCreatedId: 1 });
  const marca = Marca.create({ denominacion: 'Natura', observacion: null, usuarioCreatedId: 1 });
  const usuario = { id: 1, denominacion: 'Admin' } as Usuario;

  const producto = (overrides: { presentacion?: null; denominacionEditadaManualmente?: boolean } = {}): Producto =>
    ProductoFactory.reconstitute({
      id: 7, denominacion: 'ACEITE 1L', codigoBarra: null, proveedor: null, codigoProveedor: null, stock: 1,
      utilizaStockMinimo: false, utilizaStockMinimoPorEmpresa: false, stockMinimo: 0, costo: 100, margen: 0.3,
      fechaCosto: null, destacado: false, envioGratis: false, observacion: null, createdAt: new Date(), updatedAt: null,
      deletedAt: null, usuarioCreated: usuario, usuarioUpdated: null, usuarioDeleted: null, linea, marca,
      presentacion: null, utilizaPack: false, cantidadPorPack: null, imagen: null, ubicacion: null, movimientosStock: [],
      sistema: 0, codigoReferencia: null, denominacionEditadaManualmente: true, ...overrides,
    });

  const queryRunner = {
    connect: jest.fn(), startTransaction: jest.fn(), commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(), release: jest.fn(), manager: {},
  };
  const dataSource = { createQueryRunner: jest.fn(() => queryRunner) };
  const repository = { findOne: jest.fn(), updateEntity: jest.fn() };
  const historialRepository = { save: jest.fn() };
  const usuarioValidator = { validarUsuarioExiste: jest.fn() };
  const useCase = new UpdatePrecioUseCase(repository as any, historialRepository as any, usuarioValidator as any, dataSource as any);

  const cambio = (overrides: Partial<UpdatePrecioDto> = {}): UpdatePrecioDto =>
    ({ costo: 100, porcentaje: 50, usuarioId: 1, motivo: 'Lista nueva', ...overrides }) as UpdatePrecioDto;
  const historialGuardado = (): HistorialPrecio => historialRepository.save.mock.calls[0][0];

  let actual: Producto;
  beforeEach(() => {
    jest.clearAllMocks();
    actual = producto();
    repository.findOne.mockResolvedValue(actual);
    repository.updateEntity.mockResolvedValue(undefined);
    historialRepository.save.mockResolvedValue(undefined);
    usuarioValidator.validarUsuarioExiste.mockResolvedValue(usuario);
  });

  describe('CA1 — registro del cambio', () => {
    it('crea un historial con precio, costo y margen anterior/nuevo, motivo y fecha', async () => {
      await useCase.execute(7, cambio({ costo: 120, porcentaje: 50 }));

      const h = historialGuardado();
      expect(h.getPrecioAnterior()).toBeCloseTo(130);
      expect(h.getPrecioNuevo()).toBeCloseTo(180);
      expect(h.getCostoAnterior()).toBe(100);
      expect(h.getCostoNuevo()).toBe(120);
      expect(h.getMargenAnterior()).toBe(0.3);
      expect(h.getMargenNuevo()).toBe(0.5);
      expect(h.getMotivo()).toBe('Lista nueva');
      expect(h.getFecha()).toBeInstanceOf(Date);
      expect(h.getUsuario()).toBe(usuario);
      expect(h.getProducto()).toBe(actual);
    });

    it('guarda precio e historial en la misma transacción y la confirma', async () => {
      await useCase.execute(7, cambio());

      expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
      const uow = repository.updateEntity.mock.calls[0][0];
      expect(historialRepository.save.mock.calls[0][1]).toBe(uow);
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('producto inexistente: 404 y no se registra nada', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(7, cambio())).rejects.toThrow(NotFoundException);
      expect(historialRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Transacción', () => {
    it('si falla el guardado del historial, hace rollback y no confirma el precio', async () => {
      historialRepository.save.mockRejectedValue(new Error('falla historial'));

      await expect(useCase.execute(7, cambio())).rejects.toThrow('falla historial');

      expect(repository.updateEntity).toHaveBeenCalled(); // el UPDATE se hizo dentro de la transacción…
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1); // …y se revierte
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      // Con mocks solo se verifica el rollback pedido; que el precio no cambie en la base se prueba en la parte e2e.
    });

    it('si falla el guardado del precio, no se intenta registrar el historial', async () => {
      repository.updateEntity.mockRejectedValue(new Error('falla precio'));

      await expect(useCase.execute(7, cambio())).rejects.toThrow('falla precio');

      expect(historialRepository.save).not.toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('CA2 — precio nuevo <= 0 (dónde se valida)', () => {
    const mensajesDto = async (plano: object) =>
      (await validate(plainToInstance(UpdatePrecioDto, { usuarioId: 1, motivo: 'm', porcentaje: 10, costo: 100, ...plano })))
        .flatMap((e) => Object.values(e.constraints ?? {}));

    it('DTO: costo 0 o negativo y porcentaje negativo se rechazan (el DTO no recibe un precio, sino costo y %)', async () => {
      expect(await mensajesDto({ costo: 0 })).toContain('El costo debe ser mayor a 0');
      expect(await mensajesDto({ costo: -5 })).toContain('El costo debe ser mayor a 0');
      expect(await mensajesDto({ porcentaje: -1 })).toContain('El porcentaje debe ser un número positivo o 0');
    });

    it('dominio: costo <= 0 y margen fuera de rango se rechazan antes de persistir nada', async () => {
      await expect(useCase.execute(7, cambio({ costo: 0 }))).rejects.toThrow(CostoInvalidoException);
      await expect(useCase.execute(7, cambio({ porcentaje: 150 }))).rejects.toThrow(MargenInvalidoException);
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
      expect(historialRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('CA4 — motivo obligatorio', () => {
    const mensajesMotivo = async (motivo: unknown) =>
      (await validate(plainToInstance(UpdatePrecioDto, { costo: 100, porcentaje: 10, usuarioId: 1, motivo })))
        .flatMap((e) => Object.values(e.constraints ?? {}));

    it.each([undefined, ''])('DTO rechaza el motivo %p', async (motivo) => {
      expect(await mensajesMotivo(motivo)).toContain('El motivo es obligatorio');
    });

    it('CA4 literal: un motivo de solo espacios también debe rechazarse (DTO o dominio)', async () => {
      const dtoRechaza = (await mensajesMotivo('   ')).length > 0;
      const dominioRechaza = (() => {
        try {
          HistorialPrecioFactory.create({
            precioAnterior: 1, precioNuevo: 2, costoAnterior: 1, costoNuevo: 1, margenAnterior: 0, margenNuevo: 1,
            motivo: '   ', producto: actual, usuario,
          });
          return false;
        } catch {
          return true;
        }
      })();

      expect(dtoRechaza || dominioRechaza).toBe(true);
    });
  });

  describe('Cuidado 1 — escala del margen (fracción en dominio, % en la columna)', () => {
    it('ida y vuelta: 0.355 → 35.5 en la columna → 0.355 en el dominio', () => {
      const h = HistorialPrecioFactory.reconstitute({
        id: 1, precioAnterior: 130, precioNuevo: 135.5, costoAnterior: 100, costoNuevo: 100,
        margenAnterior: 0.3, margenNuevo: 0.355, motivo: 'x', fecha: new Date(), producto: actual, usuario,
      });

      const orm = HistorialPrecioMapper.toOrm(h);
      expect(orm.margenAnterior).toBeCloseTo(30);
      expect(orm.margenNuevo).toBeCloseTo(35.5);

      const productoOrm = Object.assign(new ProductoEntity(), {
        id: 7, denominacion: 'X', stock: 1, utilizaStockMinimo: false, utilizaStockMinimoPorEmpresa: false, stockMinimo: 0,
        costo: 100, porcentaje: 30, createdAt: new Date(), usuarioCreated: usuario, utilizaPack: false, sistema: 0,
        linea: { id: 1, superlineaId: 1, denominacion: 'L', utilizaStockMinimo: false, stockMinimo: 0, sistema: 0 },
        marca: { id: 1, denominacion: 'M', sistema: 0 },
      });
      const vuelta = HistorialPrecioMapper.toDomain(Object.assign(orm, { producto: productoOrm, usuario }));
      expect(vuelta.getMargenAnterior()).toBeCloseTo(0.3);
      expect(vuelta.getMargenNuevo()).toBeCloseTo(0.355);
    });
  });

  describe('Cuidado 2 — interacción con la denominación automática (CR-005)', () => {
    it('cambiar el precio de un producto sin presentación y con denominación automática lanza PresentacionRequeridaException', async () => {
      // El caso de uso reutiliza actualizarDatos() con denominacion undefined, que regenera la denominación.
      repository.findOne.mockResolvedValue(producto({ presentacion: null, denominacionEditadaManualmente: false }));

      await expect(useCase.execute(7, cambio())).rejects.toThrow(PresentacionRequeridaException);
      expect(historialRepository.save).not.toHaveBeenCalled();
    });
  });
});

// ─────────────────────────────── Parte 2: e2e contra la base real ───────────────────────────────

describe('CR-007 — e2e (HTTP + base de desarrollo)', () => {
  let app: INestApplication<App>;
  let token: string;
  let usuarioId: number;
  let productoId: number | undefined;

  const denominacion = `cr007 producto ${Date.now()}`;
  const http = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const cambiarPrecio = (body: object) => http().patch(`/api/producto/${productoId}/precio`).set(auth()).send({ usuarioId, ...body });
  const historial = async () => (await http().get(`/api/producto/${productoId}/historial-precio`).set(auth())).body as any[];
  const producto = async () => (await http().get(`/api/producto/${productoId}`).set(auth())).body;
  const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

    // Fixture propio: producto con marca y línea reales (no-sistema), costo 100 y margen 30 % → precio 130.
    const marcas = await http().get('/api/producto/find-all-for-marcas/select?denominacion=').set(auth());
    const lineas = await http().get('/api/producto/find-all-for-lineas/select?denominacion=').set(auth());
    const alta = await http().post('/api/producto').set(auth()).send({
      denominacion,
      marcaId: marcas.body.data.find((m: { sistema?: number }) => m.sistema !== 1).id,
      lineaId: lineas.body.data.find((l: { sistema?: number }) => l.sistema !== 1).id,
      costo: 100, porcentaje: 30, utilizaStockMinimo: false, utilizaPack: false, usuarioCreatedId: usuarioId,
    });
    if (alta.status !== 201) throw new Error(`No se pudo crear el producto de prueba: ${JSON.stringify(alta.body)}`);
    const buscado = await http().get(`/api/producto/search-by?denominacion=${encodeURIComponent(denominacion)}`).set(auth());
    productoId = buscado.body.data[0].id;
  });

  afterAll(async () => {
    // El historial queda asociado al producto (FK): se da de baja el producto.
    try {
      if (productoId) {
        const res = await http().delete(`/api/producto/${productoId}?usuarioId=${usuarioId}`).set(auth());
        if (res.status !== 200) console.warn(`Limpieza producto ${productoId} → ${res.status}`);
      }
    } catch (e) {
      console.warn(`Limpieza producto ${productoId} → ${(e as Error).message}`);
    }
    await app?.close();
  });

  it('CA1: PATCH /producto/:id/precio con motivo → 200 y un registro nuevo con los valores correctos', async () => {
    expect(await historial()).toEqual([]);

    const res = await cambiarPrecio({ costo: 100, porcentaje: 50, motivo: 'Aumento proveedor' });

    expect(res.status).toBe(200);
    const registros = await historial();
    expect(registros).toHaveLength(1);
    expect(registros[0]).toMatchObject({
      precioAnterior: 130, precioNuevo: 150, costoAnterior: 100, costoNuevo: 100,
      margenAnterior: 0.3, margenNuevo: 0.5, motivo: 'Aumento proveedor', usuarioId,
    });
    expect(Number.isNaN(Date.parse(registros[0].fecha))).toBe(false);
    expect((await producto()).precio).toBeCloseTo(150);
  });

  it('cuidado 1: un margen de 35,5 % se guarda y se lee sin error de escala', async () => {
    await cambiarPrecio({ costo: 100, porcentaje: 35.5, motivo: 'Escala' });

    // Se busca por motivo, no por posición: el orden entre cambios del mismo segundo no es confiable (ver CA3).
    const ultimo = (await historial()).find((r) => r.motivo === 'Escala');
    expect(ultimo.margenNuevo).toBeCloseTo(0.355);
    expect(ultimo.precioNuevo).toBeCloseTo(135.5);
    expect((await producto()).porcentaje).toBeCloseTo(35.5);
  });

  describe('CA2: precio nuevo <= 0 se rechaza', () => {
    it.each([
      [{ costo: 0, porcentaje: 10 }, 'El costo debe ser mayor a 0'],
      [{ costo: -10, porcentaje: 10 }, 'El costo debe ser mayor a 0'],
      [{ costo: 100, porcentaje: -5 }, 'El porcentaje debe ser un número positivo o 0'],
    ])('%p → 400 (DTO) y no se registra nada', async (valores, mensaje) => {
      const antes = (await historial()).length;

      const res = await cambiarPrecio({ ...valores, motivo: 'Inválido' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain(mensaje);
      expect(await historial()).toHaveLength(antes);
    });

    it('margen mayor a 100 % → 422 (dominio) y no se registra nada', async () => {
      const antes = (await historial()).length;

      const res = await cambiarPrecio({ costo: 100, porcentaje: 150, motivo: 'Margen excesivo' });

      expect(res.status).toBe(422);
      expect(await historial()).toHaveLength(antes);
    });
  });

  describe('CA4: motivo obligatorio', () => {
    it.each([[undefined], ['']])('motivo %p → 400 "El motivo es obligatorio"', async (motivo) => {
      const res = await cambiarPrecio({ costo: 100, porcentaje: 20, motivo });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('El motivo es obligatorio');
    });

    it('CA4 literal: motivo de solo espacios → rechazado', async () => {
      const res = await cambiarPrecio({ costo: 100, porcentaje: 20, motivo: '   ' });

      expect(res.status).toBe(400);
    });
  });

  it('transacción real: si falla el guardado del historial, el precio del producto no cambia', async () => {
    // motivo > 500 caracteres: el DTO no tiene MaxLength, el UPDATE del precio pasa y el INSERT del historial falla.
    const precioAntes = (await producto()).precio;
    const registrosAntes = (await historial()).length;

    const res = await cambiarPrecio({ costo: 190, porcentaje: 10, motivo: 'x'.repeat(600) });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect((await producto()).precio).toBeCloseTo(precioAntes);
    expect(await historial()).toHaveLength(registrosAntes);
  });

  describe('CA3: orden cronológico', () => {
    it('cambios separados en el tiempo se listan del más reciente al más antiguo', async () => {
      for (const porcentaje of [60, 70]) {
        await esperar(1100);
        expect((await cambiarPrecio({ costo: 100, porcentaje, motivo: `Cambio ${porcentaje}` })).status).toBe(200);
      }

      const registros = await historial();
      const fechas = registros.map((r) => Date.parse(r.fecha));
      expect([...fechas].sort((a, b) => b - a)).toEqual(fechas);
      expect(registros.slice(0, 2).map((r) => r.precioNuevo)).toEqual([170, 160]);
    });

    it('dos cambios en el mismo segundo también quedan en el orden en que se hicieron', async () => {
      await esperar(1100);
      await cambiarPrecio({ costo: 100, porcentaje: 80, motivo: 'Rápido 1' });
      await cambiarPrecio({ costo: 100, porcentaje: 90, motivo: 'Rápido 2' });

      const registros = await historial();
      expect(registros.slice(0, 2).map((r) => r.motivo)).toEqual(['Rápido 2', 'Rápido 1']);
    });
  });

  it('cuidado 3: el cambio masivo (CR-006) también registra historial por producto', async () => {
    const antes = (await historial()).length;
    const preview = await http().patch('/api/cambio-precios/aplicar-cambios').set(auth())
      .send({ items: [{ id: productoId }], valor: 1, tipoActualizacion: 'MONTO' });
    expect(preview.status).toBe(200);

    const guardado = await http().patch('/api/cambio-precios/guardar-cambios').set(auth())
      .send({ items: preview.body, usuarioCreatedId: usuarioId });

    expect(guardado.status).toBe(200);
    expect(await historial()).toHaveLength(antes + 1);
  });
});
