import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InventoryService } from '../inventory/inventory.service';
import { SalesOrder } from './sales-order.entity';
import { SalesOrderItem } from './sales-order-item.entity';
import { SalesShipment } from './sales-shipment.entity';
import { SalesShipmentItem } from './sales-shipment-item.entity';

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
export class SalesService {
  constructor(
    @InjectRepository(SalesOrder)
    private readonly orderRepo: Repository<SalesOrder>,
    @InjectRepository(SalesShipment)
    private readonly shipmentRepo: Repository<SalesShipment>,
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  listOrders() {
    return this.orderRepo.find({
      relations: ['customer', 'items', 'items.product'],
      order: { id: 'DESC' },
    });
  }

  async getOrder(id: number) {
    const row = await this.orderRepo.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product'],
    });
    if (!row) throw new NotFoundException('销售订单不存在');
    return row;
  }

  async createOrder(data: {
    customerId: number;
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
      } as Partial<SalesOrderItem>;
    });
    const totalAmount = items.reduce((s, i) => s + Number(i.amount), 0);
    const order = this.orderRepo.create({
      orderNo: genNo('SO'),
      customerId: data.customerId,
      status: 'DRAFT',
      orderDate: data.orderDate || todayStr(),
      remark: data.remark || null,
      totalAmount,
      items: items as SalesOrderItem[],
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

  listShipments() {
    return this.shipmentRepo.find({
      relations: ['customer', 'warehouse', 'items', 'items.product'],
      order: { id: 'DESC' },
    });
  }

  async getShipment(id: number) {
    const row = await this.shipmentRepo.findOne({
      where: { id },
      relations: [
        'customer',
        'warehouse',
        'items',
        'items.product',
        'salesOrder',
      ],
    });
    if (!row) throw new NotFoundException('销售出库单不存在');
    return row;
  }

  async createShipment(data: {
    customerId: number;
    warehouseId: number;
    salesOrderId?: number;
    shipmentDate?: string;
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
      } as Partial<SalesShipmentItem>;
    });
    const totalAmount = items.reduce((s, i) => s + Number(i.amount), 0);
    const shipment = this.shipmentRepo.create({
      shipmentNo: genNo('SS'),
      customerId: data.customerId,
      warehouseId: data.warehouseId,
      salesOrderId: data.salesOrderId || null,
      status: 'DRAFT',
      shipmentDate: data.shipmentDate || todayStr(),
      remark: data.remark || null,
      totalAmount,
      items: items as SalesShipmentItem[],
    });
    return this.shipmentRepo.save(shipment);
  }

  /** 确认出库：事务内扣库存；不足则拒绝并回滚 */
  async confirmShipment(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.getRepository(SalesShipment).findOne({
        where: { id },
        relations: ['items'],
      });
      if (!shipment) throw new NotFoundException('销售出库单不存在');
      if (shipment.status !== 'DRAFT') {
        throw new BadRequestException('仅草稿状态可确认出库');
      }

      // 扣库存（内部会检查负库存并抛 BadRequestException）
      await this.inventoryService.decreaseStock(
        manager,
        shipment.items.map((i) => ({
          warehouseId: shipment.warehouseId,
          productId: i.productId,
          quantity: Number(i.quantity),
        })),
        {
          bizType: 'SALES_SHIPMENT',
          bizId: shipment.id,
          bizNo: shipment.shipmentNo,
          remark: '销售出库确认',
        },
      );

      shipment.status = 'CONFIRMED';
      return manager.getRepository(SalesShipment).save(shipment);
    });
  }
}
