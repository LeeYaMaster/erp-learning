import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { SalesShipment } from './sales-shipment.entity';

@Entity('sales_shipment_items')
export class SalesShipmentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shipmentId: number;

  @ManyToOne(() => SalesShipment, (s) => s.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipmentId' })
  shipment: SalesShipment;

  @Column()
  productId: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount: number;
}
