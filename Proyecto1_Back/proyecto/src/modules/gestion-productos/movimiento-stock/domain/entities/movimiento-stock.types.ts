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