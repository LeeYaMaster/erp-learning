import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  findAll(keyword?: string) {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.id', 'DESC');
    if (keyword) {
      qb.andWhere('(p.sku LIKE :kw OR p.name LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('商品不存在');
    return row;
  }

  create(data: Partial<Product>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Product>) {
    const row = await this.findOne(id);
    Object.assign(row, data);
    return this.repo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.repo.remove(row);
    return { success: true };
  }
}
