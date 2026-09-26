import { BadRequestException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseConnectionException } from 'src/modules/common/exceptions/database-connection.exception';
import { EntityNotFoundException } from 'src/modules/common/exceptions/entity-notFound-exceptions';
import { Repository } from 'typeorm';
import { Linea } from '../../../domain/entities/linea.entity';
import { LineaEntity } from '../entities/linea.orm-entity';
import { ILineaRepository } from '../../../domain/interfaces/linea.repository.interface';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { AuditoriaDto } from 'src/modules/gestion-sistema/auditoria/dto/auditoria.dto';
import { FechaUtils } from 'src/modules/common/utils/date/fecha-utils';
import { QueryBuilderHelper } from 'src/modules/common/query-builders/query-builder-helpers';
import { handleDatabaseError } from 'src/modules/common/query-builders/database-error.helper';
import { LineaOrmMapper } from '../mappers/linea.mapper';
import { SuperlineaEntity } from '../../../../superlinea/infraestructure/persistence/entities/superlinea.orm-entity';

@Injectable()
export class LineaRepository implements ILineaRepository {
  private readonly logger = new Logger(LineaRepository.name);

  constructor(
    @InjectRepository(LineaEntity)
    private readonly repository: Repository<LineaEntity>,
  ) {}

  private async saveWithActiveSuperlinea(row: LineaEntity): Promise<LineaEntity> {
    return this.repository.manager.transaction(async manager => {
      const superlinea = await manager.getRepository(SuperlineaEntity).findOne({
        where: { id: row.superlineaId }, lock: { mode: 'pessimistic_write' },
      });
      if (!superlinea) throw new BadRequestException('Debe seleccionar una SuperLínea válida y activa.');
      return manager.save(LineaEntity, row);
    });
  }

