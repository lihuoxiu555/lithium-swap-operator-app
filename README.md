# 锂电快换 · 运营商工作台

运营商手机端**可插拔工作台**框架（业务模块后置）。用户可见品牌名：**锂电快换**。

## 快速打开

- 原型：[`prototype/index.html`](prototype/index.html)
- PRD：[`docs/PRD.md`](docs/PRD.md)
- 验收：[`docs/acceptance-criteria.md`](docs/acceptance-criteria.md)
- 决策：[`decisions/decision-001.md`](decisions/decision-001.md)

本地预览建议：

```bash
cd 原型-运营商APP && python3 -m http.server 8788
# 打开 http://127.0.0.1:8788/prototype/index.html
```

## 演示账号

| 手机号 | 密码 | 身份 |
|--------|------|------|
| 13800000005 | 123456 | 管理员 + 员工 |
| 13900000001 | 123456 | 仅员工 |

## 插拔模块

编辑 [`prototype/js/modules.js`](prototype/js/modules.js) 注册表即可增减宫格；`status: placeholder` 进统一占位页。

**已接入**：
- 底栏待办 → 退款待审 / 逾期持电 / 渠道商充值申请（`js/todos.js`）
- 底栏待办 · 警告 → 高温 / 设备异常；换电柜异常五类封闭枚举（`js/alerts.js`）
- 经营 → **换电订单**（个人换电 / 人天池，`lease.orders`，`js/lease-orders.js` · `js/daypool-orders.js`）
- 经营 → **套餐订单**（个人套餐购买，`biz.packageOrders`，`js/package-orders.js`）
- 运营 → **经营统计 / 电柜管理 / 设备统计**（`js/ops-stats.js` · `js/cabinets.js`；电柜详情对齐 PC 全量区块）
- 运维 → **站点**（`ops.sites`，`js/sites.js`；对齐 PC 站点信息一期）
- 财务 → **账户**（`finance.account`，`js/finance-account.js`；总金额/冻结中/可提现、收款账户、提现明细）
- 其他 → **用户管理 / 用户支付记录**（`js/users.js`；短信验证码已屏蔽；实名认证由平台处理）