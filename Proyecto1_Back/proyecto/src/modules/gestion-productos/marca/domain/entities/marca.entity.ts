export interface MarcaCreateParams {
  denominacion: string;
  observacion: string | null;
  usuarioCreatedId: number;
}

export interface MarcaReconstituteParams {
  id: number;
  denominacion: string;
  observacion: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  usuarioCreatedId: number | null;
  usuarioUpdatedId: number | null;
  usuarioDeletedId: number | null;
  sistema: number;
}

export class Marca {
  private constructor(
    private id: number | null,
    private denominacion: string,
    private observacion: string | null,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private usuarioCreatedId: number | null,
    private usuarioUpdatedId: number | null,
    private usuarioDeletedId: number | null,
    private sistema: number,
  ) {}

  /** Fábrica para una Marca NUEVA — valida invariantes de creación. */
  public static create(params: MarcaCreateParams): Marca {
    return new Marca(
      null,
      params.denominacion,
      params.observacion,
      new Date(),
      new Date(),
      null,
      params.usuarioCreatedId,
      null,
      null,
      0,
    );
  }

  /** Fábrica para REHIDRATAR desde persistencia — la usa SOLO el mapper de infraestructura. */
  public static reconstitute(params: MarcaReconstituteParams): Marca {
    return new Marca(
      params.id,
      params.denominacion,
      params.observacion,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
      params.usuarioCreatedId,
      params.usuarioUpdatedId,
      params.usuarioDeletedId,
      params.sistema,
    );
  }

  public actualizarDatos(params: {
    denominacion: string;
    observacion: string | null;
    usuarioUpdatedId: number;
  }): void {
    this.denominacion = params.denominacion;
    this.observacion = params.observacion;
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
