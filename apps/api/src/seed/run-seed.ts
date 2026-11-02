/**
 * 独立 seed 脚本：pnpm --filter @erp/api seed
 * 也可依赖 API 启动时的 OnModuleInit 自动补齐。
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seed = app.get(SeedService);
  await seed.seedAll();
  console.log('Seed 完成');
  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
