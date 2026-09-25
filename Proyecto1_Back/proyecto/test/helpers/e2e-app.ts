import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { GlobalExceptionFilter } from '../../src/modules/common/filters/global-exception.filters';
import { DomainExceptionFilter } from '../../src/modules/common/filters/domain-exception.filter';

/**
 * Levanta la app completa (AppModule + base real) configurada IGUAL que bootstrap() en src/main.ts.
 * Un TestingModule no ejecuta main.ts, así que cualquier diferencia acá (orden de filtros, opciones
 * del ValidationPipe, prefijo) haría que los tests prueben algo distinto de lo que corre en producción.
 * Si se modifica main.ts, actualizar esta función.
 */
export async function crearAppComoMain(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();

  // Los filtros y use-cases loguean mucho; E2E_LOGS=1 los muestra para depurar.
  const app = moduleFixture.createNestApplication<INestApplication<App>>({
    logger: process.env.E2E_LOGS ? undefined : false,
  });

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');
  // Mismo orden que main.ts. Nest evalúa los filtros globales en orden inverso al de registro.
  app.useGlobalFilters(new GlobalExceptionFilter(), new DomainExceptionFilter());

  await app.init();
  return app;
}

export interface Sesion {
  token: string;
  usuarioId: number;
}

/**
 * Login contra /api/auth/login. Por defecto usa el admin del seed (seed-usuario.service.ts);
 * si en la base local cambió la contraseña, se pueden pasar otras credenciales con
 * E2E_MAIL / E2E_PASSWORD (el usuario debe tener rol Administrador).
 */
export async function login(app: INestApplication<App>): Promise<Sesion> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({
      mail: process.env.E2E_MAIL ?? 'admin@gmail.com',
      contrasena: process.env.E2E_PASSWORD ?? 'Administrador1?',
      empresaId: 1,
    });

  if (res.status !== 201) {
    throw new Error(
      `Login e2e falló (${res.status}): ${JSON.stringify(res.body)}. ` +
        'Revisar E2E_MAIL / E2E_PASSWORD o correr los seeds.',
    );
  }
  return { token: res.body.accessToken, usuarioId: res.body.usuario.id };
}

/** Cliente HTTP autenticado sobre la app de test. */
export function api(app: INestApplication<App>, token: string) {
  const server = app.getHttpServer();
  const auth = { Authorization: `Bearer ${token}` };
  return {
    get: (url: string) => request(server).get(url).set(auth),
    post: (url: string, body: object) => request(server).post(url).set(auth).send(body),
    put: (url: string, body: object) => request(server).put(url).set(auth).send(body),
    delete: (url: string) => request(server).delete(url).set(auth),
  };
}

export type Api = ReturnType<typeof api>;

/** Marca y Línea activas, que no sean del sistema, tomadas de los selectores reales. */
export interface MarcaYLinea {
  marcaId: number;
  marcaDenominacion: string;
  lineaId: number;
  lineaDenominacion: string;
}

export async function obtenerMarcaYLinea(cliente: Api): Promise<MarcaYLinea> {
  const marcas = await cliente.get('/api/producto/find-all-for-marcas/select?denominacion=');
  const lineas = await cliente.get('/api/producto/find-all-for-lineas/select?denominacion=');

  const marca = marcas.body.data?.find((m: { sistema?: number }) => m.sistema !== 1);
  const linea = lineas.body.data?.find((l: { sistema?: number }) => l.sistema !== 1);
  if (!marca || !linea) {
    throw new Error(
      'La base no tiene Marca y Línea activas no-sistema para usar en los tests e2e. ' +
        `Marcas: ${marcas.status} ${JSON.stringify(marcas.body)} / Líneas: ${lineas.status} ${JSON.stringify(lineas.body)}`,
    );
  }
  return {
    marcaId: marca.id,
    marcaDenominacion: marca.denominacion,
    lineaId: linea.id,
    lineaDenominacion: linea.denominacion,
  };
}

/** POST/PUT de Presentación responden solo { mensaje }; el id se obtiene buscando por denominación. */
export async function buscarPresentacionPorDenominacion(cliente: Api, denominacion: string) {
  const res = await cliente.get(`/api/presentacion?denominacion=${encodeURIComponent(denominacion)}&take=50`);
  return (res.body.data ?? []).find((p: { denominacion: string }) => p.denominacion === denominacion.toUpperCase());
}

/** POST de Producto responde solo { mensaje }; se ubica por un texto único contenido en la denominación. */
export async function buscarProductosPorDenominacion(cliente: Api, texto: string) {
  const res = await cliente.get(`/api/producto/search-by?denominacion=${encodeURIComponent(texto)}&take=50`);
  return (res.body.data ?? []) as Array<{ id: number; denominacion: string }>;
}

/**
 * Baja (lógica, vía API) de los productos y presentaciones creados por un archivo de test.
 * Cada baja es independiente: si una falla se sigue con las demás y se informa al final,
 * para no dejar datos de prueba activos aunque algún test intermedio haya fallado.
 */
export async function limpiarDatosDePrueba(
  cliente: Api,
  usuarioId: number,
  datos: { productos: number[]; presentaciones: number[] },
): Promise<void> {
  const errores: string[] = [];
  const baja = async (url: string) => {
    try {
      const res = await cliente.delete(`${url}?usuarioId=${usuarioId}`);
      if (res.status !== 200 && res.status !== 404) errores.push(`${url} → ${res.status} ${JSON.stringify(res.body)}`);
    } catch (e) {
      errores.push(`${url} → ${(e as Error).message}`);
    }
  };

  // Productos primero: una presentación con productos activos no se puede dar de baja.
  for (const id of datos.productos) await baja(`/api/producto/${id}`);
  for (const id of datos.presentaciones) await baja(`/api/presentacion/${id}`);

  if (errores.length) {
    console.warn(`Limpieza e2e incompleta:\n  ${errores.join('\n  ')}`);
  }
}
