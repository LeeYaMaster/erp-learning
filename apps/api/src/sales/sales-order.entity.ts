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
import { Customer } from '../customers/customer.entity';
import { SalesOrderItem } from './sales-order-item.entity';

export type DocStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  orderNo: string;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ length: 16, default: 'DRAFT' })
  status: DocStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'date', nullable: true })
  orderDate: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @OneToMany(() => SalesOrderItem, (i) => i.order, {
    cascade: true,
    eager: true,
  })
  items: SalesOrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
