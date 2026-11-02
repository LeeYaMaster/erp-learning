import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryService } from '../inventory/inventory.service';
import { PurchaseOrder } from '../purchase/purchase-order.entity';
import { PurchaseReceipt } from '../purchase/purchase-receipt.entity';
import { SalesOrder } from '../sales/sales-order.entity';
import { SalesShipment } from '../sales/sales-shipment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseReceipt)
    private readonly prRepo: Repository<PurchaseReceipt>,
    @InjectRepository(SalesOrder)
    private readonly soRepo: Repository<SalesOrder>,
    @InjectRepository(SalesShipment)
    private readonly ssRepo: Repository<SalesShipment>,
    private readonly inventoryService: InventoryService,
  ) {}

  async summary() {
    const today = new Date().toISOString().slice(0, 10);

    const [
      todayPurchaseOrders,
      todayPurchaseReceipts,
      todaySalesOrders,
      todaySalesShipments,
      lowStock,
      recentPurchase,
      recentSales,
    ] = await Promise.all([
      this.poRepo.count({ where: { orderDate: today as any } }),
      this.prRepo.count({ where: { receiptDate: today as any } }),
      this.soRepo.count({ where: { orderDate: today as any } }),
      this.ssRepo.count({ where: { shipmentDate: today as any } }),
      this.inventoryService.lowStockAlerts(),
      this.prRepo
        .createQueryBuilder('r')
        .select('SUM(r.totalAmount)', 'amount')
        .addSelect('COUNT(*)', 'count')
        .where('r.status = :st', { st: 'CONFIRMED' })
        .andWhere('r.receiptDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)')
        .getRawOne(),
      this.ssRepo
        .createQueryBuilder('s')
        .select('SUM(s.totalAmount)', 'amount')
        .addSelect('COUNT(*)', 'count')
        .where('s.status = :st', { st: 'CONFIRMED' })
        .andWhere('s.shipmentDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)')
        .getRawOne(),
    ]);

    return {
      todayDocs: {
        purchaseOrders: todayPurchaseOrders,
        purchaseReceipts: todayPurchaseReceipts,
        salesOrders: todaySalesOrders,
        salesShipments: todaySalesShipments,
        total:
          todayPurchaseOrders +
          todayPurchaseReceipts +
          todaySalesOrders +
          todaySalesShipments,
      },
      lowStock,
      recent7Days: {
        purchaseAmount: Number(recentPurchase?.amount || 0),
        purchaseCount: Number(recentPurchase?.count || 0),
        salesAmount: Number(recentSales?.amount || 0),
        salesCount: Number(recentSales?.count || 0),
      },
    };
  }
}
