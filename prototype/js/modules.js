/**
 * 运营商 APP · 模块注册表（插拔唯一接口）
 *
 * 新增业务模块：
 * 1. 在 MODULE_REGISTRY 增加一条（status 先 placeholder 或 ready）
 * 2. 若 ready，在 app.js 增加对应页面渲染；宫格只展示 ready
 * 3. placeholder 不进宫格；hash 直链进统一占位页「暂未开放」
 * 4. 不要改底栏 Tab 结构
 *
 * 字段：id / name / group / icon / status / roles / badge? / route
 */
(function (global) {
  const MODULE_GROUPS = ["经营", "运维", "财务", "其他"];

  /** @type {Array<{
   *   id: string,
   *   name: string,
   *   group: string,
   *   icon: string,
   *   status: 'placeholder' | 'ready',
   *   roles: Array<'admin'|'staff'>,
   *   badge?: number,
   *   route: string
   * }>} */
  const MODULE_REGISTRY = [
    {
      id: "lease.orders",
      name: "换电订单",
      group: "经营",
      icon: "📋",
      status: "ready",
      roles: ["admin", "staff"],
      route: "#/module/lease.orders",
    },
    {
      id: "biz.stats",
      name: "经营统计",
      group: "经营",
      icon: "📈",
      status: "ready",
      roles: ["admin", "staff"],
      route: "#/module/biz.stats",
    },
    {
      id: "ops.deviceStats",
      name: "设备统计",
      group: "经营",
      icon: "📟",
      status: "ready",
      roles: ["admin", "staff"],
      route: "#/module/ops.deviceStats",
    },
    {
      id: "demo.ops",
      name: "示例·经营",
      group: "经营",
      icon: "📊",
      status: "placeholder",
      roles: ["admin"],
      route: "#/module/demo.ops",
    },
    {
      id: "ops.sites",
      name: "站点",
      group: "运维",
      icon: "📍",
      status: "ready",
      roles: ["admin", "staff"],
      route: "#/module/ops.sites",
    },
    {
      id: "ops.cabinets",
      name: "电柜管理",
      group: "运维",
      icon: "🔲",
      status: "ready",
      roles: ["admin", "staff"],
      route: "#/module/ops.cabinets",
    },
    {
      id: "users.list",
      name: "用户管理",
      group: "其他",
      icon: "👤",
      status: "ready",
      roles: ["admin", "staff"],
      route: "#/module/users.list",
    },
    {
      id: "users.sms",
      name: "短信验证码",
      group: "其他",
      icon: "💬",
      status: "placeholder",
      roles: ["admin", "staff"],
      route: "#/module/users.sms",
    },
    {
      id: "users.payments",
      name: "用户支付记录",
      group: "其他",
      icon: "💳",
      status: "ready",
      roles: ["admin", "staff"],
      route: "#/module/users.payments",
    },
    {
      id: "demo.order",
      name: "示例·订单",
      group: "经营",
      icon: "☰",
      status: "placeholder",
      roles: ["admin", "staff"],
      route: "#/module/demo.order",
    },
    {
      id: "finance.account",
      name: "账户",
      group: "财务",
      icon: "🏦",
      status: "ready",
      roles: ["admin"],
      route: "#/module/finance.account",
    },
    {
      id: "demo.finance",
      name: "示例·财务",
      group: "财务",
      icon: "¥",
      status: "placeholder",
      roles: ["admin"],
      route: "#/module/demo.finance",
    },
    {
      id: "demo.todo",
      name: "示例·审批",
      group: "其他",
      icon: "✓",
      status: "placeholder",
      roles: ["admin"],
      route: "#/module/demo.todo",
    },
    {
      id: "demo.more",
      name: "示例·更多",
      group: "其他",
      icon: "⋯",
      status: "placeholder",
      roles: ["admin", "staff"],
      route: "#/module/demo.more",
    },
  ];

  function getModuleById(id) {
    return MODULE_REGISTRY.find((m) => m.id === id) || null;
  }

  function modulesForRole(role, options = {}) {
    const forceEmpty = !!options.forceEmpty;
    if (forceEmpty) return [];
    return MODULE_REGISTRY.filter(
      (m) => m.roles.includes(role) && m.status === "ready"
    );
  }

  function groupModules(modules) {
    const map = {};
    MODULE_GROUPS.forEach((g) => {
      map[g] = [];
    });
    modules.forEach((m) => {
      if (!map[m.group]) map[m.group] = [];
      map[m.group].push(m);
    });
    return MODULE_GROUPS.map((g) => ({ group: g, items: map[g] || [] })).filter(
      (block) => block.items.length > 0
    );
  }

  global.OperatorAppModules = {
    MODULE_GROUPS,
    MODULE_REGISTRY,
    getModuleById,
    modulesForRole,
    groupModules,
  };
})(window);
