# 服装仓库管理系统 - 项目规格说明书

## 1. 项目概述

- **项目名称：** 服装仓库管理系统（Clothing Warehouse Manager）
- **类型：** 前后端分离的全栈 Web 应用
- **核心功能：** 服装库存管理、借出/归还追踪、丢失登记、库存盘点
- **目标用户：** 仓库管理员（单人）

## 2. 技术栈

| 层次 | 技术 |
|------|------|
| 前端 | Vue 3 + Element Plus + Vite |
| 后端 | Node.js + Express |
| 数据库 | SQLite（轻量、零运维） |
| API 风格 | RESTful JSON |

## 3. 数据模型

### 3.1 服装品目（clothing_items）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| item_code | TEXT UNIQUE | 服装编号（如 "P-2024-00001"） |
| name | TEXT | 服装名称 |
| category | TEXT | 类别（上衣/裤子/裙子/鞋子/配饰） |
| size | TEXT | 尺码 |
| color | TEXT | 颜色 |
| gender | TEXT | 性别适用（男/女/中性） |
| quantity | INTEGER | 当前库存数量 |
| unit | TEXT | 单位（件/条/双/个） |
| status | TEXT | 状态（available/lent/lost） |
| remark | TEXT | 备注 |
| created_at | DATETIME | 入库时间 |

### 3.2 员工档案（employees）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| name | TEXT | 姓名 |
| department | TEXT | 部门 |
| phone | TEXT | 联系方式 |
| created_at | DATETIME | 建档时间 |

### 3.3 借出记录（lend_records）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| record_no | TEXT UNIQUE | 借出单号 |
| employee_id | INTEGER FK | 借用人 |
| lend_date | DATE | 借出日期 |
| due_date | DATE | 应还日期 |
| event_name | TEXT | 活动名称 |
| status | TEXT | 进行中/已归还/部分丢失 |
| created_at | DATETIME | 创建时间 |

### 3.4 借出明细（lend_items）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| record_id | INTEGER FK | 借出记录ID |
| item_id | INTEGER FK | 服装品目ID |
| quantity | INTEGER | 借出数量 |

### 3.5 归还记录（return_records）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| record_id | INTEGER FK | 关联借出单号 |
| return_date | DATE | 归还日期 |
| handled_by | TEXT | 经手人 |

### 3.6 归还明细（return_items）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| return_record_id | INTEGER FK | 归还记录ID |
| item_id | INTEGER FK | 服装品目ID |
| lend_item_id | INTEGER FK | 对应借出明细 |
| quantity | INTEGER | 本次归还数量 |
| condition | TEXT | 正常/损坏/丢失 |

### 3.7 盘点记录（inventory_sessions）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| session_no | TEXT UNIQUE | 盘点单号 |
| session_type | TEXT | full（全量）/partial（指定类别） |
| categories | TEXT | 盘点的类别（JSON数组，partial时有效） |
| start_date | DATE | 盘点日期 |
| status | TEXT | 进行中/已完成 |
| created_at | DATETIME | 创建时间 |

### 3.8 盘点明细（inventory_items）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增ID |
| session_id | INTEGER FK | 盘点记录ID |
| item_id | INTEGER FK | 服装品目ID |
| system_quantity | INTEGER | 系统库存 |
| actual_quantity | INTEGER | 实际盘点数量 |
| discrepancy | INTEGER | 差异（actual - system） |
| handled | INTEGER | 是否处理（0/1） |
| remark | TEXT | 备注 |

## 4. 功能模块

### 4.1 库存管理
- **入库登记：** 新服装入库（支持批量导入）
- **品目查询：** 按编号/类别/状态查询，支持分页
- **品目编辑：** 修改品目信息

### 4.2 服装借出
- **新建借出单：** 选择员工 → 选择服装和数量 → 填写活动名称和应还日期
- **借出单列表：** 查看所有借出单，支持按状态/员工/日期筛选

### 4.3 服装归还
- **新建归还单：** 关联借出单 → 逐件登记归还/损坏/丢失数量
- **归还后：** 自动更新库存数量和品目状态

### 4.4 丢失管理
- 归还时标记丢失的品目，自动减少库存，状态标记为 lost

### 4.5 库存盘点
- **全量盘点：** 对所有品目进行盘点
- **指定类别盘点：** 选择类别（上衣/裤子等）进行盘点
- **盘点报告：** 记录系统数量 vs 实际数量差异

### 4.6 员工管理
- 增删改查员工档案

### 4.7 数据看板
- 当日借出/归还数量
- 当前在借数量
- 丢失统计
- 库存预警（库存低于某值）

## 5. API 路由设计

### 品目
- `GET /api/items` - 查询品目列表（支持分页、筛选）
- `POST /api/items` - 新增品目
- `PUT /api/items/:id` - 更新品目
- `DELETE /api/items/:id` - 删除品目

### 借出
- `GET /api/lend-records` - 借出单列表
- `POST /api/lend-records` - 新建借出单
- `GET /api/lend-records/:id` - 借出单详情

### 归还
- `POST /api/return-records` - 新建归还单
- `GET /api/return-records/:id` - 归还单详情

### 盘点
- `POST /api/inventory` - 新建盘点
- `GET /api/inventory/:id` - 盘点详情
- `PUT /api/inventory/:id` - 更新盘点结果

### 员工
- `GET /api/employees`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### 看板
- `GET /api/dashboard`

## 6. 项目结构

```
clothing-warehouse/
├── server/
│   ├── db/
│   │   ├── schema.sql       # 建表语句
│   │   └── database.sqlite   # SQLite 数据文件
│   ├── routes/
│   │   ├── items.js
│   │   ├── lend.js
│   │   ├── return.js
│   │   ├── inventory.js
│   │   ├── employees.js
│   │   └── dashboard.js
│   ├── index.js              # Express 入口
│   └── package.json
└── client/                   # Vue 前端
    ├── src/
    │   ├── api/              # API 调用封装
    │   ├── views/            # 页面组件
    │   ├── components/       # 公共组件
    │   ├── router/
    │   └── App.vue
    ├── vite.config.js
    └── package.json
```
