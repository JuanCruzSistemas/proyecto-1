import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Marca } from '../entities/marca.entity';
import { AuditoriaDto } from 'src/modules/gestion-sistema/auditoria/dto/auditoria.dto';

export const MARCA_REPOSITORY_TOKEN = 'IMarcaRepository';

export interface IMarcaRepository {
  create(data: Marca): Promise<Marca>;
  findAllFor(denominacion: string): Promise<Marca[]>;
  findAllListado(): Promise<Marca[]>;
  findAllSinSistemaFor(denominacion: string): Promise<Marca[]>;
  findAllSistemaFor(denominacion: string): Promise<Marca[]>;
  findOne(id: number): Promise<Marca | null>;
  findByDenominacion(denominacion: string): Promise<Marca | null>;
  findByDenominacionWith(denominacion: String): Promise<Marca | null>;
  findBy(
    denominacion: string,
    skip: number,
    take: number,
    incluirEliminados: boolean
  ): Promise<{ data: Marca[]; total: number } >;

  findByIdConAuditoria(id: number):  Promise<AuditoriaDto | null> ;
  update(id: number, data: Marca): Promise<Marca>;

  remove(data: Marca, usuario: Usuario): Promise<Marca>;
}
