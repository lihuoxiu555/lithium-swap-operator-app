/**
 * 工作台待办 · 对齐 PC：退款管理、渠道商充值、逾期管理
 */
(function (global) {
  const TODO_TYPES = [
    {
      id: "refund",
      title: "退款待审",
      icon: "退",
      source: "订单与服务 · 退款管理",
      empty: "暂无待审退款",
      roles: ["admin"],
    },
    {
      id: "overdue",
      title: "逾期持电",
      icon: "逾",
      source: "订单与服务 · 逾期管理",
      empty: "暂无逾期持电",
      roles: ["admin", "staff"],
    },
    {
      id: "recharge",
      title: "渠道商充值申请",
      icon: "充",
      source: "渠道管理 · 待确认到账 / 打款凭证",
      empty: "暂无待确认充值",
      roles: ["admin"],
    },
  ];

  const REFUND_PRESETS = [
    { id: "full", label: "全额退款" },
    { id: "manual", label: "部分退款" },
    { id: "deposit", label: "仅退押金" },
    { id: "reject", label: "拒绝退款" },
  ];

  const REFUNDS = [
    {
      id: "RF-260610-001",
      type: "refund",
      status: "待审核",
      subtype: "7天未使用退订",
      title: "U2201 · 7天套餐退订",
      summary: "可退 ¥89 · 浦东骑手驿站",
      user: "U2201",
      phone: "138****2201",
      site: "浦东骑手驿站",
      orderId: "SUB260610088",
      pkgName: "7天套餐",
      pkgRefund: 89,
      depositRefund: 0,
      totalRefund: 89,
      purchaseDays: 7,
      usedDays: 0,
      refundableDays: 7,
      emergencySwaps: 0,
      needAdvance: false,
      depositOnly: false,
      earlyEndNoDeposit: false,
      applyTime: "2026-06-10 11:20",
    },
    {
      id: "RF-260615-01",
      type: "refund",
      status: "待审核",
      subtype: "中途完结",
      title: "U1041 · 中途完结",
      summary: "可退套餐 ¥120 · 不退押金",
      user: "U1041",
      phone: "139****1041",
      site: "浦东骑手驿站",
      orderId: "SUB260524002",
      pkgName: "包月30天",
      pkgRefund: 120,
      depositRefund: 0,
      totalRefund: 120,
      purchaseDays: 30,
      usedDays: 18,
      refundableDays: 12,
      emergencySwaps: 0,
      needAdvance: false,
      depositOnly: false,
      earlyEndNoDeposit: true,
      applyTime: "2026-06-15 16:20",
      note: "中途完结仅退套餐费；押金须还电后另申请",
    },
    {
      id: "RF-260615-DEP",
      type: "refund",
      status: "待审核",
      subtype: "押金退还",
      title: "U2188 · 押金退还",
      summary: "可退押金 ¥99 · 已还电",
      user: "U2188",
      phone: "136****2188",
      site: "浦东骑手驿站",
      orderId: "SUB260605033",
      pkgName: "30天畅换",
      pkgRefund: 0,
      depositRefund: 99,
      totalRefund: 99,
      purchaseDays: 30,
      usedDays: null,
      refundableDays: null,
      emergencySwaps: 0,
      needAdvance: false,
      depositOnly: true,
      earlyEndNoDeposit: false,
      applyTime: "2026-06-15 14:20",
      note: "用户已还电 · 仅退电池押金 · 套餐仍服务中",
    },
  ];

  const OVERDUES = [
    {
      id: "OD-P-01",
      type: "overdue",
      status: "open",
      subtype: "个人套餐逾期",
      title: "张骑手 · 到期仍持电",
      summary: "已逾期 3 天 · 占用费 ¥30",
      user: "张骑手",
      userId: "U1028",
      phone: "138****1028",
      site: "浦东骑手驿站",
      sku: "包月30天",
      orderId: "SUB260524001",
      reason: "到期",
      days: 3,
      due: 30,
      dayFee: 10,
      batSn: "BAT-HZ-8831",
      model: "48V30AH",
      lastSwap: "2026-09-12 18:22",
      applyTime: "2026-09-12 23:59",
    },
    {
      id: "OD-P-02",
      type: "overdue",
      status: "open",
      subtype: "个人套餐逾期",
      title: "钱骑手 · 次数耗尽",
      summary: "已逾期 1 天 · 占用费 ¥10",
      user: "钱骑手",
      userId: "U1055",
      phone: "136****1055",
      site: "世博换电服务点",
      sku: "次卡10次",
      orderId: "SUB260525088",
      reason: "次数耗尽",
      days: 1,
      due: 10,
      dayFee: 10,
      batSn: "BAT-HZ-2207",
      model: "30V30AH",
      lastSwap: "2026-09-14 17:40",
      applyTime: "2026-09-14 18:05",
    },
    {
      id: "OD-D-01",
      type: "overdue",
      status: "open",
      subtype: "人天池占用",
      title: "丁舒洋 · 人天已用尽",
      summary: "占用 2 人天 · 顺丰同城欠 2 人天",
      user: "丁舒洋",
      userId: "U-SF-01",
      phone: "176****3868",
      site: "浦东骑手驿站",
      channel: "顺丰同城",
      team: "浦东站",
      days: 2,
      quota: 2,
      poolAfter: -2,
      batSn: "BAT-SF-0199",
      model: "48V30AH",
      lastSwap: "2026-09-12 21:03",
      applyTime: "2026-09-13 00:00",
    },
    {
      id: "OD-D-02",
      type: "overdue",
      status: "open",
      subtype: "人天池占用",
      title: "赵六 · 人天已用尽",
      summary: "占用 1 人天 · 池可用 9",
      user: "赵六",
      userId: "U-SF-06",
      phone: "186****3666",
      site: "陆家嘴分站",
      channel: "顺丰同城",
      team: "默认团队",
      days: 1,
      quota: 1,
      poolAfter: 9,
      batSn: "BAT-SF-0044",
      model: "30V30AH",
      lastSwap: "2026-09-14 20:18",
      applyTime: "2026-09-15 09:10",
    },
  ];

  const RECHARGES = [
    {
      id: "PO-202606-020",
      type: "recharge",
      status: "待确认",
      subtype: "人天采购",
      title: "顺丰同城 · 人天采购",
      summary: "¥17,000 · 2,000 人天",
      channel: "顺丰同城",
      amount: 17000,
      extra: "2,000 人天 · 流水 20260608112233",
      payMethod: "对公转账",
      voucher: "20260608112233",
      applyTime: "2026-06-08 11:00",
    },
    {
      id: "MO-260712",
      type: "recharge",
      status: "待确认",
      subtype: "设备月租",
      title: "京东物流 · 7月月租",
      summary: "¥12,000 · 8 台设备",
      channel: "京东物流租赁渠道",
      amount: 12000,
      extra: "账期 2026-07 · 流水 20260628123456",
      payMethod: "对公转账",
      voucher: "20260628123456",
      applyTime: "2026-06-28 10:00",
    },
    {
      id: "AC-202606-002",
      type: "recharge",
      status: "待确认",
      subtype: "激活码批发",
      title: "蜂鸟激活码 · 7天体验码",
      summary: "¥1,300 · 20 张",
      channel: "蜂鸟激活码渠道",
      amount: 1300,
      extra: "7天体验码 × 20 · 凭证已上传",
      payMethod: "对公转账",
      voucher: "凭证已上传",
      applyTime: "2026-06-11 09:20",
    },
    {
      id: "DP-260612",
      type: "recharge",
      status: "待确认",
      subtype: "保证金凭证",
      title: "京东物流 · 保证金打款",
      summary: "¥50,000 · 待核凭证",
      channel: "京东物流租赁渠道",
      amount: 50000,
      extra: "流水 20260612111222 · 转账日 2026-06-12",
      payMethod: "对公转账",
      voucher: "20260612111222",
      applyTime: "2026-06-12 09:00",
    },
  ];

  const ITEMS = REFUNDS.concat(OVERDUES, RECHARGES);

  function getTypeMeta(typeId) {
    return TODO_TYPES.find((t) => t.id === typeId) || null;
  }

  function getItemById(id) {
    return ITEMS.find((x) => x.id === id) || null;
  }

  function isPending(item) {
    return item.status === "待审核" || item.status === "待确认" || item.status === "open";
  }

  function pendingOf(typeId) {
    return ITEMS.filter((x) => x.type === typeId && isPending(x));
  }

  function canSeeTodos(role) {
    return role === "admin" || role === "staff";
  }

  function canSeeType(role, typeId) {
    const meta = getTypeMeta(typeId);
    if (!meta) return false;
    return meta.roles.includes(role);
  }

  function summaries(role, opts) {
    if (!canSeeTodos(role) || (opts && opts.forceEmpty)) return [];
    return TODO_TYPES.filter((t) => t.roles.includes(role))
      .map((t) => {
        const list = pendingOf(t.id);
        return {
          id: t.id,
          title: t.title,
          icon: t.icon,
          source: t.source,
          count: list.length,
          preview: list[0] ? list[0].summary : t.empty,
        };
      })
      .filter((s) => s.count > 0);
  }

  function totalCount(role, opts) {
    return summaries(role, opts).reduce((n, s) => n + s.count, 0);
  }

  function refundCaps(item) {
    const maxPkg = item.depositOnly ? 0 : Number(item.pkgRefund) || 0;
    const maxDep = item.earlyEndNoDeposit ? 0 : Number(item.depositRefund) || 0;
    return {
      maxPkg,
      maxDep,
      defaultPkg: maxPkg,
      defaultDep: maxDep,
      purchaseDays: item.purchaseDays,
      refundableDays: item.refundableDays,
      emergencySwaps: item.emergencySwaps || 0,
      depositOnly: !!item.depositOnly,
      earlyEndNoDeposit: !!item.earlyEndNoDeposit,
      presets: REFUND_PRESETS.filter((p) => {
        if (p.id === "deposit" && item.earlyEndNoDeposit) return false;
        return true;
      }),
    };
  }

  function applyPreset(item, mode) {
    const caps = refundCaps(item);
    if (mode === "full") return { pkgRefund: String(caps.maxPkg), depositRefund: String(caps.maxDep) };
    if (mode === "deposit") return { pkgRefund: "0", depositRefund: String(caps.maxDep) };
    if (mode === "reject") return { pkgRefund: "", depositRefund: "" };
    return {
      pkgRefund: String(caps.defaultPkg),
      depositRefund: String(caps.defaultDep),
    };
  }

  function processRefund(id, mode, form) {
    const item = getItemById(id);
    if (!item || item.type !== "refund") return { error: "退款单不存在" };
    if (item.status !== "待审核") return { error: "该单已处理" };
    const caps = refundCaps(item);
    if (mode === "reject") {
      const why = String((form && form.rejectReason) || "").trim();
      if (!why) return { error: "请填写拒绝原因" };
      item.status = "已驳回";
      item.rejectReason = why;
      item.processedBy = "演示员";
      item.processedTime = "刚刚";
      item.processMode = "reject";
      return { item, rejected: true };
    }
    const dep = parseFloat(form && form.depositRefund);
    const pkg = parseFloat(form && form.pkgRefund);
    if (Number.isNaN(dep) || dep < 0) return { error: "请填写有效实退押金金额" };
    if (Number.isNaN(pkg) || pkg < 0) return { error: "请填写有效实退订单金额" };
    if (dep > caps.maxDep + 1e-9) return { error: "实退押金不得超过可退押金 ¥" + caps.maxDep.toFixed(2) };
    if (pkg > caps.maxPkg + 1e-9) return { error: "实退订单金额不得超过可退订单金额 ¥" + caps.maxPkg.toFixed(2) };
    if (caps.depositOnly && pkg > 0) return { error: "押金退还不可退订单金额" };
    if (dep === 0 && pkg === 0) return { error: "实退合计须大于 0" };
    item.actualPkg = Math.round(pkg * 100) / 100;
    item.actualDep = Math.round(dep * 100) / 100;
    item.totalRefund = Math.round((item.actualPkg + item.actualDep) * 100) / 100;
    item.status = "已退款";
    item.processedBy = "演示员";
    item.processedTime = "刚刚";
    item.processMode = mode === "full" ? "全额退款" : mode === "deposit" ? "仅退押金" : "部分退款";
    return { item };
  }

  function approveItem(id) {
    const item = getItemById(id);
    if (!item) return { error: "待办不存在" };
    if (item.type === "refund") return { error: "请使用处理退款" };
    if (!isPending(item)) return { error: "该单已处理" };
    item.status = "已确认";
    item.processedBy = "演示员";
    item.processedTime = "刚刚";
    return { item };
  }

  function rejectItem(id, reason) {
    const item = getItemById(id);
    if (!item) return { error: "待办不存在" };
    if (!isPending(item)) return { error: "该单已处理" };
    const why = String(reason || "").trim();
    if (!why) return { error: "请填写驳回原因" };
    item.status = "已驳回";
    item.rejectReason = why;
    item.processedBy = "演示员";
    item.processedTime = "刚刚";
    return { item };
  }

  function remindOverdue(id) {
    const item = getItemById(id);
    if (!item || item.type !== "overdue") return { error: "逾期单不存在" };
    if (item.status !== "open") return { error: "该单已完结" };
    item.reminded = true;
    return { item };
  }

  function returnOverdue(id) {
    const item = getItemById(id);
    if (!item || item.type !== "overdue") return { error: "逾期单不存在" };
    if (item.status !== "open") return { error: "该单已完结" };
    item.status = "done";
    item.processedBy = "演示员";
    item.processedTime = "刚刚";
    return { item };
  }

  function allocOverdue(id) {
    const item = getItemById(id);
    if (!item || item.type !== "overdue") return { error: "逾期单不存在" };
    if (item.subtype !== "人天池占用") return { error: "仅人天池占用可续配" };
    if (item.status !== "open") return { error: "该单已完结" };
    item.status = "done";
    item.processedBy = "演示员";
    item.processedTime = "刚刚";
    item.allocNote = "已续配人天";
    return { item };
  }

  global.OperatorAppTodos = {
    TODO_TYPES,
    REFUND_PRESETS,
    ITEMS,
    getTypeMeta,
    getItemById,
    pendingOf,
    canSeeTodos,
    canSeeType,
    summaries,
    totalCount,
    refundCaps,
    applyPreset,
    processRefund,
    approveItem,
    rejectItem,
    remindOverdue,
    returnOverdue,
    allocOverdue,
  };
})(window);
