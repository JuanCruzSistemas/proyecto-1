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