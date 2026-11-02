import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { PurchaseReceipt } from './purchase-receipt.entity';

@Entity('purchase_receipt_items')
export class PurchaseReceiptItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  receiptId: number;

  @ManyToOne(() => PurchaseReceipt, (r) => r.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiptId' })
  receipt: PurchaseReceipt;

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
