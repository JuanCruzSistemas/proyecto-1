import { aplicarBusquedaParcial } from './producto-search.helper';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseConnectionException } from 'src/modules/common/exceptions/database-connection.exception';
import { EntityNotFoundException } from 'src/modules/common/exceptions/entity-notFound-exceptions';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/unit-of-work.interface';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { Repository, IsNull } from 'typeorm';
import { ProductoEntity } from '../entities/producto.orm-entity';
import { IProductoRepository } from '../../../domain/interfaces/producto.repository-interface';
import { Producto } from '../../../domain/entities/producto.entity';
import { ProductoMapper } from '../mappers/producto.mapper';


@Injectable()
export class ProductoRepository implements IProductoRepository {
  private readonly logger = new Logger(ProductoRepository.name);

  private readonly ENTITY_NAME = 'Producto';

  constructor(
    @InjectRepository(ProductoEntity)
    private readonly repository: Repository<ProductoEntity>,
  ) {}


  async create(data: Producto): Promise<Producto> {
    this.logger.log(`Creando un nuevo ${this.ENTITY_NAME}`);

    try {
      const nuevaEntity = this.repository.create(ProductoMapper.toOrm(data));
      const entityGuardada = await this.repository.save(nuevaEntity);

      this.logger.log(
        `${this.ENTITY_NAME} creado exitosamente con ID: ${entityGuardada.id}`,
      );

      return ProductoMapper.toDomain(entityGuardada);
    } catch (error) {
      this.logger.error(`Error al crear ${this.ENTITY_NAME}:`, error);
      throw new DatabaseConnectionException(
        'Error al guardar en la base de datos.',
      );
    }
  }

