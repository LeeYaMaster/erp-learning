import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryModule } from '../inventory/inventory.module';
import { PurchaseOrder } from '../purchase/purchase-order.entity';
import { PurchaseReceipt } from '../purchase/purchase-receipt.entity';
import { SalesOrder } from '../sales/sales-order.entity';
import { SalesShipment } from '../sales/sales-shipment.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder,
      PurchaseReceipt,
      SalesOrder,
      SalesShipment,
    ]),
    InventoryModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
