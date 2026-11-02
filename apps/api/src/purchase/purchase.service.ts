import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InventoryService } from '../inventory/inventory.service';
import { PurchaseOrder } from './purchase-order.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { PurchaseReceipt } from './purchase-receipt.entity';
import { PurchaseReceiptItem } from './purchase-receipt-item.entity';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function genNo(prefix: string) {
  const d = new Date();
  const stamp =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0') +
    String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}${stamp}`;
}

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly orderRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseReceipt)
    private readonly receiptRepo: Repository<PurchaseReceipt>,
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  // ---- 采购订单 ----
  listOrders() {
    return this.orderRepo.find({
      relations: ['supplier', 'items', 'items.product'],
      order: { id: 'DESC' },
    });
  }

  async getOrder(id: number) {
    const row = await this.orderRepo.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.product'],
    });
    if (!row) throw new NotFoundException('采购订单不存在');
    return row;
  }

  async createOrder(data: {
    supplierId: number;
    orderDate?: string;
    remark?: string;
    items: { productId: number; quantity: number; unitPrice: number }[];
  }) {
    if (!data.items?.length) throw new BadRequestException('请至少添加一行明细');
    const items = data.items.map((i) => {
      const amount = Number(i.quantity) * Number(i.unitPrice);
      return {
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        amount,
      } as Partial<PurchaseOrderItem>;
    });
    const totalAmount = items.reduce((s, i) => s + Number(i.amount), 0);
    const order = this.orderRepo.create({
      orderNo: genNo('PO'),
      supplierId: data.supplierId,
      status: 'DRAFT',
      orderDate: data.orderDate || todayStr(),
      remark: data.remark || null,
      totalAmount,
      items: items as PurchaseOrderItem[],
    });
    return this.orderRepo.save(order);
  }

  async confirmOrder(id: number) {
    const order = await this.getOrder(id);
    if (order.status !== 'DRAFT') {
      throw new BadRequestException('仅草稿状态可确认');
    }
    order.status = 'CONFIRMED';
    return this.orderRepo.save(order);
  }

  async cancelOrder(id: number) {
    const order = await this.getOrder(id);
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('单据已取消');
    }
    order.status = 'CANCELLED';
    return this.orderRepo.save(order);
  }

  // ---- 采购入库 ----
  listReceipts() {
    return this.receiptRepo.find({
      relations: ['supplier', 'warehouse', 'items', 'items.product'],
      order: { id: 'DESC' },
    });
  }

  async getReceipt(id: number) {
    const row = await this.receiptRepo.findOne({
      where: { id },
      relations: ['supplier', 'warehouse', 'items', 'items.product', 'purchaseOrder'],
    });
    if (!row) throw new NotFoundException('采购入库单不存在');
    return row;
  }

  async createReceipt(data: {
    supplierId: number;
    warehouseId: number;
    purchaseOrderId?: number;
    receiptDate?: string;
    remark?: string;
    items: { productId: number; quantity: number; unitPrice: number }[];
  }) {
    if (!data.items?.length) throw new BadRequestException('请至少添加一行明细');
    const items = data.items.map((i) => {
      const amount = Number(i.quantity) * Number(i.unitPrice);
      return {
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        amount,
      } as Partial<PurchaseReceiptItem>;
    });
    const totalAmount = items.reduce((s, i) => s + Number(i.amount), 0);
    const receipt = this.receiptRepo.create({
      receiptNo: genNo('PR'),
      supplierId: data.supplierId,
      warehouseId: data.warehouseId,
      purchaseOrderId: data.purchaseOrderId || null,
      status: 'DRAFT',
      receiptDate: data.receiptDate || todayStr(),
      remark: data.remark || null,
      totalAmount,
      items: items as PurchaseReceiptItem[],
    });
    return this.receiptRepo.save(receipt);
  }

  /** 确认入库：事务内加库存 + 写流水 */
  async confirmReceipt(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const receipt = await manager.getRepository(PurchaseReceipt).findOne({
        where: { id },
        relations: ['items'],
      });
      if (!receipt) throw new NotFoundException('采购入库单不存在');
      if (receipt.status !== 'DRAFT') {
        throw new BadRequestException('仅草稿状态可确认入库');
      }

      await this.inventoryService.increaseStock(
        manager,
        receipt.items.map((i) => ({
          warehouseId: receipt.warehouseId,
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
        {
          bizType: 'PURCHASE_RECEIPT',
          bizId: receipt.id,
          bizNo: receipt.receiptNo,
          remark: '采购入库确认',
        },
      );

      receipt.status = 'CONFIRMED';
      return manager.getRepository(PurchaseReceipt).save(receipt);
    });
  }
}
