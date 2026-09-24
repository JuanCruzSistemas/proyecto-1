import { Superlinea } from '../entities/superlinea.entity';

export const SUPERLINEA_REPOSITORY = 'ISuperlineaRepository'; /**Define las operaciones de persistencia.*/

export interface ISuperlineaRepository {
  findActive(id: number): Promise<Superlinea | null>;
  listActive(): Promise<Superlinea[]>;
  save(entity: Superlinea): Promise<Superlinea>;
  /** Comprueba líneas activas y realiza la baja dentro de una misma transacción. */
  removeIfUnused(id: number, usuarioId: number): Promise<void>;
}
