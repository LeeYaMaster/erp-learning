import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

/** 库存余额：仓库 + 商品 唯一 */
@Entity('stock_balances')
@Unique(['warehouseId', 'productId'])
@Index(['productId'])
export class StockBalance {
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

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  quantity: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