  private async findOrmOne(id: number): Promise<ProductoEntity | null> {
    try {
      const entity = await this.repository.createQueryBuilder('producto')
                                          .leftJoinAndSelect('producto.linea', 'linea')
                                          .leftJoinAndSelect('producto.marca', 'marca')
                                          .where('producto.id = :id', { id })
                                          .andWhere('producto.deletedAt IS NULL')
                                          .getOne();
      if (!entity) {
        throw new EntityNotFoundException('Entidad no encontrada.');
      }

      return entity;
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw error;
      }
      throw new DatabaseConnectionException('Error al conectar con la base de datos.');
    }
  }

  async findOne(id: number): Promise<Producto | null> {
    const entity = await this.findOrmOne(id);
    return entity ? ProductoMapper.toDomain(entity) : null;
  }

  async findByIdConAuditoria(id: number): Promise<Producto | null> {
    try {
      const entity = await this.repository.createQueryBuilder('producto')
                                          .leftJoinAndSelect('producto.usuarioCreated', 'usuarioCreated')
                                          .leftJoinAndSelect('producto.usuarioUpdated', 'usuarioUpdated')
                                          .leftJoinAndSelect('producto.usuarioDeleted', 'usuarioDeleted')
                                          .where('producto.id = :id', { id })
                                          .getOne();
      if (!entity) {
        throw new EntityNotFoundException('Entidad no encontrada.');
      }

      return ProductoMapper.toDomain(entity);
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw error;
      }
      throw new DatabaseConnectionException('Error al conectar con la base de datos.');
    }
  }

  async findByIdWithoutRelations(id: number): Promise<Producto | null> {
    try {
      const entity = await this.repository.createQueryBuilder('producto')
                                          .where('producto.id = :id', { id })
                                          .andWhere('producto.deletedAt IS NULL')
                                          .getOne();
      if (!entity) {
        throw new EntityNotFoundException('Entidad no encontrada.');
      }

      return ProductoMapper.toDomain(entity);
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw error;
      }
      throw new DatabaseConnectionException('Error al conectar con la base de datos.');
    }
  }

  async update(id: number, data: Producto): Promise<Producto> {
    try {
      const existente = await this.repository.findOne({ where: { id } });

      if (!existente) {
        throw new NotFoundException(`El producto con ID ${id} no encontrado`);
      }

      const entityActualizada = await this.repository.save(ProductoMapper.toOrm(data, existente));

      return ProductoMapper.toDomain(entityActualizada);
    } catch (error) {
      throw new DatabaseConnectionException(error);
    }
  }

  async updateEntity(uow: IUnitOfWork, producto: Producto): Promise<Producto> {
    const repo = uow.getRepository(ProductoEntity);
    const existente = producto.getId() !== null
                    ? await repo.findOne({ where: { id: producto.getId()! } })
                    : null;
    const guardada = await repo.save(ProductoMapper.toOrm(producto, existente ?? undefined));
    return ProductoMapper.toDomain(guardada);
  }

  async remove(producto: Producto, usuario: Usuario): Promise<Producto> {
    try {
      const existente = await this.repository.findOne({ where: { id: producto.getId()! } });
      const guardada = await this.repository.save(ProductoMapper.toOrm(producto, existente ?? undefined));
      return ProductoMapper.toDomain(guardada);
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al guardar en la base de datos.',
      );
    }
  }

  async findBy(
    denominacion: string,
    codigoProveedor: string,
    codProveedorExacto: boolean,
    codigoReferencia: string,
    marca_id: number,
    linea_id: number,
    proveedor_id: number,
    conStock: boolean,
    skip: number,
    take: number,
    lineaDenominacion?: string,
    superlineaDenominacion?: string,
  ): Promise<{ data: Producto[]; total: number }> {
    const query = this.repository.createQueryBuilder('producto')
                                 .leftJoinAndSelect('producto.marca', 'marca')
                                 .leftJoinAndSelect('producto.linea', 'linea')
                                 .leftJoinAndSelect('producto.proveedor', 'proveedor')
                                 .leftJoin('linea.superlinea', 'superlinea');

    aplicarBusquedaParcial(query, { denominacion, lineaDenominacion, superlineaDenominacion });

    if (codigoProveedor || codigoReferencia) {
      const condiciones: string[] = [];
      const parametros: any = {};

      if (codigoProveedor) {
        if (codProveedorExacto) {
          condiciones.push(`UPPER(producto.codigoProveedor) = UPPER(:codigoProveedor)`);
          parametros.codigoProveedor = codigoProveedor;
        } else {
          condiciones.push(`UPPER(producto.codigoProveedor) LIKE UPPER(:codigoProveedor)`);
          parametros.codigoProveedor = `%${codigoProveedor}%`;
        }
      }

      if (codigoReferencia) {
        condiciones.push(`UPPER(producto.codigoReferencia) LIKE UPPER(:codigoReferencia)`);
        parametros.codigoReferencia = `%${codigoReferencia}%`;
      }

      query.andWhere(`(${condiciones.join(' OR ')})`, parametros);
    }

    if (marca_id) {
      query.andWhere('marca.id = :marca_id', { marca_id });
    }
    if (linea_id) {
      query.andWhere('linea.id = :linea_id', { linea_id });
    }

    if (proveedor_id) {
      query.andWhere('proveedor.id = :proveedor_id', { proveedor_id });
    }

    if (conStock) {
      query.andWhere('producto.stock > 0');
    }
    query.andWhere('producto.deletedAt IS NULL');
    query.orderBy('producto.denominacion', 'ASC').addOrderBy('producto.id', 'ASC');
    query.skip(skip).take(take);

    const [data, total] = await query.getManyAndCount();

    return {
      data: data.map(ProductoMapper.toDomain),
      total,
    };
  }

  async findByRapido(
    codigo: string,
    exacto: boolean,
    skip: any,
    take: number,
  ): Promise<{ data: Producto[]; total: number }> {
    const query = this.repository.createQueryBuilder('producto')
                                 .leftJoinAndSelect('producto.marca', 'marca')
                                 .leftJoinAndSelect('producto.linea', 'linea')
                                 .leftJoinAndSelect('producto.proveedor', 'proveedor')
                                 .where('producto.deletedAt IS NULL');

    if (codigo) {
      if (exacto) {
        query.andWhere(
          '(producto.codigoProveedor = :codigo OR producto.codigoReferencia = :codigo)',
          { codigo },
        );
      } else {
        query.andWhere(
          `(
          producto.codigoProveedor LIKE :codigo OR
          producto.codigoReferencia LIKE :codigo OR
          producto.denominacion LIKE :codigo
          )`,
          { codigo: `%${codigo}%` },
        );
      }
    }

    query.orderBy('producto.denominacion', 'ASC');
    query.skip(skip).take(take);

    const [data, total] = await query.getManyAndCount();

    return { data: data.map(ProductoMapper.toDomain), total };
  }

  async isCodigoProveedorDuplicado(
    codigoProveedor: string | null,
    id?: number,
  ): Promise<boolean> {
    if (
      !codigoProveedor ||
      codigoProveedor.trim() === '' ||
      codigoProveedor === '0'
    ) {
      return false;
    }

    const query = this.repository.createQueryBuilder('producto')
                                 .where('producto.codigoProveedor = :codigoProveedor', { codigoProveedor });

    if (id) {
      query.andWhere('producto.id != :id', { id });
    }

    return query.getExists();
  }

  async findByDenominacion(denominacion: string): Promise<Producto | null> {
    try {
      const entity = await this.repository.findOne({
        where: { denominacion, deletedAt: IsNull() },
      });
      return entity ? ProductoMapper.toDomain(entity) : null;
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async existsByDenominacion(
    denominacion: string,
    excludeId?: number,
  ): Promise<boolean> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder('producto')
        .where('producto.denominacion = :denominacion', { denominacion })
        .andWhere('producto.deletedAt IS NULL');

      if (excludeId) {
        queryBuilder.andWhere('producto.id != :excludeId', { excludeId });
      }

      const count = await queryBuilder.getCount();
      return count > 0;
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async findByDenominacionCodigoProveedorFiltered(
    denominacion: string,
    skip = 0,
    take = 10,
  ): Promise<{ data: Producto[]; total: number }> {
    try {
      const query = this.repository
        .createQueryBuilder('producto')
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.linea', 'linea')

      query.andWhere('producto.deletedAt IS NULL');
      query.orderBy('producto.denominacion', 'ASC');
      query.skip(skip).take(take);

      const [data, total] = await query.getManyAndCount();

      return { data: data.map(ProductoMapper.toDomain), total };
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

  async existsProductosActivosByMarca(marcaId: number): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('producto')
      .where('producto.marca_id = :marcaId', { marcaId })
      .andWhere('producto.deletedAt IS NULL')
      .limit(1)
      .getCount();

    return count > 0;
  }

  async existsProductosActivosByLinea(lineaId: number): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('producto')
      .where('producto.linea_id = :lineaId', { lineaId })
      .andWhere('producto.deletedAt IS NULL')
      .limit(1)
      .getCount();

    return count > 0;
  }

  async findByIds(ids: number[]): Promise<Producto[]> {
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length === 0) {
      return [];
    }

    const entities = await this.repository
      .createQueryBuilder('producto')
      .where('producto.id IN (:...ids)', { ids: uniqueIds })
      .getMany();

    return entities.map(ProductoMapper.toDomain);
  }


  async existsByCodigoProveedor(codigoProveedor: string, excludeId: number): Promise<boolean> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder('producto')
        .where('producto.codigoProveedor = :codigoProveedor', { codigoProveedor })
        .andWhere('producto.deletedAt IS NULL');

      if (excludeId) {
        queryBuilder.andWhere('producto.id != :excludeId', { excludeId });
      }

      const count = await queryBuilder.getCount();
      return count > 0;
    } catch (error) {
      throw new DatabaseConnectionException(
        'Error al conectar con la base de datos.',
      );
    }
  }

}
