import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IMarcaRepository } from '../../../domain/interfaces/marca.repository.interface';
import { Marca } from '../../../domain/entities/marca.entity';
import { MarcaEntity } from '../entities/marca.orm-entity';
import { DatabaseConnectionException } from 'src/modules/common/exceptions/database-connection.exception';
import { EntityNotFoundException } from 'src/modules/common/exceptions/entity-notFound-exceptions';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { AuditoriaDto } from 'src/modules/gestion-sistema/auditoria/dto/auditoria.dto';
import { FechaUtils } from 'src/modules/common/utils/date/fecha-utils';
import { QueryBuilderHelper } from 'src/modules/common/query-builders/query-builder-helpers';
import { handleDatabaseError } from 'src/modules/common/query-builders/database-error.helper';
import { MarcaOrmMapper } from '../mappers/marca.mapper';

@Injectable()
export class MarcaRepository implements IMarcaRepository {
  private readonly logger = new Logger(MarcaRepository.name);

  constructor(
    @InjectRepository(MarcaEntity)
    private readonly repository: Repository<MarcaEntity>,
  ) {}

  async create(data: Marca): Promise<Marca> {
    const nueva = this.repository.create(MarcaOrmMapper.toOrm(data));
    const guardada = await this.repository.save(nueva);
    return MarcaOrmMapper.toDomain(guardada);
  }

  async findAllFor(denominacion: string): Promise<Marca[]> {
    try {
      const query = this.repository
        .createQueryBuilder('marca')
        .where('marca.deletedAt IS NULL')
        .andWhere('UPPER(marca.denominacion) LIKE :denominacion', {
          denominacion: `%${denominacion.toUpperCase()}%`,
        });
      QueryBuilderHelper.applyOrder(query, 'marca', 'denominacion', 'ASC');
      const rows = await query.getMany();
      return rows.map(MarcaOrmMapper.toDomain);
    } catch (error) {
      handleDatabaseError(this.logger, 'findAllFor', error);
    }
  }

  async findAllListado(): Promise<Marca[]> {
    try {
      const query = this.repository
        .createQueryBuilder('marca')
        .where('marca.deletedAt IS NULL');
      QueryBuilderHelper.applyOrder(query, 'marca', 'denominacion', 'ASC');
      const rows = await query.getMany();
      return rows.map(MarcaOrmMapper.toDomain);
    } catch (error) {
      handleDatabaseError(this.logger, 'findAllListado', error);
    }
  }

