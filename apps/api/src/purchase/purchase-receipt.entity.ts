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
import { Warehouse } from '../warehouses/warehouse.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { PurchaseReceiptItem } from './purchase-receipt-item.entity';

export type ReceiptStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

@Entity('purchase_receipts')
export class PurchaseReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  receiptNo: string;

  @Column({ type: 'int', nullable: true })
  purchaseOrderId: number | null;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder | null;

  @Column()
  supplierId: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ length: 16, default: 'DRAFT' })
  status: ReceiptStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'date', nullable: true })
  receiptDate: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @OneToMany(() => PurchaseReceiptItem, (i) => i.receipt, {
    cascade: true,
    eager: true,
  })
  items: PurchaseReceiptItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
