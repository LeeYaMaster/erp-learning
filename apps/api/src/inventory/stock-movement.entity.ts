import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

/** 出入库流水：每次库存变动写一条 */
@Entity('stock_movements')
@Index(['warehouseId', 'productId'])
@Index(['bizType', 'bizId'])
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  /** IN 入库 / OUT 出库 */
  @Column({ length: 8 })
  direction: 'IN' | 'OUT';

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  quantity: number;

  /** 变动后结存 */
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  balanceAfter: number;

  /** 业务类型：PURCHASE_RECEIPT / SALES_SHIPMENT */
  @Column({ length: 32 })
  bizType: string;

  @Column()
  bizId: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  bizNo: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
