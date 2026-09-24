import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ProductoEntity } from './producto.orm-entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { MonetarioColumn } from 'src/modules/common/decorators/monetario-column.decorator';
import { PorcentajeColumn } from 'src/modules/common/decorators/porcentaje-column.decorator';


@Entity('historial_precio')
@Index('idx_historial_producto', ['productoId'])
@Index('idx_historial_fecha', ['fecha'])
export class HistorialPrecioOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @MonetarioColumn()
  precioAnterior: number;

  @MonetarioColumn()
  precioNuevo: number;

  @MonetarioColumn()
  costoAnterior: number;

  @MonetarioColumn()
  costoNuevo: number;

  @PorcentajeColumn()
  margenAnterior: number;

  @PorcentajeColumn()
  margenNuevo: number;

  @Column({ type: 'varchar', length: 500 })
  motivo: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => ProductoEntity, { eager: true })
  @JoinColumn({ name: 'producto_id' })
  producto: ProductoEntity;

  @Column({ name: 'producto_id' })
  productoId: number;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
