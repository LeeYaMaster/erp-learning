import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Supplier } from '../suppliers/supplier.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export type DocStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  orderNo: string;

  @Column()
  supplierId: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ length: 16, default: 'DRAFT' })
  status: DocStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'date', nullable: true })
  orderDate: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @OneToMany(() => PurchaseOrderItem, (i) => i.order, {
    cascade: true,
    eager: true,
  })
  items: PurchaseOrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
