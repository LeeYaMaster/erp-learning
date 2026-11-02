import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get('balances')
  balances(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.listBalances({
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      productId: productId ? Number(productId) : undefined,
      keyword,
    });
  }

  @Get('movements')
  movements(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('direction') direction?: string,
  ) {
    return this.service.listMovements({
      warehouseId: warehouseId ? Number(warehouseId) : undefined,
      productId: productId ? Number(productId) : undefined,
      direction,
    });
  }

  @Get('low-stock')
  lowStock() {
    return this.service.lowStockAlerts();
  }
}
