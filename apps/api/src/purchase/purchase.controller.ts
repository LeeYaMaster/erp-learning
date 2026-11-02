import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchaseService } from './purchase.service';

class LineDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

class CreateOrderDto {
  @IsNumber()
  supplierId: number;

  @IsOptional()
  @IsString()
  orderDate?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineDto)
  items: LineDto[];
}

class CreateReceiptDto {
  @IsNumber()
  supplierId: number;

  @IsNumber()
  warehouseId: number;

  @IsOptional()
  @IsNumber()
  purchaseOrderId?: number;

  @IsOptional()
  @IsString()
  receiptDate?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineDto)
  items: LineDto[];
}

@UseGuards(JwtAuthGuard)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}

  @Get('orders')
  listOrders() {
    return this.service.listOrders();
  }

  @Get('orders/:id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOrder(id);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.service.createOrder(dto);
  }

  @Post('orders/:id/confirm')
  confirmOrder(@Param('id', ParseIntPipe) id: number) {
    return this.service.confirmOrder(id);
  }

  @Post('orders/:id/cancel')
  cancelOrder(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancelOrder(id);
  }

  @Get('receipts')
  listReceipts() {
    return this.service.listReceipts();
  }

  @Get('receipts/:id')
  getReceipt(@Param('id', ParseIntPipe) id: number) {
    return this.service.getReceipt(id);
  }

  @Post('receipts')
  createReceipt(@Body() dto: CreateReceiptDto) {
    return this.service.createReceipt(dto);
  }

  @Post('receipts/:id/confirm')
  confirmReceipt(@Param('id', ParseIntPipe) id: number) {
    return this.service.confirmReceipt(id);
  }
}
