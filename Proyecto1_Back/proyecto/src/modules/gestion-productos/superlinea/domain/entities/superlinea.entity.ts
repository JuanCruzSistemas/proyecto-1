import {
  SuperlineaCreateParams,
  SuperlineaReconstituteParams,
} from './superlinea.types';

import { SuperlineaInvalidaError } from './superlinea-invalida.error';

export class Superlinea {
  private static validarDenominacion(value: string): string {
    if (typeof value !== 'string' || !value.trim()) throw new SuperlineaInvalidaError('La denominación es obligatoria.');
    const normalizada = value.trim();
    if (normalizada.length > 255) throw new SuperlineaInvalidaError('La denominación admite hasta 255 caracteres.');
    return normalizada;
  }

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

  public static create(params: SuperlineaCreateParams): Superlinea {
    const ahora = new Date();

    return new Superlinea(
      null,
      this.validarDenominacion(params.denominacion),
      params.observacion,
      ahora,
      ahora,
      null,
      params.usuarioCreatedId,
      null,
      null,
      0,
    );
  }

  public static reconstitute(
    params: SuperlineaReconstituteParams,
  ): Superlinea {
    return new Superlinea(
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
    this.denominacion = Superlinea.validarDenominacion(params.denominacion);
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
