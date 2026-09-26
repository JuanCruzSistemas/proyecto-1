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
  MarcaYLinea,
  obtenerMarcaYLinea,
} from './helpers/e2e-app';

// CR-005 — Denominación automática de Producto (Marca + Línea + Presentación),
// con la posibilidad de editarla a mano en cualquier momento. Cubre los 4 CA
// ya probados a nivel de entidad en producto.entity.spec.ts, pero acá contra
// el endpoint HTTP real — con el DTO, los pipes, el ValidationPipe y los filtros
// de excepciones configurados como en main.ts, y la base de desarrollo.

describe('Denominación automática de Producto (e2e) — CR-005', () => {
  let app: INestApplication<App>;
  let cliente: Api;
  let usuarioId: number;
  let ml: MarcaYLinea;

  const creados = { productos: [] as number[], presentaciones: [] as number[] };
  const sufijo = Date.now();

  /** Crea una Presentación propia (única por corrida) y devuelve id + denominación guardada. */
  const crearPresentacion = async (nombre: string) => {
    const denominacion = `test cr005 ${nombre} ${sufijo}`;
    const res = await cliente.post('/api/presentacion', { denominacion, usuarioCreatedId: usuarioId });
    expect(res.status).toBe(201);

    const presentacion = await buscarPresentacionPorDenominacion(cliente, denominacion);
    creados.presentaciones.push(presentacion.id);
    return { id: presentacion.id as number, denominacion: presentacion.denominacion as string };
  };

  const payloadProducto = (extra: object = {}) => ({
    marcaId: ml.marcaId,
    lineaId: ml.lineaId,
    costo: 100,
    porcentaje: 20,
    utilizaStockMinimo: false,
    utilizaPack: false,
    usuarioCreatedId: usuarioId,
    ...extra,
  });

  /** POST /producto responde solo { mensaje }: se ubica el producto por un texto único de su denominación. */
  const crearProducto = async (textoUnico: string, extra: object = {}) => {
    const res = await cliente.post('/api/producto', payloadProducto(extra));
    expect(res.status).toBe(201);

    const encontrados = await buscarProductosPorDenominacion(cliente, textoUnico);
    expect(encontrados).toHaveLength(1);
    creados.productos.push(encontrados[0].id);
    return encontrados[0].id;
  };

  const obtenerProducto = async (id: number) => {
    const res = await cliente.get(`/api/producto/${id}`);
    expect(res.status).toBe(200);
    return res.body;
  };

  const denominacionEsperada = (presentacion: string) =>
    `${ml.marcaDenominacion} ${ml.lineaDenominacion} ${presentacion}`;

  let presentacion: { id: number; denominacion: string };

  beforeAll(async () => {
    app = await crearAppComoMain();
    const sesion = await login(app);
    usuarioId = sesion.usuarioId;
    cliente = api(app, sesion.token);
    ml = await obtenerMarcaYLinea(cliente);

    // Presentación propia para este archivo, para no depender de datos de otro test.
    presentacion = await crearPresentacion('base');
  });

  afterAll(async () => {
    try {
      if (cliente) await limpiarDatosDePrueba(cliente, usuarioId, creados);
    } finally {
      await app?.close();
    }
  });

  it('CA1 — al crear sin denominación, se autogenera como Marca + Línea + Presentación', async () => {
    const id = await crearProducto(presentacion.denominacion, { presentacionId: presentacion.id });

    const producto = await obtenerProducto(id);
    expect(producto.denominacion).toBe(denominacionEsperada(presentacion.denominacion));
    expect(producto.denominacionEditadaManualmente).toBe(false);
  });

  it('CA4 — sin Presentación, no se puede generar la denominación automática (422)', async () => {
    const res = await cliente.post('/api/producto', payloadProducto());

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'No se puede generar la denominación automática: falta asignar una Presentación al producto.',
    );

    // No debe haberse creado nada con esa combinación.
    const sinPresentacion = await buscarProductosPorDenominacion(cliente, `${ml.marcaDenominacion} ${ml.lineaDenominacion}`);
    expect(sinPresentacion.every((p) => p.denominacion.trim() !== `${ml.marcaDenominacion} ${ml.lineaDenominacion}`)).toBe(true);
  });

  it('CA2 — si se edita la denominación a mano, se respeta y no se pisa en updates posteriores', async () => {
    const otraPresentacion = await crearPresentacion('ca2');
    const manual = `manual cr005 ${sufijo}`;
    const id = await crearProducto(manual.toUpperCase(), { presentacionId: presentacion.id, denominacion: manual });

    const creado = await obtenerProducto(id);
    expect(creado.denominacion).toBe(manual.toUpperCase());
    expect(creado.denominacionEditadaManualmente).toBe(true);

    // Update de otro campo, sin mandar denominacion.
    const precio = await cliente.put(`/api/producto/${id}`, { costo: 150, usuarioUpdatedId: usuarioId });
    expect(precio.status).toBe(200);

    // Ni siquiera cambiando la Presentación se regenera.
    const presentacionCambiada = await cliente.put(`/api/producto/${id}`, {
      presentacionId: otraPresentacion.id,
      usuarioUpdatedId: usuarioId,
    });
    expect(presentacionCambiada.status).toBe(200);

    const actualizado = await obtenerProducto(id);
    expect(actualizado.costo).toBe(150);
    expect(actualizado.presentacion.id).toBe(otraPresentacion.id);
    expect(actualizado.denominacion).toBe(manual.toUpperCase());
    expect(actualizado.denominacionEditadaManualmente).toBe(true);
  });

  it('CA2 — un producto con denominación automática se puede editar a mano en cualquier momento', async () => {
    const auto = await crearPresentacion('editable');
    const id = await crearProducto(auto.denominacion, { presentacionId: auto.id });
    const manual = `renombrado cr005 ${sufijo}`;

    const res = await cliente.put(`/api/producto/${id}`, { denominacion: manual, usuarioUpdatedId: usuarioId });

    expect(res.status).toBe(200);
    const actualizado = await obtenerProducto(id);
    expect(actualizado.denominacion).toBe(manual.toUpperCase());
    expect(actualizado.denominacionEditadaManualmente).toBe(true);
  });

  it('CA3 — si nunca se editó a mano, cambiar la Presentación regenera la denominación', async () => {
    const original = await crearPresentacion('ca3 original');
    const nueva = await crearPresentacion('ca3 nueva');
    const id = await crearProducto(original.denominacion, { presentacionId: original.id });
    expect((await obtenerProducto(id)).denominacion).toBe(denominacionEsperada(original.denominacion));

    const res = await cliente.put(`/api/producto/${id}`, { presentacionId: nueva.id, usuarioUpdatedId: usuarioId });

    expect(res.status).toBe(200);
    const actualizado = await obtenerProducto(id);
    expect(actualizado.denominacion).toBe(denominacionEsperada(nueva.denominacion));
    expect(actualizado.denominacionEditadaManualmente).toBe(false);
  });

  it('CA3 — si nunca se editó a mano, cambiar la Marca y la Línea también regenera la denominación', async () => {
    const marcas = await cliente.get('/api/producto/find-all-for-marcas/select?denominacion=');
    const lineas = await cliente.get('/api/producto/find-all-for-lineas/select?denominacion=');
    const otraMarca = marcas.body.data.find((m: { id: number; sistema?: number }) => m.id !== ml.marcaId && m.sistema !== 1);
    const otraLinea = lineas.body.data.find((l: { id: number; sistema?: number }) => l.id !== ml.lineaId && l.sistema !== 1);
    if (!otraMarca || !otraLinea) {
      throw new Error('Se necesitan al menos 2 Marcas y 2 Líneas activas no-sistema para este caso.');
    }

    const pres = await crearPresentacion('ca3 marca linea');
    const id = await crearProducto(pres.denominacion, { presentacionId: pres.id });

    const res = await cliente.put(`/api/producto/${id}`, {
      marcaId: otraMarca.id,
      lineaId: otraLinea.id,
      usuarioUpdatedId: usuarioId,
    });

    expect(res.status).toBe(200);
    const actualizado = await obtenerProducto(id);
    expect(actualizado.denominacion).toBe(`${otraMarca.denominacion} ${otraLinea.denominacion} ${pres.denominacion}`);
    expect(actualizado.denominacionEditadaManualmente).toBe(false);
  });
});
