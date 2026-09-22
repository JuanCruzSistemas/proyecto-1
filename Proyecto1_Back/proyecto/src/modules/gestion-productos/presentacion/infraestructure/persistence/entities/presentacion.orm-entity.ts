import { ProductoEntity } from "src/modules/gestion-productos/producto/infraestructure/persistence/entities/producto.orm-entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('presentacion')
@Index(['denominacion', 'deletedAt'], { unique: true })
export class PresentacionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    denominacion: string;

    @Column({ type: 'text', nullable: true })
    observacion?: string;

    @OneToMany(() => ProductoEntity, (producto) => producto.presentacion)
    productos: ProductoEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt?: Date;

    @Column({ type: 'int', nullable: true })
    usuarioCreatedId?: number;

    @Column({ type: 'int', nullable: true })
    usuarioUpdatedId?: number;

    @Column({ type: 'int', nullable: true })
    usuarioDeletedId?: number;
}