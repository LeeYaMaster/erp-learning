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
import { Warehouse } from '../warehouses/warehouse.entity';
import { SalesOrder } from './sales-order.entity';
import { SalesShipmentItem } from './sales-shipment-item.entity';

export type ShipmentStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

@Entity('sales_shipments')
export class SalesShipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  shipmentNo: string;

  @Column({ type: 'int', nullable: true })
  salesOrderId: number | null;

  @ManyToOne(() => SalesOrder, { nullable: true })
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder | null;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ length: 16, default: 'DRAFT' })
  status: ShipmentStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'date', nullable: true })
  shipmentDate: string | null;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @OneToMany(() => SalesShipmentItem, (i) => i.shipment, {
    cascade: true,
    eager: true,
  })
  items: SalesShipmentItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
