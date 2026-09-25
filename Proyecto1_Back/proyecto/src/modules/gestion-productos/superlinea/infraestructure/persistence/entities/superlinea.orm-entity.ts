import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('superlinea')
export class SuperlineaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  denominacion: string;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  usuarioCreatedId: number | null;

  @Column({ type: 'int', nullable: true })
  usuarioUpdatedId: number | null;

  @Column({ type: 'int', nullable: true })
  usuarioDeletedId: number | null;

  @Column({ type: 'int', default: 0 })
  sistema: number;
}
