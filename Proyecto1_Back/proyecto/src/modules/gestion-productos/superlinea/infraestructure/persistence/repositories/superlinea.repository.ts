import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperlineaEntity } from '../entities/superlinea.orm-entity';
import { SuperlineaOrmMapper } from '../mappers/superlinea.mapper';
import { Superlinea } from '../../../domain/entities/superlinea.entity';
import { ISuperlineaRepository } from '../../../domain/interfaces/superlinea.repository.interface';
import { LineaEntity } from '../../../../linea/infraestructure/persistence/entities/linea.orm-entity';
import { ensureNotSistemaEntity } from 'src/modules/common/utils/atrituto-sistema';

@Injectable()
export class SuperlineaRepository implements ISuperlineaRepository {
  constructor(@InjectRepository(SuperlineaEntity) private readonly repository: Repository<SuperlineaEntity>) {}

  async findActive(id: number) {
    const row = await this.repository.findOneBy({ id });
    return row ? SuperlineaOrmMapper.toDomain(row) : null;
  }

  async listActive() {
    return (await this.repository.find({ order: { denominacion: 'ASC', id: 'ASC' } }))
      .map(SuperlineaOrmMapper.toDomain);
  }

  async save(entity: Superlinea) {
    // Serializa edición y baja para no restaurar accidentalmente una fila eliminada.
    return this.repository.manager.transaction(async manager => {
      if (entity.getId() !== null) {
        const current = await manager.getRepository(SuperlineaEntity).findOne({
          where: { id: entity.getId()! }, lock: { mode: 'pessimistic_write' },
        });
        if (!current) throw new NotFoundException('SuperLínea no encontrada.');
      }
      const saved = await manager.save(SuperlineaEntity, SuperlineaOrmMapper.toOrm(entity));
      return SuperlineaOrmMapper.toDomain(saved);
    });
  }

  async removeIfUnused(id: number, usuarioId: number): Promise<void> {
    await this.repository.manager.transaction(async manager => {
      const row = await manager.getRepository(SuperlineaEntity).findOne({
        where: { id }, lock: { mode: 'pessimistic_write' },
      });
      if (!row) throw new NotFoundException('SuperLínea no encontrada.');
      ensureNotSistemaEntity(row.sistema, 'SuperLínea');

      // Mismo bloqueo de SuperLínea que toma el guardado de Línea.
      // Lectura con bloqueo: observa los datos actuales incluso bajo REPEATABLE READ.
      const activeLines = await manager.getRepository(LineaEntity)
        .createQueryBuilder('linea')
        .where('linea.superlineaId = :id', { id })
        .andWhere('linea.deletedAt IS NULL')
        .setLock('pessimistic_write')
        .getMany();
      if (activeLines.length) {
        throw new ConflictException('No se puede eliminar: tiene líneas activas asociadas.');
      }
      const entity = SuperlineaOrmMapper.toDomain(row);
      entity.marcarComoEliminado(usuarioId);
      await manager.save(SuperlineaEntity, SuperlineaOrmMapper.toOrm(entity));
    });
  }
}
