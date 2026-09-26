export interface LineaCreateParams {
    denominacion: string;
    superlineaId: number;
    observacion: string | null;
    utilizaStockMinimo: boolean;
    stockMinimo: number;
    usuarioCreatedId: number;
}

export interface LineaReconstituteParams {
    id: number;
    denominacion: string;
    superlineaId: number;
    observacion: string | null;
    utilizaStockMinimo: boolean;
    stockMinimo: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    usuarioCreatedId: number | null;
    usuarioUpdatedId: number | null;
    usuarioDeletedId: number | null;
    sistema: number;
}