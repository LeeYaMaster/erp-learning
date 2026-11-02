import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';
import { Supplier } from '../suppliers/supplier.entity';
import { User } from '../users/user.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Supplier) private readonly suppliers: Repository<Supplier>,
    @InjectRepository(Customer) private readonly customers: Repository<Customer>,
    @InjectRepository(Warehouse)
    private readonly warehouses: Repository<Warehouse>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  async onModuleInit() {
    // 启动时自动补齐示例数据，便于登录后立刻走流程
    await this.seedAll();
  }

  async seedAll() {
    await this.ensureAdmin();
    await this.ensureBaseData();
  }

  private async ensureAdmin() {
    const exist = await this.users.findOne({ where: { username: 'admin' } });
    if (exist) return;
    const passwordHash = await bcrypt.hash('admin123', 10);
    await this.users.save(
      this.users.create({
        username: 'admin',
        passwordHash,
        displayName: '系统管理员',
      }),
    );
    this.logger.log('已创建默认账号 admin / admin123');
  }

  private async ensureBaseData() {
    const supplierCount = await this.suppliers.count();
    if (supplierCount === 0) {
      await this.suppliers.save([
        this.suppliers.create({
          code: 'SUP001',
          name: '华东电子供应有限公司',
          contact: '张经理',
          phone: '13800001111',
          address: '上海市浦东新区',
        }),
        this.suppliers.create({
          code: 'SUP002',
          name: '深圳元器件批发商行',
          contact: '李老板',
          phone: '13900002222',
          address: '深圳市华强北',
        }),
      ]);
      this.logger.log('已写入示例供应商');
    }

    const customerCount = await this.customers.count();
    if (customerCount === 0) {
      await this.customers.save([
        this.customers.create({
          code: 'CUS001',
          name: '北京智能科技有限公司',
          contact: '王采购',
          phone: '13700003333',
          address: '北京市海淀区',
        }),
        this.customers.create({
          code: 'CUS002',
          name: '杭州互联网工作室',
          contact: '赵同学',
          phone: '13600004444',
          address: '杭州市西湖区',
        }),
      ]);
      this.logger.log('已写入示例客户');
    }

    const whCount = await this.warehouses.count();
    if (whCount === 0) {
      await this.warehouses.save([
        this.warehouses.create({
          code: 'WH01',
          name: '主仓',
          address: '本市工业园区 A 栋',
        }),
        this.warehouses.create({
          code: 'WH02',
          name: '备用仓',
          address: '本市物流园 B 区',
        }),
      ]);
      this.logger.log('已写入示例仓库');
    }

    const productCount = await this.products.count();
    if (productCount === 0) {
      await this.products.save([
        this.products.create({
          sku: 'SKU-KEYBOARD',
          name: '机械键盘',
          unit: '台',
          purchasePrice: 180,
          salePrice: 299,
          safetyStock: 20,
          remark: '学习示例商品',
        }),
        this.products.create({
          sku: 'SKU-MOUSE',
          name: '无线鼠标',
          unit: '个',
          purchasePrice: 45,
          salePrice: 89,
          safetyStock: 50,
        }),
        this.products.create({
          sku: 'SKU-USBHUB',
          name: 'USB 扩展坞',
          unit: '个',
          purchasePrice: 65,
          salePrice: 129,
          safetyStock: 30,
        }),
      ]);
      this.logger.log('已写入示例商品');
    }
  }
}