  async create(data: Linea): Promise<Linea> {
    try {
      const nuevaEntity = this.repository.create(LineaOrmMapper.toOrm(data));
      const entityGuardada = await this.saveWithActiveSuperlinea(nuevaEntity);

      return LineaOrmMapper.toDomain(entityGuardada);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error al conectar con la base de datos: ${error}`);
      throw new DatabaseConnectionException(
        'Error al guardar en la base de datos.',
      );
    }
  }

  async update(id: number, data: Linea): Promise<Linea> {
    const entity = await this.repository.findOne({
      where: { id }
    });

    if (!entity) {
      throw new NotFoundException(`Línea con ID ${id} no encontrada`);
    }

    const entityActualizada = await this.saveWithActiveSuperlinea(LineaOrmMapper.toOrm(data, entity));

    return LineaOrmMapper.toDomain(entityActualizada);
  }

  async findOne(id: number): Promise<Linea | null> {
    try {
      const entity = await this.repository
        .createQueryBuilder('linea')
        .where('linea.id = :id', { id })
        .andWhere('linea.deletedAt IS NULL')
        .getOne();

      if (!entity) {
        throw new EntityNotFoundException('Entidad no encontrada');
      }

      return LineaOrmMapper.toDomain(entity);
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw error;
      }

      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async findAllListado(): Promise<Linea[]> {
    try {
      const query = this.repository
        .createQueryBuilder('linea')
        .where('linea.deletedAt IS NULL');
      QueryBuilderHelper.applyOrder(query, 'linea', 'denominacion', 'ASC');
      const rows = await query.getMany();
      return rows.map(LineaOrmMapper.toDomain);
    } catch (error) {
      handleDatabaseError(this.logger, 'findAllListado', error);
    }
  }

  async findByDenominacion(denominacion: string): Promise<Linea | null> {
    try {
      const entity = await this.repository
        .createQueryBuilder('linea')
        .where('linea.denominacion = :denominacion', { denominacion })
        .andWhere('linea.deletedAt IS NULL')
        .getOne();

      return entity ? LineaOrmMapper.toDomain(entity) : null;
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async findByDenominacionWith(denominacion: string): Promise<Linea | null> {
    try {
      const normalizada = denominacion.trim().toUpperCase();

      const entity = await this.repository
        .createQueryBuilder('linea')
        .withDeleted()
        .where('UPPER(linea.denominacion) = :denominacion', {
          denominacion: normalizada,
        })
        .getOne();

      if (!entity) {
        return null;
      }

      return LineaOrmMapper.toDomain(entity);
    } catch (error) {
      handleDatabaseError(this.logger, 'findByDenominacionWith', error);
    }
  }

  async findByDenominacionFiltered(
    denominacion: string,
    skip = 0,
    take = 10,
    incluirEliminados = false,
  ): Promise<{ data: Linea[]; total: number }> {
    try {
      const query = this.repository.createQueryBuilder('linea');
      if (incluirEliminados) {
        query.withDeleted();
      } else {
        query.where('linea.deletedAt IS NULL');
      }

      if (denominacion) {
        query.andWhere('UPPER(linea.denominacion) LIKE :denominacion', {
          denominacion: `%${denominacion.toUpperCase()}%`,
        });
      }

      QueryBuilderHelper.applyOrder(query, 'linea', 'denominacion', 'ASC');
      QueryBuilderHelper.applyPagination(query, skip, take);

      const [data, total] = await query.getManyAndCount();
      return { data: data.map(LineaOrmMapper.toDomain), total };
    } catch (error) {
      handleDatabaseError(this.logger, 'findBy', error);
    }
  }

  async findAllFor(denominacion: string): Promise<Linea[]> {
    try {
      const query = this.repository
        .createQueryBuilder('linea')
        .where('linea.deletedAt IS NULL')
        .andWhere('UPPER(linea.denominacion) LIKE :denominacion', {
          denominacion: `%${denominacion.toUpperCase()}%`,
        });

      QueryBuilderHelper.applyOrder(query, 'linea', 'denominacion', 'ASC');
      const rows = await query.getMany();
      return rows.map(LineaOrmMapper.toDomain);
    } catch (error) {
      handleDatabaseError(this.logger, 'findAllFor', error);
    }

  }

  async findAllSinSistemaFor(denominacion: string): Promise<Linea[]> {
    try {
      const query = this.repository
        .createQueryBuilder('linea')
        .where('linea.deletedAt IS NULL')
        .andWhere('linea.sistema = :sistema', { sistema: 0 });
      if (denominacion && denominacion.trim() !== '') {
        query.andWhere('UPPER(linea.denominacion) LIKE :denominacion', {
          denominacion: `%${denominacion.toUpperCase()}%`,
        });
      }

      const rows = await query.orderBy('linea.denominacion', 'ASC').getMany();
      return rows.map(LineaOrmMapper.toDomain);
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async remove(entity: Linea, usuario: Usuario): Promise<Linea> {
    const existente = await this.repository.findOneBy({ id: entity.getId()! });
    const guardada = await this.repository.save(LineaOrmMapper.toOrm(entity, existente ?? undefined));

    return LineaOrmMapper.toDomain(guardada);
  }

  async findByIdConAuditoria(id: number): Promise<AuditoriaDto | null> {
    try {
      const raw = await this.repository
        .createQueryBuilder('linea')
        .leftJoin(
          'usuario',
          'usuarioCreated',
          'usuarioCreated.id = linea.usuarioCreatedId',
        )
        .leftJoin(
          'usuario',
          'usuarioUpdated',
          'usuarioUpdated.id = linea.usuarioUpdatedId',
        )
        .leftJoin(
          'usuario',
          'usuarioDeleted',
          'usuarioDeleted.id = linea.usuarioDeletedId',
        )
        .addSelect([
          'linea.id as linea_id',
          'linea.denominacion as linea_denominacion',
          'linea.createdAt as linea_createdAt',
          'linea.updatedAt as linea_updatedAt',
          'linea.deletedAt as linea_deletedAt',
          'usuarioCreated.denominacion as usuarioCreated_nombre',
          'usuarioUpdated.denominacion as usuarioUpdated_nombre',
          'usuarioDeleted.denominacion as usuarioDeleted_nombre',
        ])
        .where('linea.id = :id', { id })
        .getRawOne();

      if (!raw) return null;

      return {
        id: raw.linea_id ?? 0,
        detalle: raw.linea_denominacion
          ? `linea ${raw.linea_denominacion}`
          : 'linea (sin denominación)',
        createdAt: raw.linea_createdAt
          ? FechaUtils.formatFechaHora(raw.linea_createdAt)
          : '',
        updatedAt: raw.linea_updatedAt
          ? FechaUtils.formatFechaHora(raw.linea_updatedAt)
          : '',
        deletedAt: raw.linea_deletedAt
          ? FechaUtils.formatFechaHora(raw.linea_deletedAt)
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
}
