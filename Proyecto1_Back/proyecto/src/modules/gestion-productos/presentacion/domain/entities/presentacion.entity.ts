import { PresentacionActualizarDatosParams, PresentacionCreateParams, PresentacionReconstituteParams } from "../inputs/presentacion.types";

export class Presentacion {
    private constructor(
        private id: number | null,
        private denominacion: string,
        private observacion: string | null,
        private createdAt: Date,
        private updatedAt: Date,
        private deletedAt: Date | null,
        private usuarioCreatedId: number | null,
        private usuarioUpdatedId: number | null,
        private usuarioDeletedId: number | null
    ) {}

    /**
     * Fábrica para una Presentacion NUEVA, valida invariantes.
     */
    public static create(params: PresentacionCreateParams): Presentacion {
        return new Presentacion(
            null,
            params.denominacion,
            params.observacion,
            new Date(),
            new Date(),
            null,
            params.usuarioCreatedId,
            null,
            null
        );
    }

    /**
     * Fábrica para REHIDRATAR desde persistencia.
     */
    public static reconstitute(params: PresentacionReconstituteParams): Presentacion {
        return new Presentacion(
            params.id,
            params.denominacion,
            params.observacion,
            params.createdAt,
            params.updatedAt,
            params.deletedAt,
            params.usuarioCreatedId,
            params.usuarioUpdatedId,
            params.usuarioDeletedId
        );
    }

    public actualizarDatos(params: PresentacionActualizarDatosParams): void {        
        this.denominacion = params.denominacion;
        this.observacion = params.observacion;
        this.usuarioUpdatedId = params.usuarioUpdatedId;
        this.updatedAt = new Date();
    }
    
    public marcarComoEliminado(usuarioDeletedId: number): void {
        this.usuarioDeletedId = usuarioDeletedId;
        this.deletedAt = new Date();
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
}