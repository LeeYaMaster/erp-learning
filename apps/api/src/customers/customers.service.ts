import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private readonly repo: Repository<Customer>,
  ) {}

  findAll(keyword?: string) {
    const qb = this.repo.createQueryBuilder('c').orderBy('c.id', 'DESC');
    if (keyword) {
      qb.andWhere('(c.code LIKE :kw OR c.name LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('客户不存在');
    return row;
  }

  create(data: Partial<Customer>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: number, data: Partial<Customer>) {
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
