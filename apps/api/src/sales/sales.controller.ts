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
import { SalesService } from './sales.service';

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
  customerId: number;

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

class CreateShipmentDto {
  @IsNumber()
  customerId: number;

  @IsNumber()
  warehouseId: number;

  @IsOptional()
  @IsNumber()
  salesOrderId?: number;

  @IsOptional()
  @IsString()
  shipmentDate?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineDto)
  items: LineDto[];
}

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

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

  @Get('shipments')
  listShipments() {
    return this.service.listShipments();
  }

  @Get('shipments/:id')
  getShipment(@Param('id', ParseIntPipe) id: number) {
    return this.service.getShipment(id);
  }

  @Post('shipments')
  createShipment(@Body() dto: CreateShipmentDto) {
    return this.service.createShipment(dto);
  }

  @Post('shipments/:id/confirm')
  confirmShipment(@Param('id', ParseIntPipe) id: number) {
    return this.service.confirmShipment(id);
  }
}
