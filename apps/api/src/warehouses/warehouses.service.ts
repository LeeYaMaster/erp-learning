import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse) private readonly repo: Repository<Warehouse>,
  ) {}

  findAll(keyword?: string) {
    const qb = this.repo.createQueryBuilder('w').orderBy('w.id', 'DESC');
    if (keyword) {
      qb.andWhere('(w.code LIKE :kw OR w.name LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('仓库不存在');
    return row;
  }

  create(data: Partial<Warehouse>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Warehouse>) {
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
