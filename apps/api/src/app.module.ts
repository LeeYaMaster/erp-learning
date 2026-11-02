import * as dotenv from 'dotenv';
dotenv.config();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { PurchaseModule } from './purchase/purchase.module';
import { SalesModule } from './sales/sales.module';
import { InventoryModule } from './inventory/inventory.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Customer } from './customers/customer.entity';
import { Supplier } from './suppliers/supplier.entity';
import { Warehouse } from './warehouses/warehouse.entity';
import { PurchaseOrder } from './purchase/purchase-order.entity';
import { PurchaseOrderItem } from './purchase/purchase-order-item.entity';
import { PurchaseReceipt } from './purchase/purchase-receipt.entity';
import { PurchaseReceiptItem } from './purchase/purchase-receipt-item.entity';
import { SalesOrder } from './sales/sales-order.entity';
import { SalesOrderItem } from './sales/sales-order-item.entity';
import { SalesShipment } from './sales/sales-shipment.entity';
import { SalesShipmentItem } from './sales/sales-shipment-item.entity';
import { StockBalance } from './inventory/stock-balance.entity';
import { StockMovement } from './inventory/stock-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      username: process.env.DB_USER || 'erp',
      password: process.env.DB_PASSWORD || 'erp123',
      database: process.env.DB_NAME || 'erp_learning',
      entities: [
        User,
        Product,
        Customer,
        Supplier,
        Warehouse,
        PurchaseOrder,
        PurchaseOrderItem,
        PurchaseReceipt,
        PurchaseReceiptItem,
        SalesOrder,
        SalesOrderItem,
        SalesShipment,
        SalesShipmentItem,
        StockBalance,
        StockMovement,
      ],
      synchronize: true, // 学习版：自动建表，生产勿用
      timezone: '+08:00',
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CustomersModule,
    SuppliersModule,
    WarehousesModule,
    PurchaseModule,
    SalesModule,
    InventoryModule,
    DashboardModule,
    SeedModule,
  ],
})
export class AppModule {}
