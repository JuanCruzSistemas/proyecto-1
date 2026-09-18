/**
 * Entidad de dominio de MovimientoStock — separada de su forma ORM (ver
 * MODIFICACIONES.md, Tarea 3). Cubre únicamente los campos que ya existían en la
 * entidad ORM (`id`, `productoId`, `operacionId`, `tipoOperacion`, `creadoEn`).
 *
 * Pendiente (no implementado en esta tarea, ver sección "Pendiente" de
 * MODIFICACIONES.md): los campos documentados en el Análisis de Dominio que todavía
 * faltan (`cantidad`, `motivo`, `tipoMovimiento` enumerado) y la migración de base de
 * datos que los agregaría a la tabla `producto_operacion`.
 */
export interface MovimientoStockCreateParams {
  productoId: number;
  operacionId: number;
  tipoOperacion: string;
}

export interface MovimientoStockReconstituteParams {
  id: number;
  productoId: number;
  operacionId: number;
  tipoOperacion: string;
  creadoEn: Date;
}

export class MovimientoStock {
  private constructor(
    private id: number | null,
    private productoId: number,
    private operacionId: number,
    private tipoOperacion: string,
    private creadoEn: Date,
  ) {}

  public static create(params: MovimientoStockCreateParams): MovimientoStock {
    return new MovimientoStock(
      null,
      params.productoId,
      params.operacionId,
      params.tipoOperacion,
      new Date(),
    );
  }

  public static reconstitute(params: MovimientoStockReconstituteParams): MovimientoStock {
    return new MovimientoStock(
      params.id,
      params.productoId,
      params.operacionId,
      params.tipoOperacion,
      params.creadoEn,
    );
  }

  public getId(): number | null {
    return this.id;
  }

  public getProductoId(): number {
    return this.productoId;
  }

  public getOperacionId(): number {
    return this.operacionId;
  }

  public getTipoOperacion(): string {
    return this.tipoOperacion;
  }

  public getCreadoEn(): Date {
    return this.creadoEn;
  }
}
