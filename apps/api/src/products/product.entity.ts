import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 64 })
  sku: string;

  @Column({ length: 128 })
  name: string;

  @Column({ length: 32, default: '件' })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  purchasePrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salePrice: number;

  /** 安全库存：低于此数量仪表盘预警 */
  @Column({ type: 'int', default: 0 })
  safetyStock: number;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