  async findAllSinSistemaFor(denominacion: string): Promise<Marca[]> {
    try {
      const query = this.repository
        .createQueryBuilder('marca')

        .where('marca.deletedAt IS NULL')
        .andWhere('marca.sistema = :sistema', { sistema: 0 });

      query.andWhere('UPPER(marca.denominacion) LIKE :denominacion', {
        denominacion: `%${denominacion.toUpperCase()}%`,
      });

      const rows = await query.orderBy('marca.denominacion', 'ASC').getMany();
      return rows.map(MarcaOrmMapper.toDomain);
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async findAllSistemaFor(denominacion: string): Promise<Marca[]> {
    try {
      const query = this.repository
        .createQueryBuilder('marca')

        .where('marca.deletedAt IS NULL')
        .andWhere('marca.sistema = :sistema', { sistema: 1 });

      query.andWhere('UPPER(marca.denominacion) LIKE :denominacion', {
        denominacion: `%${denominacion.toUpperCase()}%`,
      });

      const rows = await query.orderBy('marca.denominacion', 'ASC').getMany();
      return rows.map(MarcaOrmMapper.toDomain);
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async findOne(id: number): Promise<Marca | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id, deletedAt: IsNull() },
      });

      if (!entity) {
        throw new EntityNotFoundException('Entidad no encontrada');
      }
      return MarcaOrmMapper.toDomain(entity);
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw error;
      }

      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async findByDenominacion(denominacion: string): Promise<Marca | null> {
    try {
      const entity = await this.repository.findOne({
        where: { denominacion, deletedAt: IsNull() },
      });
      return entity ? MarcaOrmMapper.toDomain(entity) : null;
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async findBy(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados = false,
  ): Promise<{ data: Marca[]; total: number }> {
    try {
      const query = this.repository.createQueryBuilder('marca');
      if (incluirEliminados) {
        query.withDeleted();
      } else {
        query.where('marca.deletedAt IS NULL');
      }

      if (denominacion) {
        query.andWhere('UPPER(marca.denominacion) LIKE :denominacion', {
          denominacion: `%${denominacion.toUpperCase()}%`,
        });
      }

      QueryBuilderHelper.applyOrder(query, 'marca', 'denominacion', 'ASC');
      QueryBuilderHelper.applyPagination(query, skip, take);

      const [data, total] = await query.getManyAndCount();

      return { data: data.map(MarcaOrmMapper.toDomain), total };
    } catch (error) {
      handleDatabaseError(this.logger, 'findBy', error);
    }
  }

  async findByIdConAuditoria(id: number): Promise<AuditoriaDto | null> {
    try {
      const raw = await this.repository
        .createQueryBuilder('marca')
        .leftJoin(
          'usuario',
          'usuarioCreated',
          'usuarioCreated.id = marca.usuarioCreatedId',
        )
        .leftJoin(
          'usuario',
          'usuarioUpdated',
          'usuarioUpdated.id = marca.usuarioUpdatedId',
        )
        .leftJoin(
          'usuario',
          'usuarioDeleted',
          'usuarioDeleted.id = marca.usuarioDeletedId',
        )
        .addSelect([
          'marca.id as marca_id',
          'marca.denominacion as marca_denominacion',
          'marca.createdAt as marca_createdAt',
          'marca.updatedAt as marca_updatedAt',
          'marca.deletedAt as marca_deletedAt',
          'usuarioCreated.denominacion as usuarioCreated_nombre',
          'usuarioUpdated.denominacion as usuarioUpdated_nombre',
          'usuarioDeleted.denominacion as usuarioDeleted_nombre',
        ])
        .where('marca.id = :id', { id })
        .getRawOne();

      if (!raw) return null;

      return {
        id: raw.marca_id ?? 0,
        detalle: raw.marca_denominacion
          ? `Marca ${raw.marca_denominacion}`
          : 'Marca (sin denominación)',
        createdAt: raw.marca_createdAt
          ? FechaUtils.formatFechaHora(raw.marca_createdAt)
          : '',
        updatedAt: raw.marca_updatedAt
          ? FechaUtils.formatFechaHora(raw.marca_updatedAt)
          : '',
        deletedAt: raw.marca_deletedAt
          ? FechaUtils.formatFechaHora(raw.marca_deletedAt)
          : '',
        usuarioCreated: raw.usuarioCreated_nombre ?? '',
        usuarioUpdated: raw.usuarioUpdated_nombre ?? '',
        usuarioDeleted: raw.usuarioDeleted_nombre ?? '',
      };
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async update(id: number, data: Marca): Promise<Marca> {
    const existente = await this.repository.findOneBy({ id });
    if (!existente) throw new NotFoundException('Marca no encontrada');
    const guardada = await this.repository.save(MarcaOrmMapper.toOrm(data, existente));
    return MarcaOrmMapper.toDomain(guardada);
  }
  
  async remove(entity: Marca, usuario: Usuario): Promise<Marca> {
    const existente = await this.repository.findOneBy({ id: entity.getId()! });
    const guardada = await this.repository.save(MarcaOrmMapper.toOrm(entity, existente ?? undefined));
    return MarcaOrmMapper.toDomain(guardada);
  }

  async findByDenominacionWith(denominacion: string): Promise<Marca | null> {
    try {
      const normalizada = denominacion.trim().toUpperCase();

      const entity = await this.repository
        .createQueryBuilder('marca')
        .withDeleted()
        .where('UPPER(marca.denominacion) = :denominacion', {
          denominacion: normalizada,
        })
        .getOne();

      if (!entity) {
        return null;
      }

      return MarcaOrmMapper.toDomain(entity);
    } catch (error) {
      handleDatabaseError(this.logger, 'findByDenominacionWith', error);
    }
  }
}
