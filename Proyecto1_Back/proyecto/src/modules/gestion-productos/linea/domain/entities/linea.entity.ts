import { LineaCreateParams, LineaReconstituteParams } from "./linea.types";
import { DenominacionRequeridaException } from "../exceptions/denominacion-requerida.exception";
import { StockMinimoInvalidoException } from "../exceptions/stock-minimo-invalido.exception";

export class Linea {
  private constructor(
    private id: number | null,
    private denominacion: string,
    private observacion: string | null,
    private utilizaStockMinimo: boolean,
    private stockMinimo: number,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private usuarioCreatedId: number | null,
    private usuarioUpdatedId: number | null,
    private usuarioDeletedId: number | null,
    private sistema: number
  ) {}

  /**
   * Fábrica para una Línea NUEVA, valida invariantes
   */
  public static create(params: LineaCreateParams): Linea {
    if (!params.denominacion || params.denominacion.trim().length === 0) {
      throw new DenominacionRequeridaException();
    }

    if (params.stockMinimo < 0) {
      throw new StockMinimoInvalidoException(params.stockMinimo);
    }

    return new Linea(
      null,
      params.denominacion,
      params.observacion,
      params.utilizaStockMinimo,
      params.stockMinimo,
      new Date(),
      new Date(),
      null,
      params.usuarioCreatedId,
      null,
      null,
      0
    );
  }

  /**
   * Fábrica para REHIDRATAR desde persistencia, la usa el mapper de infraestructura.
   */
  public static reconstitute(params: LineaReconstituteParams): Linea {
    return new Linea(
      params.id,
      params.denominacion,
      params.observacion,
      params.utilizaStockMinimo,
      params.stockMinimo,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
      params.usuarioCreatedId,
      params.usuarioUpdatedId,
      params.usuarioDeletedId,
      params.sistema
    );
  }

  public actualizarDatos(params: {
    denominacion: string;
    observacion: string | null;
    utilizaStockMinimo: boolean;
    stockMinimo: number;
    usuarioUpdatedId: number;
  }): void {
    if (!params.denominacion || params.denominacion.trim().length === 0) {
      throw new DenominacionRequeridaException();
    }

    if (params.stockMinimo < 0) {
      throw new StockMinimoInvalidoException(params.stockMinimo);
    }

    this.denominacion = params.denominacion;
    this.observacion = params.observacion;
    this.utilizaStockMinimo = params.utilizaStockMinimo;
    this.stockMinimo = params.stockMinimo;
    this.usuarioUpdatedId = params.usuarioUpdatedId;
    this.updatedAt = new Date();
  }

  public marcarComoEliminado(usuarioDeletedId: number): void {
    this.deletedAt = new Date();
    this.usuarioDeletedId = usuarioDeletedId;
  }

  public getId(): number | null {
    return this.id;
  }

  public getDenominacion(): string {
    return this.denominacion;
  }

  public getObservacion(): string | null {
    return this.observacion;
  }

  public getUtilizaStockMinimo(): boolean {
    return this.utilizaStockMinimo;
  }

  public getStockMinimo(): number {
    return this.stockMinimo;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  public getUsuarioCreatedId(): number | null {
    return this.usuarioCreatedId;
  }

  public getUsuarioUpdatedId(): number | null {
    return this.usuarioUpdatedId;
  }

  public getUsuarioDeletedId(): number | null {
    return this.usuarioDeletedId;
  }

  public getSistema(): number {
    return this.sistema;
  }
}
