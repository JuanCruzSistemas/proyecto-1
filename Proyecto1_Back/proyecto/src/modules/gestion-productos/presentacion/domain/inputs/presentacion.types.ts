/**
 * Datos necesarios para dar de alta una Presentacion nuevo.
 */
export interface PresentacionCreateParams {
    denominacion: string;
    observacion: string | null;
    usuarioCreatedId: number;
}

/**
 * Datos para rehidratar una Presentacion ya persistida. Uso exclusivo para el mapper de infraestructura.
 */
export interface PresentacionReconstituteParams {
    id: number;
    denominacion: string;
    observacion: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    usuarioCreatedId: number | null;
    usuarioUpdatedId: number | null;
    usuarioDeletedId: number | null
}

/**
 * Datos editables de una Presentacion ya existente
 */
export interface PresentacionActualizarDatosParams {
    denominacion: string;
    observacion: string | null;
    usuarioUpdatedId: number;
}
