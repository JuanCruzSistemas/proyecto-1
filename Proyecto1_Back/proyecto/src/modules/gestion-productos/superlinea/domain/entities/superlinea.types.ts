/**superlinea.types.ts describe qué datos tenés que pasarle al código que crea o reconstruye una Superlínea.


* Se usa Al crear una superlínea nueva. Ej.:La persona registra “Bebidas”.
*/
export interface SuperlineaCreateParams {
  denominacion: string;
  observacion: string | null;
  usuarioCreatedId: number;
}

/**
* Se usa Al reconstruir en memoria una superlínea que ya está guardada
* Ej.: El backend consulta “Bebidas” en la base..
*/
export interface SuperlineaReconstituteParams {
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
