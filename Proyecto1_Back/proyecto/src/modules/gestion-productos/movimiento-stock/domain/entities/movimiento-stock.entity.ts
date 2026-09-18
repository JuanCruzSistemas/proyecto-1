import { MovimientoStockCreateParams, MovimientoStockReconstituteParams } from "./movimiento-stock.types";

export class MovimientoStock {
  private constructor(
    private id: number | null,
    private productoId: number,
    private operacionId: number,
    private tipoOperacion: string,
    private creadoEn: Date
  ) {}

  public static create(params: MovimientoStockCreateParams): MovimientoStock {
    return new MovimientoStock(
      null,
      params.productoId,
      params.operacionId,
      params.tipoOperacion,
      new Date()
    );
  }

  public static reconstitute(params: MovimientoStockReconstituteParams): MovimientoStock {
    return new MovimientoStock(
      params.id,
      params.productoId,
      params.operacionId,
      params.tipoOperacion,
      params.creadoEn
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
