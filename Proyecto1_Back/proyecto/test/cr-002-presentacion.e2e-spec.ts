import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import {
  Api,
  api,
  buscarPresentacionPorDenominacion,
  buscarProductosPorDenominacion,
  crearAppComoMain,
  limpiarDatosDePrueba,
  login,
  obtenerMarcaYLinea,
} from './helpers/e2e-app';

// CR-002 — Presentación: gestor completo (alta, edición, baja) y la regla de negocio
// central: no se puede eliminar una Presentación que está en uso por un producto activo.
// Corre contra la app real y la base de desarrollo (ver .env).

describe('Presentación (e2e) — CR-002', () => {
  let app: INestApplication<App>;
  let cliente: Api;
  let usuarioId: number;
  let marcaId: number;
  let lineaId: number;
  let presentacionId: number;
  let productoId: number;

  const creados = { productos: [] as number[], presentaciones: [] as number[] };

  // Única por corrida. El DTO solo admite letras, números y espacios; el pipe la guarda en mayúsculas.
  const denominacion = `test cr002 ${Date.now()}`;
  const denominacionGuardada = denominacion.toUpperCase();

  beforeAll(async () => {
    app = await crearAppComoMain();
    const sesion = await login(app);
    usuarioId = sesion.usuarioId;
    cliente = api(app, sesion.token);
    ({ marcaId, lineaId } = await obtenerMarcaYLinea(cliente));
  });

  afterAll(async () => {
    try {
      if (cliente) await limpiarDatosDePrueba(cliente, usuarioId, creados);
    } finally {
      await app?.close();
    }
  });

  it('POST /presentacion — da de alta una presentación nueva', async () => {
    const res = await cliente.post('/api/presentacion', {
      denominacion,
      observacion: 'creada por test e2e',
      usuarioCreatedId: usuarioId,
    });

    expect(res.status).toBe(201);
    expect(res.body.mensaje).toContain(denominacionGuardada);

    const creada = await buscarPresentacionPorDenominacion(cliente, denominacion);
    expect(creada).toBeDefined();
    presentacionId = creada.id;
    creados.presentaciones.push(presentacionId);
  });

  it('GET /presentacion/:id — devuelve la presentación con la denominación normalizada', async () => {
    const res = await cliente.get(`/api/presentacion/${presentacionId}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: presentacionId,
      denominacion: denominacionGuardada,
      observacion: 'creada por test e2e',
      deletedAt: null,
    });
  });

  it('POST /presentacion — rechaza una denominación duplicada (409)', async () => {
    const res = await cliente.post('/api/presentacion', { denominacion, usuarioCreatedId: usuarioId });

    expect(res.status).toBe(409);
  });

  it('POST /presentacion — rechaza una denominación con caracteres inválidos (400)', async () => {
    const res = await cliente.post('/api/presentacion', {
      denominacion: 'pack-x6',
      usuarioCreatedId: usuarioId,
    });

    expect(res.status).toBe(400);
  });

  it('GET /presentacion/listado — incluye la presentación recién creada', async () => {
    const res = await cliente.get('/api/presentacion/listado');

    expect(res.status).toBe(200);
    expect(res.body.some((p: { id: number }) => p.id === presentacionId)).toBe(true);
  });

  it('PUT /presentacion/:id — actualiza la observación', async () => {
    const res = await cliente.put(`/api/presentacion/${presentacionId}`, {
      observacion: 'actualizada por test',
      usuarioUpdatedId: usuarioId,
    });

    expect(res.status).toBe(200);

    const actualizada = await cliente.get(`/api/presentacion/${presentacionId}`);
    expect(actualizada.body.observacion).toBe('actualizada por test');
    expect(actualizada.body.denominacion).toBe(denominacionGuardada);
  });

  it('la presentación queda disponible para asociarse a un producto', async () => {
    const res = await cliente.post('/api/producto', {
      marcaId,
      lineaId,
      presentacionId,
      costo: 100,
      porcentaje: 20,
      utilizaStockMinimo: false,
      utilizaPack: false,
      usuarioCreatedId: usuarioId,
    });
    expect(res.status).toBe(201);

    const [producto] = await buscarProductosPorDenominacion(cliente, denominacionGuardada);
    expect(producto).toBeDefined();
    productoId = producto.id;
    creados.productos.push(productoId);

    const detalle = await cliente.get(`/api/producto/${productoId}`);
    expect(detalle.status).toBe(200);
    expect(detalle.body.presentacion).toEqual({ id: presentacionId, denominacion: denominacionGuardada });
  });

  it('DELETE /presentacion/:id — lo impide si hay un producto activo asociado (409)', async () => {
    const res = await cliente.delete(`/api/presentacion/${presentacionId}?usuarioId=${usuarioId}`);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('No se puede eliminar la presentación porque está asociada a productos activos.');

    const sigue = await cliente.get(`/api/presentacion/${presentacionId}`);
    expect(sigue.body.deletedAt).toBeNull();
  });

  it('DELETE /presentacion/:id — la elimina una vez que ya no está en uso', async () => {
    const bajaProducto = await cliente.delete(`/api/producto/${productoId}?usuarioId=${usuarioId}`);
    expect(bajaProducto.status).toBe(200);

    const res = await cliente.delete(`/api/presentacion/${presentacionId}?usuarioId=${usuarioId}`);
    expect(res.status).toBe(200);

    const listado = await cliente.get('/api/presentacion/listado');
    expect(listado.body.some((p: { id: number }) => p.id === presentacionId)).toBe(false);
  });
});
