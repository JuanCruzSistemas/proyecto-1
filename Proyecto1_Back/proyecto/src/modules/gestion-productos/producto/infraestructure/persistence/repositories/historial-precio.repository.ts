import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IHistorialPrecioRepository } from '../../../domain/repositories/historial-precio.repository.interface';
import { HistorialPrecio } from '../../../domain/entities/historial-precio.entity';
import { HistorialPrecioOrmEntity } from '../entities/historial-precio-orm.entity';
import { HistorialPrecioMapper } from '../mappers/historial-precio.mapper';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/unit-of-work.interface';


@Injectable()
export class HistorialPrecioRepository implements IHistorialPrecioRepository {
  private readonly logger = new Logger(HistorialPrecioRepository.name);

  constructor(
    @InjectRepository(HistorialPrecioOrmEntity)
    private readonly ormRepository: Repository<HistorialPrecioOrmEntity>,
  ) {}


  async save(historial: HistorialPrecio, uow?: IUnitOfWork): Promise<HistorialPrecio> {
    const repo = uow ? uow.getRepository(HistorialPrecioOrmEntity) : this.ormRepository;
    try {
      const ormEntity = HistorialPrecioMapper.toOrm(historial);
      const saved = await repo.save(ormEntity);
      
      this.logger.log(
        `Historial de precio guardado con ID: ${saved.id} para producto ID: ${saved.productoId}`,
      );

      const fullEntity = await repo.findOne({
        where: { id: saved.id },
        relations: ['producto', 'usuario', 'producto.linea', 'producto.marca'],
      });

      if (!fullEntity) {
        throw new Error(`No se pudo cargar el historial guardado con ID: ${saved.id}`);
      }

      return HistorialPrecioMapper.toDomain(fullEntity);
    } catch (error) {
      this.logger.error('Error al guardar historial de precio', error);
      throw error;
    }
  }

  async findByProductoId(productoId: number): Promise<HistorialPrecio[]> {
    try {
      const historiales = await this.ormRepository.find({
        where: { productoId },
        relations: ['producto', 'usuario', 'producto.linea', 'producto.marca'],
        order: { fecha: 'DESC' },
      });

      this.logger.log(
        `Encontrados ${historiales.length} registros de historial para producto ID: ${productoId}`,
      );

      return historiales.map((orm) => HistorialPrecioMapper.toDomain(orm));
    } catch (error) {
      this.logger.error(
        `Error al buscar historial para producto ID: ${productoId}`,
        error,
      );
      throw error;
    }
  }
}
