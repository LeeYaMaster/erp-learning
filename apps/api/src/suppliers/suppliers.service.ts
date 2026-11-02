import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier) private readonly repo: Repository<Supplier>,
  ) {}

  findAll(keyword?: string) {
    const qb = this.repo.createQueryBuilder('s').orderBy('s.id', 'DESC');
    if (keyword) {
      qb.andWhere('(s.code LIKE :kw OR s.name LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('供应商不存在');
    return row;
  }

  create(data: Partial<Supplier>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Supplier>) {
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
