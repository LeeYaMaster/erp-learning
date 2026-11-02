import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { StockBalance } from './stock-balance.entity';
import { StockMovement } from './stock-movement.entity';

export interface StockChangeItem {
  warehouseId: number;
  productId: number;
  quantity: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockBalance)
    private readonly balanceRepo: Repository<StockBalance>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
  ) {}

  /**
   * 在事务内增加库存（采购入库等）。
   * 必须传入 EntityManager，保证与单据确认同一事务。
   */
  async increaseStock(
    manager: EntityManager,
    items: StockChangeItem[],
    meta: { bizType: string; bizId: number; bizNo?: string; remark?: string },
  ) {
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new BadRequestException('入库数量必须大于 0');
      }
      // 行锁，避免并发入库/出库互相覆盖
      let balance = await manager
        .getRepository(StockBalance)
        .createQueryBuilder('b')
        .setLock('pessimistic_write')
        .where('b.warehouseId = :wid AND b.productId = :pid', {
          wid: item.warehouseId,
          pid: item.productId,
        })
        .getOne();

      if (!balance) {
        balance = manager.getRepository(StockBalance).create({
          warehouseId: item.warehouseId,
          productId: item.productId,
          quantity: 0,
        });
      }

      const qty = Number(balance.quantity) + Number(item.quantity);
      balance.quantity = qty;
      await manager.getRepository(StockBalance).save(balance);

      await manager.getRepository(StockMovement).save(
        manager.getRepository(StockMovement).create({
          warehouseId: item.warehouseId,
          productId: item.productId,
          direction: 'IN',
          quantity: item.quantity,
          balanceAfter: qty,
          bizType: meta.bizType,
          bizId: meta.bizId,
          bizNo: meta.bizNo || null,
          remark: meta.remark || null,
        }),
      );
    }
  }

  /**
   * 在事务内扣减库存（销售出库等）。
   * 禁止负库存：任一明细不足则整单回滚。
   */
  async decreaseStock(
    manager: EntityManager,
    items: StockChangeItem[],
    meta: { bizType: string; bizId: number; bizNo?: string; remark?: string },
  ) {
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new BadRequestException('出库数量必须大于 0');
      }
      const balance = await manager
        .getRepository(StockBalance)
        .createQueryBuilder('b')
        .setLock('pessimistic_write')
        .where('b.warehouseId = :wid AND b.productId = :pid', {
          wid: item.warehouseId,
          pid: item.productId,
        })
        .getOne();

      const current = balance ? Number(balance.quantity) : 0;
      if (current < Number(item.quantity)) {
        throw new BadRequestException(
          `库存不足：仓库#${item.warehouseId} 商品#${item.productId} 现有 ${current}，需要 ${item.quantity}`,
        );
      }

      const qty = current - Number(item.quantity);
      balance!.quantity = qty;
      await manager.getRepository(StockBalance).save(balance!);

      await manager.getRepository(StockMovement).save(
        manager.getRepository(StockMovement).create({
          warehouseId: item.warehouseId,
          productId: item.productId,
          direction: 'OUT',
          quantity: item.quantity,
          balanceAfter: qty,
          bizType: meta.bizType,
          bizId: meta.bizId,
          bizNo: meta.bizNo || null,
          remark: meta.remark || null,
        }),
      );
    }
  }

  async listBalances(query: {
    warehouseId?: number;
    productId?: number;
    keyword?: string;
  }) {
    const qb = this.balanceRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.warehouse', 'w')
      .leftJoinAndSelect('b.product', 'p')
      .orderBy('b.id', 'DESC');

    if (query.warehouseId) {
      qb.andWhere('b.warehouseId = :wid', { wid: query.warehouseId });
    }
    if (query.productId) {
      qb.andWhere('b.productId = :pid', { pid: query.productId });
    }
    if (query.keyword) {
      qb.andWhere('(p.sku LIKE :kw OR p.name LIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }
    return qb.getMany();
  }

  async listMovements(query: {
    warehouseId?: number;
    productId?: number;
    direction?: string;
  }) {
    const qb = this.movementRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.warehouse', 'w')
      .leftJoinAndSelect('m.product', 'p')
      .orderBy('m.id', 'DESC')
      .take(200);

    if (query.warehouseId) {
      qb.andWhere('m.warehouseId = :wid', { wid: query.warehouseId });
    }
    if (query.productId) {
      qb.andWhere('m.productId = :pid', { pid: query.productId });
    }
    if (query.direction) {
      qb.andWhere('m.direction = :dir', { dir: query.direction });
    }
    return qb.getMany();
  }

  async getBalance(warehouseId: number, productId: number) {
    const row = await this.balanceRepo.findOne({
      where: { warehouseId, productId },
      relations: ['warehouse', 'product'],
    });
    if (!row) throw new NotFoundException('无库存记录');
    return row;
  }

  /** 低于安全库存的商品（按全部仓库合计） */
  async lowStockAlerts() {
    const rows = await this.balanceRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.product', 'p')
      .select('p.id', 'productId')
      .addSelect('p.sku', 'sku')
      .addSelect('p.name', 'name')
      .addSelect('p.unit', 'unit')
      .addSelect('p.safetyStock', 'safetyStock')
      .addSelect('SUM(b.quantity)', 'totalQty')
      .groupBy('p.id')
      .having('SUM(b.quantity) < p.safetyStock')
      .getRawMany();
    return rows.map((r) => ({
      productId: Number(r.productId),
      sku: r.sku,
      name: r.name,
      unit: r.unit,
      safetyStock: Number(r.safetyStock),
      totalQty: Number(r.totalQty),
    }));
  }
}
