import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Presentacion } from "../../../domain/entities/presentacion.entity";
import { IPresentacionRepository } from "../../../domain/repositories/presentacion.repository.interface";
import { PresentacionEntity } from "../entities/presentacion.orm-entity";
import { Repository } from "typeorm";
import { PresentacionMapper } from "../mappers/presentacion.mapper";

@Injectable()
export class PresentacionRepository implements IPresentacionRepository {
    constructor(
        @InjectRepository(PresentacionEntity)
        private readonly repository: Repository<PresentacionEntity>
    ) {}

    async create(data: Presentacion): Promise<Presentacion> {
        const nuevaEntity = this.repository.create(PresentacionMapper.toOrm(data));
        const entityGuardada = await this.repository.save(nuevaEntity);
        return PresentacionMapper.toDomain(entityGuardada);
    }

    async findOne(id: number): Promise<Presentacion | null> {
        const entity = await this.repository.findOneBy({ id });
        return entity ? PresentacionMapper.toDomain(entity) : null;
    }

    async findByDenominacion(denominacion: string): Promise<Presentacion | null> {
        const entity = await this.repository.findOneBy({ denominacion });
        return entity ? PresentacionMapper.toDomain(entity) : null;
    }

    async findAllFor(denominacion: string): Promise<Presentacion[]> {
        const query = this.buildQueryWithDenominacion(denominacion)
                          .andWhere('presentacion.deletedAt IS NULL');
        const presentaciones = await query.getMany();
        return presentaciones.map(PresentacionMapper.toDomain);
    }

    async findAllListado(): Promise<Presentacion[]> {
        const presentaciones = await this.repository.find({
            order: { denominacion: 'ASC' },
        });
        return presentaciones.map(PresentacionMapper.toDomain);
    }

    async findBy(
        denominacion: string,
        skip: number,
        take: number,
        incluirEliminados: boolean
    ): Promise<{ data: Presentacion[]; total: number; }> {
        const query = this.buildQueryWithDenominacion(denominacion);

        if (!incluirEliminados) {
            query.andWhere('presentacion.deletedAt IS NULL');
        }

        query.orderBy('presentacion.denominacion', 'ASC').skip(skip).take(take);

        const [data, total] = await query.getManyAndCount();
        return { data: data.map(PresentacionMapper.toDomain), total };
    }

    async update(id: number, data: Presentacion): Promise<Presentacion> {
        const existente = await this.repository.findOneBy({ id });
        if (!existente) {
            throw new NotFoundException('Presentación no encontrada');
        }
        
        const guardada = await this.repository.save(PresentacionMapper.toOrm(data, existente));
        return PresentacionMapper.toDomain(guardada);
    }

    async remove(data: Presentacion, usuarioId: number): Promise<Presentacion> {
        const existente = await this.repository.findOne({ where: { id: data.getId()! } });
        const guardada = await this.repository.save(PresentacionMapper.toOrm(data, existente ?? undefined));
        return PresentacionMapper.toDomain(guardada);
    }

    async findByDenominacionWith(denominacion: string): Promise<Presentacion | null> {
        const normalizada = denominacion.trim().toUpperCase();

        const entity = await this.repository.createQueryBuilder('presentacion')
                                            .withDeleted()
                                            .where('UPPER(presentacion.denominacion) = :denominacion', {
                                                denominacion: normalizada,
                                            })
                                            .getOne();

        return entity ? PresentacionMapper.toDomain(entity) : null;
    }

    private buildQueryWithDenominacion(denominacion: string) {
        return this.repository.createQueryBuilder('presentacion')
            .where('UPPER(presentacion.denominacion) LIKE :denominacion', {
                denominacion: `%${denominacion.toUpperCase()}%`
            });
    }
}