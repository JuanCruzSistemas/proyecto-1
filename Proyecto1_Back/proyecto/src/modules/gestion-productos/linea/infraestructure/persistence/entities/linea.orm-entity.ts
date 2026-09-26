import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ProductoEntity } from '../../../../producto/infraestructure/persistence/entities/producto.orm-entity';
import { CantidadColumn } from 'src/modules/common/decorators/cantidad-column.decorator';

import { SuperlineaEntity } from '../../../../superlinea/infraestructure/persistence/entities/superlinea.orm-entity';

@Entity('linea')
@Index(['denominacion', 'deletedAt'], { unique: true })
export class LineaEntity {
  @Column({ type: 'int' })
  superlineaId: number;

  @ManyToOne(() => SuperlineaEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'superlineaId', foreignKeyConstraintName: 'FK_linea_superlinea' })
  superlinea: SuperlineaEntity;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  denominacion: string;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @OneToMany(() => ProductoEntity, (producto) => producto.linea)
  productos: ProductoEntity[];

  @Column('boolean', { default: false })
  utilizaStockMinimo: boolean;

  @CantidadColumn()
  stockMinimo: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'int', nullable: true })
  usuarioCreatedId?: number;

  @Column({ type: 'int', nullable: true })
  usuarioDeletedId?: number;

  @Column({ type: 'int', nullable: true })
  usuarioUpdatedId?: number;

  @Column({ type: 'int', default: 0 })
  sistema: number;
}
