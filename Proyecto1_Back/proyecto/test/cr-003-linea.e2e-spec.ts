import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Api, api, crearAppComoMain, login } from './helpers/e2e-app';

/**
 * CR-003 — Línea. Prueba HTTP real: DTO + pipes + guard + controlador + caso de uso + TypeORM.
 * Usa una Línea propia y realiza baja lógica al finalizar para no dejar datos activos.
 */
describe('Línea (e2e) — CR-003', () => {
  let app: INestApplication<App>;
  let cliente: Api;
  let usuarioId: number;
  let superlineaId: number;
  let lineaId: number;
  const denominacion = `test linea ${Date.now()}`;

  beforeAll(async () => {
    app = await crearAppComoMain();
    const sesion = await login(app);
    usuarioId = sesion.usuarioId;
    cliente = api(app, sesion.token);

    const superlineas = await cliente.get('/api/superlinea');
    expect(superlineas.status).toBe(200);
    const activa = superlineas.body.find((item: { sistema?: number }) => item.sistema !== 1) ?? superlineas.body[0];
    if (!activa) throw new Error('Se necesita una SuperLínea activa para ejecutar CR-003 e2e.');
    superlineaId = activa.id;
  });

  afterAll(async () => {
    try {
      if (cliente && lineaId) await cliente.delete(`/api/linea/${lineaId}?usuarioId=${usuarioId}`);
    } finally {
      await app?.close();
    }
  });

  it('POST /linea rechaza crear una Línea sin SuperLínea (400)', async () => {
    const res = await cliente.post('/api/linea', {
      denominacion, utilizaStockMinimo: false, stockMinimo: 0, usuarioCreatedId: usuarioId,
    });
    expect(res.status).toBe(400);
  });

  it('POST /linea crea una Línea asociada a una SuperLínea activa', async () => {
    const res = await cliente.post('/api/linea', {
      denominacion, superlineaId, utilizaStockMinimo: true, stockMinimo: 3, usuarioCreatedId: usuarioId,
    });
    expect(res.status).toBe(201);

    const busqueda = await cliente.get(`/api/linea/search-by?denominacion=${encodeURIComponent(denominacion)}&skip=0&take=10`);
    expect(busqueda.status).toBe(200);
    const creada = busqueda.body.data.find((item: { denominacion: string }) => item.denominacion === denominacion.toUpperCase());
    expect(creada).toMatchObject({ superlineaId, stockMinimo: 3, utilizaStockMinimo: true });
    lineaId = creada.id;
  });

  it('POST /linea impide reutilizar la denominación, incluso normalizada (409)', async () => {
    const res = await cliente.post('/api/linea', {
      denominacion: ` ${denominacion.toUpperCase()} `, superlineaId, utilizaStockMinimo: false,
      stockMinimo: 0, usuarioCreatedId: usuarioId,
    });
    expect(res.status).toBe(409);
  });

  it('PUT /linea/:id conserva la asociación y actualiza atributos permitidos', async () => {
    const res = await cliente.put(`/api/linea/${lineaId}`, {
      observacion: 'editada por prueba e2e', utilizaStockMinimo: true, stockMinimo: 5, usuarioUpdatedId: usuarioId,
    });
    expect(res.status).toBe(200);
    const detalle = await cliente.get(`/api/linea/${lineaId}`);
    expect(detalle.status).toBe(200);
    expect(detalle.body).toMatchObject({ superlineaId, stockMinimo: 5, observacion: 'editada por prueba e2e' });
  });

  it('DELETE /linea/:id realiza baja lógica cuando no tiene productos activos', async () => {
    const res = await cliente.delete(`/api/linea/${lineaId}?usuarioId=${usuarioId}`);
    expect(res.status).toBe(200);
    lineaId = 0;
  });
});
