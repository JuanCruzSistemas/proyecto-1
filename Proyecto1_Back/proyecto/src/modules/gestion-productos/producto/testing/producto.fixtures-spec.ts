/**
 * Fixtures compartidos por los specs de Producto (application / infraestructure).
 * El sufijo `-spec.ts` lo excluye del build (tsconfig.build: "**\/*spec.ts") y, al no terminar
 * en `.spec.ts`, Jest no lo ejecuta como suite.
 */
import { Linea } from '../../linea/domain/entities/linea.entity';
import { Marca } from '../../marca/domain/entities/marca.entity';
import { Presentacion } from '../../presentacion/domain/entities/presentacion.entity';
import { LineaEntity } from '../../linea/infraestructure/persistence/entities/linea.orm-entity';
import { MarcaEntity } from '../../marca/infraestructure/persistence/entities/marca.orm-entity';
import { PresentacionEntity } from '../../presentacion/infraestructure/persistence/entities/presentacion.orm-entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Producto } from '../domain/entities/producto.entity';
import { ProductoFactory } from '../domain/factories/producto.factory';
import { ProductoReconstituteParams } from '../domain/inputs/producto.types';
import { ProductoEntity } from '../infraestructure/persistence/entities/producto.orm-entity';

const FECHA = new Date('2026-01-15T10:00:00Z');

export const crearUsuario = (id = 1, denominacion = 'Admin'): Usuario =>
  ({ id, denominacion } as unknown as Usuario);

export const crearLinea = (id = 10, denominacion = 'ACEITES', sistema = 0): Linea =>
  Linea.reconstitute({
    id,
    superlineaId: 1,
    denominacion,
    observacion: null,
    utilizaStockMinimo: false,
    stockMinimo: 0,
    createdAt: FECHA,
    updatedAt: FECHA,
    deletedAt: null,
    usuarioCreatedId: 1,
    usuarioUpdatedId: null,
    usuarioDeletedId: null,
    sistema,
  });

export const crearMarca = (id = 20, denominacion = 'NATURA', sistema = 0): Marca =>
  Marca.reconstitute({
    id,
    denominacion,
    observacion: null,
    createdAt: FECHA,
    updatedAt: FECHA,
    deletedAt: null,
    usuarioCreatedId: 1,
    usuarioUpdatedId: null,
    usuarioDeletedId: null,
    sistema,
  });

export const crearPresentacion = (id = 30, denominacion = '1L'): Presentacion =>
  Presentacion.reconstitute({
    id,
    denominacion,
    observacion: null,
    createdAt: FECHA,
    updatedAt: FECHA,
    deletedAt: null,
    usuarioCreatedId: 1,
    usuarioUpdatedId: null,
    usuarioDeletedId: null,
  });

/** Producto persistido (con id), listo para usar como resultado de un repositorio. */
export const crearProducto = (overrides: Partial<ProductoReconstituteParams> = {}): Producto =>
  ProductoFactory.reconstitute({
    id: 100,
    denominacion: 'NATURA ACEITES 1L',
    codigoBarra: '7790001',
    proveedor: null,
    codigoProveedor: 'NAT-1',
    stock: 10,
    utilizaStockMinimo: true,
    utilizaStockMinimoPorEmpresa: false,
    stockMinimo: 2,
    costo: 100,
    margen: 0.3,
    fechaCosto: FECHA,
    destacado: false,
    envioGratis: false,
    observacion: null,
    createdAt: FECHA,
    updatedAt: null,
    deletedAt: null,
    usuarioCreated: crearUsuario(),
    usuarioUpdated: null,
    usuarioDeleted: null,
    linea: crearLinea(),
    marca: crearMarca(),
    presentacion: crearPresentacion(),
    utilizaPack: false,
    cantidadPorPack: null,
    imagen: null,
    ubicacion: null,
    movimientosStock: [],
    sistema: 0,
    codigoReferencia: null,
    denominacionEditadaManualmente: false,
    ...overrides,
  });

export const crearLineaOrm = (id = 10, denominacion = 'ACEITES'): LineaEntity =>
  Object.assign(new LineaEntity(), {
    id,
    superlineaId: 1,
    denominacion,
    utilizaStockMinimo: false,
    stockMinimo: 0,
    createdAt: FECHA,
    updatedAt: FECHA,
    sistema: 0,
  });

export const crearMarcaOrm = (id = 20, denominacion = 'NATURA'): MarcaEntity =>
  Object.assign(new MarcaEntity(), { id, denominacion, createdAt: FECHA, updatedAt: FECHA, sistema: 0 });

export const crearPresentacionOrm = (id = 30, denominacion = '1L'): PresentacionEntity =>
  Object.assign(new PresentacionEntity(), { id, denominacion, createdAt: FECHA, updatedAt: FECHA });

/** Fila ORM de producto tal como la devuelve TypeORM (porcentaje en %, relaciones cargadas). */
export const crearProductoOrm = (overrides: Partial<ProductoEntity> = {}): ProductoEntity =>
  Object.assign(new ProductoEntity(), {
    id: 100,
    denominacion: 'NATURA ACEITES 1L',
    codigoBarra: '7790001',
    codigoProveedor: 'NAT-1',
    stock: 10,
    utilizaStockMinimo: true,
    utilizaStockMinimoPorEmpresa: false,
    stockMinimo: 2,
    costo: 100,
    precio: 130,
    porcentaje: 30,
    fechaCosto: FECHA,
    destacado: false,
    envioGratis: false,
    createdAt: FECHA,
    updatedAt: FECHA,
    usuarioCreated: crearUsuario(),
    linea: crearLineaOrm(),
    marca: crearMarcaOrm(),
    presentacion: crearPresentacionOrm(),
    denominacionEditadaManualmente: false,
    utilizaPack: false,
    cantidadPorPack: null,
    movimientosStock: [],
    sistema: 0,
    ...overrides,
  });
