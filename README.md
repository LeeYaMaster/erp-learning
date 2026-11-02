# 进销存 ERP 学习版

通过一套**可跑通**的代码学习完整业务流程：

**基础资料 → 采购订单 → 采购入库（加库存）→ 库存查询 → 销售订单 → 销售出库（扣库存）**

技术栈：

- Monorepo：`pnpm` workspace
- `apps/api`：NestJS + TypeScript + TypeORM + MySQL + JWT
- `apps/web`：React + Vite + TypeScript + Ant Design
- 根目录 `docker-compose.yml` 启动 MySQL 8

---

## 1. 环境要求

- Node.js 18+
- pnpm 8+（本仓库优先 pnpm；也可用 npm workspaces，需自行调整）
- Docker / Docker Compose（用于 MySQL）

---

## 2. 启动数据库

```bash
cd /workspace/erp-learning   # 或你的项目路径
docker compose up -d
```

默认 MySQL 配置（见 `docker-compose.yml`）：

| 项 | 值 |
| --- | --- |
| 端口 | `3306` |
| 库名 | `erp_learning` |
| 用户 | `erp` / `erp123` |
| root 密码 | `root123` |

健康检查通过后再启动 API。

---

## 3. 安装依赖

```bash
pnpm install
```

---

## 4. 配置环境变量

API：

```bash
cp apps/api/.env.example apps/api/.env
```

Web（可选，默认已指向本地 API）：

```bash
cp apps/web/.env.example apps/web/.env
```

---

## 5. 启动服务

开两个终端：

```bash
# 终端 1：API（默认 http://localhost:3000/api）
pnpm dev:api

# 终端 2：Web（默认 http://localhost:5173）
pnpm dev:web
```

API 启动时会自动：

1. TypeORM `synchronize` 建表（学习版）
2. Seed 写入默认账号与示例基础资料

也可单独执行 seed：

```bash
pnpm seed
```

---

## 6. 默认账号

- 用户名：`admin`
- 密码：`admin123`

---

## 7. 业务走查（端到端）

登录后建议按下列顺序点一遍，体会库存如何增减：

### 7.1 查看基础资料（Seed 已有）

1. 侧边栏 **基础资料 → 供应商 / 客户 / 仓库 / 商品**
2. 确认存在示例供应商、客户、主仓、机械键盘等商品

### 7.2 采购入库（增加库存）

1. **采购 → 采购订单** → 新建：选供应商，加商品明细（数量如 100）→ 保存草稿 → **确认**
2. **采购 → 采购入库** → 新建：可选关联已确认采购订单（会带出明细），选 **主仓** → 保存草稿 → **确认入库**
3. 到 **库存 → 库存余额** 应看到对应数量；**出入库流水** 有一条 `IN / PURCHASE_RECEIPT`

### 7.3 销售出库（扣减库存）

1. **销售 → 销售订单** → 新建：选客户与商品 → 确认
2. **销售 → 销售出库** → 新建：关联订单或手填，**同一仓库**，数量不要超过库存 → 确认出库
3. 库存余额减少，流水出现 `OUT / SALES_SHIPMENT`

### 7.4 体验「库存不足拒绝」

1. 再建一张出库单，数量故意大于当前库存
2. 点 **确认出库** → 接口返回错误提示（前端 message），单据保持草稿，库存不变

### 7.5 仪表盘

打开 **仪表盘**：今日单据数、近 7 日采销汇总、低于安全库存预警（种子商品安全库存较高，刚入库若仍低于阈值会列出）。

---

## 8. 目录结构（摘要）

```
erp-learning/
├── docker-compose.yml          # MySQL 8
├── package.json                # workspace 脚本
├── pnpm-workspace.yaml
├── README.md
└── apps/
    ├── api/                    # NestJS 后端
    │   ├── .env.example
    │   └── src/
    │       ├── auth/           # JWT 登录
    │       ├── users/
    │       ├── products/ customers/ suppliers/ warehouses/
    │       ├── purchase/       # 采购订单 + 入库
    │       ├── sales/          # 销售订单 + 出库
    │       ├── inventory/      # 余额、流水、事务加减库存
    │       ├── dashboard/
    │       └── seed/           # 启动自动 seed
    └── web/                    # React 前端
        ├── .env.example
        └── src/
            ├── pages/          # 各业务中文页面
            ├── layouts/
            └── api/
```

---

## 9. 关键设计要点（学习向）

- **库存变更必须在事务里**：入库/出库确认使用 `DataSource.transaction`，并配合悲观锁更新 `stock_balances`，同时写入 `stock_movements`
- **出库禁止负库存**：扣减前检查余额，不足抛出业务错误，整单回滚
- 单据状态：`DRAFT` → `CONFIRMED`（订单还可 `CANCELLED`）
- 不做完整财务/成本核算；单据上保留单价、金额字段即可

---

## 10. 已知限制

- TypeORM `synchronize: true` 仅适合学习，生产请改迁移
- 无完整权限体系（仅登录鉴权）
- 无审批流、无多币种、无批次/序列号
- 单据不可编辑已确认明细；取消订单不会自动回滚已入库库存
- 本机需自行保证 MySQL 已启动且端口 3306 可用

祝学习顺利。
