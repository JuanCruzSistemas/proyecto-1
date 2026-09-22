import { Presentacion } from '../entities/presentacion.entity';

export const PRESENTACION_REPOSITORY_TOKEN = 'IPresentacionRepository';

export interface IPresentacionRepository {
    create(data: Presentacion): Promise<Presentacion>;

    findOne(id: number): Promise<Presentacion | null>;
    findByDenominacion(denominacion: string): Promise<Presentacion | null>;
    findByDenominacionWith(denominacion: string): Promise<Presentacion | null>;

    findAllFor(denominacion: string): Promise<Presentacion[]>;
    findAllListado(): Promise<Presentacion[]>;
    findBy(
        denominacion: string,
        skip: number,
        take: number,
        incluirEliminados: boolean
    ): Promise<{ data: Presentacion[]; total: number }>;

    update(id: number, data: Presentacion): Promise<Presentacion>;
    remove(data: Presentacion, usuarioId: number): Promise<Presentacion>;
}