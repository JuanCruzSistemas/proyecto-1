import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductoEntity } from "../../../../producto/infraestructure/persistence/entities/producto.orm-entity";

@Entity('producto_operacion')
export class MovimientoStockEntity {


      @PrimaryGeneratedColumn()
      id: number;

      @ManyToOne(() => ProductoEntity, (pro) => pro.movimientosStock, { eager: true })
      producto: ProductoEntity;

      @Column()
      operacionId: number;

      @Column()
      tipoOperacion: string; // Ej: 'compra-producto', 'venta-servicio', etc.

      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      creadoEn: Date;


}
