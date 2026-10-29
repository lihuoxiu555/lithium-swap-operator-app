/**
 * 渠道管理 · 签约渠道 / 渠道订单 / 渠道权益（移动端）
 * Mock 自 原型-外卖 config-mock 子集；decision-098 信用额度
 */
(function (global) {
  const OPERATOR_ID = "OP-SX";
  const PAYEE_OPERATOR = "绿色出行";
  const CHANNEL_DEFAULT_CREDIT_LIMIT = 100000;

  /** 展示用（含历史签约 · 二期） */
  const SETTLEMENT_MODES = [
    { id: "人天池", label: "人天池" },
    { id: "链接类", label: "推广（链接类）" },
    { id: "设备租赁", label: "设备租赁（二期）" },
    { id: "激活码", label: "激活码（二期）" },
  ];

  /** 新增渠道商可选结算模式（运营商 APP 一期） */
  const NEW_CHANNEL_SETTLEMENT_MODES = [
    { id: "人天池", label: "人天池" },
    { id: "链接类", label: "推广（链接类）" },
  ];

  const MAIN_TABS = [
    { id: "contracts", label: "签约渠道" },
    { id: "orders", label: "渠道订单" },
    { id: "assets", label: "渠道权益" },
  ];

  /** 渠道管理首页 · 子模块入口（不直出列表） */
  const MENU_ENTRIES = [
    { id: "contracts", label: "签约渠道", icon: "📋" },
    { id: "orders", label: "渠道订单", icon: "🧾" },
    { id: "assets", label: "渠道权益", icon: "💎" },
    { id: "quotaPricing", label: "人天批发价", icon: "📊" },
    { id: "cardPricing", label: "推广分销价", icon: "🏷" },
    { id: "linkSettle", label: "推广结算", icon: "💰" },
  ];

  const PLATFORM_STD_DAY_PRICE = 8.5;

  /** @type {Array<object>} 平台设置 → 人天批发价 Mock */
  let operatorDayQuotaPrices = [
    {
      id: "OP-Q-DEF",
      operatorId: OPERATOR_ID,
      channelId: "*",
      channelName: "默认批发价",
      wholesalePrice: 8.5,
      minDays: 500,
      status: "生效",
    },
    {
      id: "OP-Q-SF",
      operatorId: OPERATOR_ID,
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      wholesalePrice: 8.5,
      minDays: 1000,
      status: "生效",
    },
  ];

  /** @type {Array<object>} 渠道管理 → 推广结算 · 订单明细 Mock */
  const channelLinkOrders = [
    {
      id: "LO-260601",
      channelId: "CH-CARD",
      linkPurpose: "App 首页 Banner",
      riderName: "骑手A",
      phone: "138****2001",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25.11,
      commissionSettlement: "即时分账",
      payTime: "2026-06-01 09:12",
      commissionClawback: 0,
    },
    {
      id: "LO-260610",
      channelId: "CH-CARD",
      linkPurpose: "社群福利帖",
      riderName: "刘骑士",
      phone: "138****3001",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25.11,
      commissionSettlement: "即时分账",
      payTime: "2026-06-10 16:30",
      commissionClawback: 25.11,
      refundPkg: 279,
    },
    {
      id: "LO-260612",
      channelId: "CH-CARD",
      linkPurpose: "短信召回活动",
      riderName: "骑手D",
      phone: "136****2004",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25,
      commissionSettlement: "线下结算",
      payTime: "2026-06-12 11:08",
      commissionClawback: 0,
    },
    {
      id: "LO-260518",
      channelId: "CH-DELIV",
      linkPurpose: "闪送 App 内嵌",
      riderName: "闪送骑手E",
      phone: "136****4002",
      skuName: "包月30天卡",
      paidPrice: 269,
      commission: 30,
      commissionSettlement: "线下结算",
      payTime: "2026-05-18 11:20",
      commissionClawback: 0,
    },
    {
      id: "LO-260611",
      channelId: "CH-DELIV",
      linkPurpose: "闪送 App 内嵌",
      riderName: "闪送骑手D",
      phone: "136****4001",
      skuName: "包月30天卡",
      paidPrice: 269,
      commission: 30,
      commissionSettlement: "线下结算",
      payTime: "2026-06-11 10:00",
      commissionClawback: 0,
    },
  ];

  /** @type {Array<object>} */
  let offlineCommissionSettlements = [
    {
      id: "OCS-DELIV-202605",
      channelId: "CH-DELIV",
      month: "2026-05",
      status: "已线下结清",
      voucherNo: "TXN-DEL-2605-01",
      settledAt: "2026-06-05",
    },
    {
      id: "OCS-DELIV-202606",
      channelId: "CH-DELIV",
      month: "2026-06",
      status: "已线下结清",
      voucherNo: "TXN-DEL-2606-08",
      settledAt: "2026-07-03",
    },
  ];

  const LINK_SETTLE_SUB_TABS = [
    { id: "summary", label: "月度汇总" },
    { id: "detail", label: "订单明细" },
  ];

  /** 运营商 APP 一期：仅人天批发订单（月租/激活码见待办·渠道充值） */
  const ORDER_SUB_TABS = [{ id: "day", label: "人天批发" }];

  /** 运营商 APP 一期：仅人天池 + 渠道分销（租赁/激活码二期不上线） */
  const ASSET_SUB_TABS = [
    { id: "dayPool", label: "人天池" },
    { id: "card", label: "渠道分销" },
  ];

  const CHANNEL_CITIES = ["上海", "杭州"];
  const CHANNEL_STATUSES = ["在营", "已停用"];
  const DEFAULT_DAY_WHOLESALE = 8.5;
  const DEFAULT_DAY_MIN = 500;
  const DEFAULT_CHANNEL_PASSWORD = "123456";

  /** @type {Array<object>} */
  let channelContracts = [
    {
      id: "CC-SF-01",
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      settlementMode: "人天池",
      wholesalePrice: 8.5,
      minDays: 1000,
      sites: ["浦东骑手驿站", "世博换电服务点"],
      status: "在营",
    },
    {
      id: "CC-TEMP-01",
      channelId: "CH-TEMP",
      channelName: "临时渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      settlementMode: "人天池",
      wholesalePrice: 8.5,
      minDays: 500,
      sites: ["浦东骑手驿站"],
      status: "在营",
    },
    {
      id: "CC-CARD-01",
      channelId: "CH-CARD",
      channelName: "骑士卡渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      settlementMode: "链接类",
      wholesalePrice: 249,
      minDays: null,
      cardSkus: ["SKU-30D", "SKU-7D"],
      sites: ["浦东骑手驿站", "世博换电服务点", "陆家嘴分站"],
      instantCommissionPayout: true,
      commissionRate: 0.09,
      status: "在营",
    },
    {
      id: "CC-DELIV-01",
      channelId: "CH-DELIV",
      channelName: "闪送骑士卡",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      settlementMode: "链接类",
      wholesalePrice: 235,
      minDays: null,
      cardSkus: ["SKU-DEL-30D", "SKU-DEL-7D"],
      sites: ["浦东骑手驿站", "世博换电服务点"],
      instantCommissionPayout: false,
      commissionRate: null,
      status: "在营",
    },
    {
      id: "CC-RENT-01",
      channelId: "CH-RENT",
      channelName: "京东物流租赁渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      settlementMode: "设备租赁",
      wholesalePrice: null,
      minDays: null,
      monthlyRent: 12000,
      dedicatedSiteName: "京东物流专属站",
      whitelistCount: 50,
      billingStatus: "6月已缴",
      sites: ["京东物流专属站"],
      status: "在营",
    },
    {
      id: "CC-ACT-01",
      channelId: "CH-ACT",
      channelName: "蜂鸟激活码渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      settlementMode: "激活码",
      wholesalePrice: 255,
      minDays: null,
      minCodes: 100,
      codeSkuName: "30天包月",
      codeValidityDays: 30,
      codeInventory: 420,
      codesRedeemed: 86,
      sites: [],
      status: "在营",
    },
  ];

  /** 平台渠道商主体（与 PC「渠道商管理」对齐） */
  /** @type {Array<object>} */
  let platformChannels = [
    {
      id: "CH-SF",
      name: "顺丰同城渠道",
      city: "上海",
      status: "在营",
      settlementMode: "人天池",
      loginAccount: "13900003100",
      contactName: "陈渠道",
      contactPhone: "139****3100",
    },
    {
      id: "CH-TEMP",
      name: "临时渠道",
      city: "上海",
      status: "在营",
      settlementMode: "人天池",
      loginAccount: "13900003998",
      contactName: "临时对接",
      contactPhone: "139****3998",
    },
    {
      id: "CH-CARD",
      name: "骑士卡渠道",
      city: "上海",
      status: "在营",
      settlementMode: "链接类",
      loginAccount: "13900003201",
      contactName: "王卡务",
      contactPhone: "139****3201",
    },
    {
      id: "CH-DELIV",
      name: "闪送骑士卡",
      city: "上海",
      status: "在营",
      settlementMode: "链接类",
      loginAccount: "13900003210",
      contactName: "李卡务",
      contactPhone: "139****3210",
    },
    {
      id: "CH-RENT",
      name: "京东物流租赁渠道",
      city: "上海",
      status: "在营",
      settlementMode: "设备租赁",
      loginAccount: "13900003301",
      contactName: "赵租金",
      contactPhone: "139****3301",
    },
    {
      id: "CH-ACT",
      name: "蜂鸟激活码渠道",
      city: "上海",
      status: "在营",
      settlementMode: "激活码",
      loginAccount: "13900003401",
      contactName: "周码务",
      contactPhone: "139****3401",
    },
  ];

  /** @type {Array<object>} */
  let channelCreditProfiles = [
    {
      channelId: "CH-SF",
      creditLimit: 100000,
      platformCreditLimit: 100000,
      operatorOverride: null,
      requiredDeposit: 18000,
      paidDeposit: 18000,
      creditedAmount: 18000,
      gap: 0,
      ridersOnBook: 6,
      alert: null,
      updatedAt: "2026-06-10",
    },
    {
      channelId: "CH-RENT",
      creditLimit: 100000,
      platformCreditLimit: 100000,
      operatorOverride: null,
      requiredDeposit: 150000,
      paidDeposit: 0,
      creditedAmount: 100000,
      gap: 50000,
      ridersOnBook: 50,
      alert: "押金缺口 ¥50,000，请提交打款凭证",
      updatedAt: "2026-06-10",
    },
    {
      channelId: "CH-ACT",
      creditLimit: 100000,
      platformCreditLimit: 100000,
      operatorOverride: null,
      requiredDeposit: 12000,
      paidDeposit: 12000,
      creditedAmount: 12000,
      gap: 0,
      ridersOnBook: 86,
      alert: null,
      updatedAt: "2026-06-10",
    },
  ];

  /** @type {Array<object>} */
  let channelSalesOrders = [
    {
      id: "PO-202601-088",
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      poolId: "QP-2601",
      days: 10000,
      unitPrice: 8.5,
      amount: 85000,
      payMethod: "对公转账",
      orderStatus: "已完成",
      payStatus: "已付款",
      createdAt: "2026-01-05 09:30",
      payTime: "2026-01-05 10:00",
      transferRef: "20260105100088",
    },
    {
      id: "PO-202606-012",
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      poolId: "QP-2601",
      days: 500,
      unitPrice: 8.5,
      amount: 4250,
      payMethod: "支付宝扫码",
      orderStatus: "已完成",
      payStatus: "已付款",
      createdAt: "2026-06-01 13:58",
      payTime: "2026-06-01 14:02",
    },
    {
      id: "PO-202606-020",
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      poolId: "QP-2601",
      days: 2000,
      unitPrice: 8.5,
      amount: 17000,
      payMethod: "对公转账",
      orderStatus: "待确认到账",
      payStatus: "待付款",
      createdAt: "2026-06-08 11:00",
      payTime: null,
      transferRef: "20260608112233",
      offlineVoucher: "20260608112233",
    },
    {
      id: "PO-202606-088",
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      poolId: null,
      days: 300,
      unitPrice: 8.5,
      amount: 2550,
      payMethod: "微信扫码",
      orderStatus: "待支付",
      payStatus: "待支付",
      createdAt: "2026-06-10 14:20",
      payTime: null,
    },
    {
      id: "PO-202606-089",
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      poolId: null,
      days: 150,
      unitPrice: 8.5,
      amount: 1275,
      payMethod: "微信扫码",
      orderStatus: "支付中",
      payStatus: "支付中",
      createdAt: "2026-06-10 15:05",
      payTime: null,
    },
  ];

  /** @type {Array<object>} */
  let channelRentTopupOrders = [
    {
      id: "MO-260601",
      channelId: "CH-RENT",
      channelName: "京东物流租赁渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      amount: 12000,
      devicesCovered: 8,
      payMethod: "对公转账",
      orderStatus: "已完成",
      payStatus: "已付款",
      createdAt: "2026-06-01 09:30",
      payTime: "2026-06-01 10:00",
      period: "2026-06",
      confirmedBy: "张经理",
    },
    {
      id: "MO-260712",
      channelId: "CH-RENT",
      channelName: "京东物流租赁渠道",
      operatorId: "OP-SX",
      operatorName: PAYEE_OPERATOR,
      amount: 12000,
      devicesCovered: 8,
      payMethod: "对公转账",
      orderStatus: "待确认到账",
      payStatus: "待付款",
      createdAt: "2026-06-28 10:00",
      payTime: null,
      period: "2026-07",
      offlineVoucher: "20260628123456",
    },
  ];

  /** @type {Array<object>} */
  let channelActivationOrders = [
    {
      id: "AC-202605-001",
      channelId: "CH-ACT",
      channelName: "蜂鸟激活码渠道",
      operatorId: "OP-SX",
      skuName: "30天包月码",
      qty: 500,
      unitPrice: 255,
      amount: 127500,
      validityDays: 30,
      payMethod: "对公转账",
      orderStatus: "已完成",
      payStatus: "已付款",
      createdAt: "2026-05-08 10:00",
      payTime: "2026-05-09 11:30",
      codesMinted: 500,
      mintStatus: "已发码",
    },
    {
      id: "AC-202605-003",
      channelId: "CH-ACT",
      channelName: "蜂鸟激活码渠道",
      operatorId: "OP-SX",
      skuName: "7天体验码",
      qty: 50,
      unitPrice: 65,
      amount: 3250,
      validityDays: 7,
      payMethod: "对公转账",
      orderStatus: "已完成",
      payStatus: "已付款",
      createdAt: "2026-05-20 14:00",
      payTime: "2026-05-21 10:00",
      codesMinted: 50,
      mintStatus: "已发码",
    },
    {
      id: "AC-202606-002",
      channelId: "CH-ACT",
      channelName: "蜂鸟激活码渠道",
      operatorId: "OP-SX",
      skuName: "7天体验码",
      qty: 20,
      unitPrice: 65,
      amount: 1300,
      validityDays: 7,
      payMethod: "对公转账",
      orderStatus: "待确认到账",
      payStatus: "待付款",
      createdAt: "2026-06-11 09:20",
      payTime: null,
      offlineVoucher: "凭证已上传",
      codesMinted: 0,
      mintStatus: "未发码",
    },
  ];

  /** @type {Array<object>} */
  let dayPools = [
    {
      id: "QP-2601",
      name: "顺丰浦东人天池",
      ownerId: "CH-SF",
      ownerName: "顺丰同城渠道",
      sellerId: "OP-SX",
      sellerName: PAYEE_OPERATOR,
      totalDays: 10000,
      availableDays: 55,
      frozenDays: 12,
      consumedDays: 9933,
      wholesalePrice: 8.5,
      orderNo: "PO-202601-088",
      status: "余额不足",
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
    },
    {
      id: "QP-2602",
      name: "临时渠道人天池",
      ownerId: "CH-TEMP",
      ownerName: "临时渠道",
      sellerId: "OP-SX",
      sellerName: PAYEE_OPERATOR,
      totalDays: 2000,
      availableDays: 1680,
      frozenDays: 0,
      consumedDays: 320,
      wholesalePrice: 8.5,
      orderNo: "PO-202603-015",
      status: "使用中",
      validFrom: "2026-03-01",
      validTo: "2026-12-31",
    },
  ];

  /** @type {Array<object>} */
  let dayPoolLedger = [
    {
      id: "LG-001",
      poolId: "QP-2601",
      time: "2026-01-05 10:00",
      type: "购买入账",
      deltaDays: 10000,
      balanceAfter: 10000,
      operator: PAYEE_OPERATOR,
      ref: "PO-202601-088",
      reason: "向运营商批发采购",
    },
    {
      id: "LG-002",
      poolId: "QP-2601",
      time: "2026-02-01 09:00",
      type: "赠送入账",
      deltaDays: 200,
      balanceAfter: 10200,
      operator: PAYEE_OPERATOR,
      ref: "—",
      reason: "运营商活动赠送",
    },
    {
      id: "LG-004",
      poolId: "QP-2601",
      time: "2026-06-09 08:30",
      type: "确认消耗",
      deltaDays: 0,
      balanceAfter: 185,
      operator: "系统",
      ref: "U2101",
      reason: "换电确认消耗 1 人天",
    },
    {
      id: "LG-004b",
      poolId: "QP-2601",
      time: "2026-06-09 12:00",
      type: "确认消耗",
      deltaDays: 0,
      balanceAfter: 184,
      operator: "系统",
      ref: "U2106",
      reason: "日终持电确认消耗 1 人天",
    },
    {
      id: "LG-006",
      poolId: "QP-2601",
      time: "2026-06-07 16:20",
      type: "回池",
      deltaDays: 18,
      balanceAfter: 227,
      operator: "系统",
      ref: "U2111",
      reason: "离职回池",
    },
    {
      id: "LG-T04",
      poolId: "QP-2602",
      time: "2026-05-12 10:30",
      type: "购买入账",
      deltaDays: 0,
      balanceAfter: 2000,
      operator: PAYEE_OPERATOR,
      ref: "PO-202603-015",
      reason: "确认到账入账完成",
    },
  ];

  /** @type {Array<object>} */
  const channelSalePackages = [
    {
      id: "PKG-30D",
      channelId: "CH-CARD",
      skuId: "SKU-30D",
      name: "包月30天卡",
      batteryModel: "48V30Ah",
      officialPrice: 299,
      channelPrice: 279,
      commissionPerOrder: 25,
      validityDays: 30,
      status: "启用",
    },
    {
      id: "PKG-7D",
      channelId: "CH-CARD",
      skuId: "SKU-7D",
      name: "7天卡",
      batteryModel: "48V30Ah",
      officialPrice: 89,
      channelPrice: 79,
      commissionPerOrder: 8,
      validityDays: 7,
      status: "启用",
    },
    {
      id: "PKG-DEL-30D",
      channelId: "CH-DELIV",
      skuId: "SKU-DEL-30D",
      name: "包月30天卡",
      batteryModel: "48V30Ah",
      officialPrice: 299,
      channelPrice: 269,
      commissionPerOrder: 30,
      validityDays: 30,
      status: "启用",
    },
    {
      id: "PKG-DEL-7D",
      channelId: "CH-DELIV",
      skuId: "SKU-DEL-7D",
      name: "7天卡",
      batteryModel: "48V30Ah",
      officialPrice: 89,
      channelPrice: 75,
      commissionPerOrder: 7,
      validityDays: 7,
      status: "启用",
    },
  ];

  /** @type {Array<object>} */
  let channelLeaseSummary = [
    {
      channelId: "CH-RENT",
      monthlyRent: 12000,
      devicesCovered: 8,
      cabinets: 5,
      batteries: 3,
      whitelistCount: 50,
      dedicatedSiteName: "京东物流专属站",
      nextDue: "2026-07-01",
      billingStatus: "6月已缴",
      monthSwaps: 428,
    },
  ];

  const POOL_ADJUST_TYPES = ["充值", "赠送", "退款", "修正"];

  function defaultState() {
    return {
      tab: "contracts",
      ordersSub: "day",
      assetsSub: "dayPool",
      view: "menu",
      editId: null,
      creditChannelId: null,
      form: {},
      ledgerPoolId: "QP-2601",
      poolId: null,
      ledgerChannelId: "全部",
      ledgerType: "全部",
      poolForm: {},
      linkSettleSub: "summary",
      linkSettleFilter: {
        monthFrom: "2026-05",
        monthTo: "2026-06",
        channelId: "全部",
        settleType: "全部",
      },
      quotaEditId: null,
      cardEditId: null,
      linkSettleRegisterKey: null,
      quotaForm: {},
      cardForm: {},
      offlineSettleForm: {},
    };
  }

  function payMonthKey(payTime) {
    if (!payTime) return "";
    return String(payTime).slice(0, 7);
  }

  function orderCommissionSettleType(o) {
    return o.commissionSettlement || "线下结算";
  }

  function orderCommissionClawback(o) {
    if (o.commissionClawback != null) return Number(o.commissionClawback) || 0;
    return 0;
  }

  function myLinkContracts() {
    return channelContracts.filter(
      (c) => c.operatorId === OPERATOR_ID && contractSettlementMode(c) === "链接类"
    );
  }

  function channelDisplayName(channelId) {
    const c = channelContracts.find((x) => x.channelId === channelId);
    if (c) return c.channelName;
    const p = platformChannels.find((x) => x.id === channelId);
    return p ? p.name : channelId;
  }

  function offlineCommissionSettleRecord(channelId, month) {
    return offlineCommissionSettlements.find(
      (s) => s.channelId === channelId && s.month === month
    );
  }

  function promoSettleRangeMonths(f) {
    const from = f.monthFrom || "2026-05";
    const to = f.monthTo || "2026-06";
    const out = [];
    let y = parseInt(from.slice(0, 4), 10);
    let m = parseInt(from.slice(5, 7), 10);
    const endY = parseInt(to.slice(0, 4), 10);
    const endM = parseInt(to.slice(5, 7), 10);
    while (y < endY || (y === endY && m <= endM)) {
      out.push(`${y}-${String(m).padStart(2, "0")}`);
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return out;
  }

  function operatorLinkSettleMonthRows(rangeMonths, channelFilter) {
    const months = rangeMonths || [];
    const contracts = myLinkContracts().filter(
      (c) => !channelFilter || channelFilter === "全部" || c.channelId === channelFilter
    );
    const rows = [];
    contracts.forEach((c) => {
      months.forEach((month) => {
        const orders = channelLinkOrders.filter(
          (o) => o.channelId === c.channelId && payMonthKey(o.payTime) === month
        );
        if (!orders.length) return;
        const grouped = new Map();
        orders.forEach((o) => {
          const t = orderCommissionSettleType(o);
          if (!grouped.has(t)) grouped.set(t, []);
          grouped.get(t).push(o);
        });
        ["即时分账", "线下结算"].forEach((t) => {
          const list = grouped.get(t);
          if (!list) return;
          const clawback = list.reduce((s, o) => s + orderCommissionClawback(o), 0);
          const comm = list.reduce((s, o) => s + Number(o.commission || 0), 0);
          const rec =
            t === "线下结算" ? offlineCommissionSettleRecord(c.channelId, month) : null;
          rows.push({
            key: `${c.channelId}|${month}|${t}`,
            channelId: c.channelId,
            channelName: c.channelName,
            month,
            settleType: t,
            orderCount: list.length,
            totalPaid: list.reduce((s, o) => s + Number(o.paidPrice || 0), 0),
            totalCommission: comm,
            totalClawback: clawback,
            netCommission: Math.round((comm - clawback) * 100) / 100,
            status:
              t === "即时分账"
                ? "已即时分账"
                : rec?.status || "待线下结清",
            voucherNo: rec?.voucherNo || "",
            settledAt: rec?.settledAt || "",
          });
        });
      });
    });
    return rows.sort((a, b) => {
      if (a.month !== b.month) return b.month.localeCompare(a.month);
      return String(a.channelName).localeCompare(String(b.channelName), "zh");
    });
  }

  function pendingLinkSettleBadgeCount() {
    return operatorLinkSettleMonthRows(promoSettleRangeMonths({ monthFrom: "2026-01", monthTo: "2026-12" }), "全部").filter(
      (r) => r.status === "待线下结清"
    ).length;
  }

  function operatorQuotaRows() {
    return operatorDayQuotaPrices
      .filter((r) => r.operatorId === OPERATOR_ID)
      .slice()
      .sort((a, b) => {
        if (a.channelId === "*") return -1;
        if (b.channelId === "*") return 1;
        return String(a.channelName).localeCompare(String(b.channelName), "zh");
      });
  }

  function quotaPriceForChannel(channelId) {
    return operatorDayQuotaPrices.find(
      (q) => q.operatorId === OPERATOR_ID && q.channelId === channelId
    );
  }

  function dayPoolContractsForQuota() {
    return channelContracts.filter(
      (c) => c.operatorId === OPERATOR_ID && contractSettlementMode(c) === "人天池"
    );
  }

  function cardPricingRows() {
    const linkIds = new Set(myLinkContracts().map((c) => c.channelId));
    return channelSalePackages
      .filter((s) => linkIds.has(s.channelId))
      .map((s) =>
        Object.assign({}, s, { channelName: channelDisplayName(s.channelId) })
      );
  }

  function registerOfflineCommissionSettle(channelId, month, voucherNo, settledAt) {
    const no = String(voucherNo || "").trim();
    if (!no) return { ok: false, msg: "请填写打款流水号" };
    const day = String(settledAt || "").trim() || formatLocal().slice(0, 10);
    let rec = offlineCommissionSettlements.find(
      (s) => s.channelId === channelId && s.month === month
    );
    if (rec) {
      rec.status = "已线下结清";
      rec.voucherNo = no;
      rec.settledAt = day;
    } else {
      offlineCommissionSettlements.push({
        id: `OCS-${channelId}-${month.replace("-", "")}`,
        channelId,
        month,
        status: "已线下结清",
        voucherNo: no,
        settledAt: day,
      });
    }
    return { ok: true };
  }

  function saveQuotaPricing(form, editId) {
    const price = Number(form.wholesalePrice);
    const minDays = parseInt(form.minDays, 10);
    if (!Number.isFinite(price) || price <= 0) return { ok: false, msg: "批发价无效" };
    if (!Number.isFinite(minDays) || minDays < 1) return { ok: false, msg: "起购人天无效" };
    if (editId === "new") {
      const channelId = form.channelId;
      if (!channelId || channelId === "*") return { ok: false, msg: "请选择渠道" };
      if (quotaPriceForChannel(channelId)) return { ok: false, msg: "该渠道已配置" };
      const c = channelContracts.find((x) => x.channelId === channelId);
      operatorDayQuotaPrices.push({
        id: "OP-Q-" + Date.now(),
        operatorId: OPERATOR_ID,
        channelId,
        channelName: c ? c.channelName : channelId,
        wholesalePrice: price,
        minDays,
        status: form.status || "生效",
      });
      return { ok: true, created: true };
    }
    const row = operatorDayQuotaPrices.find((r) => r.id === editId);
    if (!row) return { ok: false, msg: "记录不存在" };
    row.wholesalePrice = price;
    row.minDays = minDays;
    row.status = form.status || row.status;
    if (row.channelId !== "*") {
      const contract = channelContracts.find((c) => c.channelId === row.channelId);
      if (contract) {
        contract.wholesalePrice = price;
        contract.minDays = minDays;
      }
    }
    return { ok: true };
  }

  function saveCardPricing(form, editId) {
    if (editId === "new") return { ok: false, msg: "演示：请编辑已有 SKU" };
    const sku = channelSalePackages.find((s) => s.id === editId);
    if (!sku) return { ok: false, msg: "SKU 不存在" };
    const official = Number(sku.officialPrice);
    const channel = Number(form.channelPrice);
    const comm = Number(form.commissionPerOrder);
    if (channel > official) return { ok: false, msg: "专享价不能高于正式价" };
    if (comm > official - channel) return { ok: false, msg: "佣金不能高于可分配收入" };
    sku.channelPrice = channel;
    sku.commissionPerOrder = comm;
    sku.status = form.status || sku.status;
    return { ok: true };
  }

  function getPoolById(id) {
    return dayPools.find((p) => p.id === id) || null;
  }

  function poolChannelOptions() {
    const opts = [{ id: "全部", name: "全部渠道商" }];
    dayPools.forEach((p) => {
      if (!opts.some((o) => o.id === p.ownerId)) {
        opts.push({ id: p.ownerId, name: p.ownerName });
      }
    });
    return opts;
  }

  function ledgerTypeOptions() {
    const set = new Set(dayPoolLedger.map((l) => l.type));
    POOL_ADJUST_TYPES.forEach((t) => set.add(t));
    return ["全部", ...Array.from(set).sort()];
  }

  function enrichLedgerRow(row) {
    const pool = getPoolById(row.poolId);
    return Object.assign({}, row, {
      channelId: pool?.ownerId,
      channelName: pool?.ownerName || "—",
      poolName: pool?.name || row.poolId,
    });
  }

  function filterLedgerRows(ch) {
    const channelId = ch.ledgerChannelId || "全部";
    const type = ch.ledgerType || "全部";
    return dayPoolLedger
      .map(enrichLedgerRow)
      .filter((l) => {
        if (channelId !== "全部" && l.channelId !== channelId) return false;
        if (type !== "全部" && l.type !== type) return false;
        return true;
      })
      .sort((a, b) => String(b.time).localeCompare(String(a.time)));
  }

  function appendPoolLedgerEntry(pool, type, deltaDays, ref, reason, operatorName) {
    dayPoolLedger.unshift({
      id: "LG-" + Date.now(),
      poolId: pool.id,
      time: formatLocal(),
      type,
      deltaDays,
      balanceAfter: pool.availableDays,
      operator: operatorName || PAYEE_OPERATOR,
      ref: ref || "—",
      reason: reason || "",
    });
  }

  function adjustPoolQuota(poolId, adjustType, rawDays, remark, operatorName) {
    const p = getPoolById(poolId);
    if (!p) return { ok: false, msg: "额度池不存在" };
    const days = parseInt(rawDays, 10);
    if (!Number.isFinite(days) || days <= 0) return { ok: false, msg: "请输入有效人天数" };
    const isDeduct = adjustType === "退款" || adjustType === "修正";
    const delta = isDeduct ? -days : days;
    if (isDeduct && p.availableDays + delta < 0) {
      return {
        ok: false,
        msg: `扣减后可用不能为负（当前 ${p.availableDays} 人天）`,
      };
    }
    p.availableDays += delta;
    if (!isDeduct) {
      p.totalDays += days;
      if (adjustType === "赠送") p.giftedDays = (p.giftedDays || 0) + days;
    } else if (adjustType === "退款") {
      p.refundedDays = (p.refundedDays || 0) + days;
    }
    p.balancePct = p.totalDays
      ? Math.round((p.availableDays / p.totalDays) * 1000) / 10
      : 0;
    if (p.availableDays > 0 && p.status === "余额不足") p.status = "使用中";
    appendPoolLedgerEntry(
      p,
      adjustType,
      delta,
      String(remark || "").slice(0, 24) || "协商单",
      remark,
      operatorName
    );
    return { ok: true, pool: p };
  }

  function readPoolAdjustFromDom() {
    const g = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };
    return {
      adjustType: g("ch-pool-adjust-type") || "充值",
      adjustDays: g("ch-pool-adjust-days"),
      remark: g("ch-pool-adjust-remark"),
    };
  }

  function formatLocal() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      p(d.getMonth() + 1) +
      "-" +
      p(d.getDate()) +
      " " +
      p(d.getHours()) +
      ":" +
      p(d.getMinutes())
    );
  }

  function contractSettlementMode(c) {
    return (c && c.settlementMode) || "人天池";
  }

  function channelUsesCreditEval(channelId) {
    const c = channelContracts.find((x) => x.channelId === channelId);
    return c ? contractSettlementMode(c) !== "链接类" : true;
  }

  function settlementModeLabel(mode) {
    const m = mode || "人天池";
    const hit = SETTLEMENT_MODES.find((x) => x.id === m);
    return hit ? hit.label : m;
  }

  function formatCommissionRate(rate) {
    if (rate == null) return "—";
    return (rate * 100).toFixed(1).replace(/\.0$/, "") + "%";
  }

  function contractPricingText(c) {
    const mode = contractSettlementMode(c);
    if (mode === "链接类") {
      const skus = channelSalePackages.filter((s) => s.channelId === c.channelId);
      const instant = c.instantCommissionPayout
        ? ` · 佣金及时 ${formatCommissionRate(c.commissionRate)}`
        : "";
      if (!skus.length) return "待配置分销价" + instant;
      return (
        skus
          .map(
            (s) =>
              `${s.name} · 专享 ¥${s.channelPrice} / 佣 ¥${s.commissionPerOrder}`
          )
          .join("；") + instant
      );
    }
    if (mode === "设备租赁") {
      const lease = channelLeaseSummary.find((p) => p.channelId === c.channelId);
      const rent = c.monthlyRent || lease?.monthlyRent || 0;
      return `月租 ¥${rent.toLocaleString("zh-CN")} · 覆盖 ${lease?.devicesCovered || "—"} 台`;
    }
    if (mode === "激活码") {
      return `¥${c.wholesalePrice}/码 · ${c.codeSkuName || "—"} ${c.codeValidityDays || 30} 天`;
    }
    return `¥${c.wholesalePrice}/人天`;
  }

  function contractTermsText(c) {
    const mode = contractSettlementMode(c);
    if (mode === "链接类") {
      const n = channelSalePackages.filter((s) => s.channelId === c.channelId).length;
      const settle = c.instantCommissionPayout
        ? `佣金及时到付 ${formatCommissionRate(c.commissionRate)}`
        : "佣金线下结算";
      return n ? `授权 ${n} SKU · ${settle}` : `授权 SKU 待配置 · ${settle}`;
    }
    if (mode === "设备租赁") {
      return `专属站 ${c.dedicatedSiteName || "—"} · 白名单 ${c.whitelistCount || "—"} 人`;
    }
    if (mode === "激活码") {
      return `库存 ${c.codeInventory ?? "—"} · 已核销 ${c.codesRedeemed ?? "—"}`;
    }
    return `${c.minDays || "—"} 人天起 · 站点 ${(c.sites || []).length} 个`;
  }

  function myContracts(operatorId) {
    const op = operatorId || OPERATOR_ID;
    return channelContracts.filter((c) => c.operatorId === op);
  }

  function getContractById(id) {
    return channelContracts.find((c) => c.id === id) || null;
  }

  function getCreditProfile(channelId) {
    return channelCreditProfiles.find((p) => p.channelId === channelId) || null;
  }

  function ensureChannelCreditProfile(channelId) {
    if (!channelId || !channelUsesCreditEval(channelId)) return null;
    let prof = getCreditProfile(channelId);
    if (!prof) {
      prof = {
        channelId,
        creditLimit: CHANNEL_DEFAULT_CREDIT_LIMIT,
        platformCreditLimit: CHANNEL_DEFAULT_CREDIT_LIMIT,
        operatorOverride: null,
        requiredDeposit: 0,
        paidDeposit: 0,
        creditedAmount: 0,
        gap: 0,
        ridersOnBook: 0,
        alert: null,
        updatedAt: formatLocal().slice(0, 10),
      };
      channelCreditProfiles.push(prof);
    }
    return prof;
  }

  function getPlatformChannel(channelId) {
    return platformChannels.find((p) => p.id === channelId) || null;
  }

  function inheritDayQuota() {
    const def = operatorDayQuotaPrices.find(
      (r) => r.operatorId === OPERATOR_ID && r.channelId === "*"
    );
    if (def) {
      return { wholesalePrice: def.wholesalePrice, minDays: def.minDays };
    }
    return { wholesalePrice: DEFAULT_DAY_WHOLESALE, minDays: DEFAULT_DAY_MIN };
  }

  function emptyForm() {
    return {
      channelName: "",
      loginAccount: "",
      settlementMode: "人天池",
      city: "上海",
      status: "在营",
      contactName: "",
      contactPhone: "",
      wholesalePriceAct: "255",
      minCodes: "100",
      codeSkuName: "30天包月",
      codeValidityDays: "30",
      monthlyRent: "12000",
      whitelistDefaultAccess: "paid",
      crossNetworkEnabled: "1",
      dedicatedSiteId: "",
      newSiteName: "",
      instantCommissionPayout: "0",
      commissionRatePct: "9",
    };
  }

  function formFromContract(c) {
    if (!c) return emptyForm();
    const ch = getPlatformChannel(c.channelId);
    return {
      channelName: c.channelName || ch?.name || "",
      loginAccount: ch?.loginAccount || "",
      settlementMode: contractSettlementMode(c),
      city: ch?.city || "上海",
      status: ch?.status || c.status || "在营",
      contactName: ch?.contactName || "",
      contactPhone: ch?.contactPhone || "",
      wholesalePriceAct:
        c.wholesalePrice != null ? String(c.wholesalePrice) : "255",
      minCodes: c.minCodes != null ? String(c.minCodes) : "100",
      codeSkuName: c.codeSkuName || "30天包月",
      codeValidityDays:
        c.codeValidityDays != null ? String(c.codeValidityDays) : "30",
      monthlyRent:
        c.monthlyRent != null ? String(c.monthlyRent) : "12000",
      whitelistDefaultAccess: c.whitelistDefaultAccess || "paid",
      crossNetworkEnabled: c.crossNetworkEnabled === false ? "0" : "1",
      dedicatedSiteId: c.dedicatedSiteId || "",
      newSiteName: "",
      instantCommissionPayout: c.instantCommissionPayout ? "1" : "0",
      commissionRatePct:
        c.commissionRate != null ? String(c.commissionRate * 100) : "9",
    };
  }

  function syncFormModeSections() {
    const modeEl = document.getElementById("ch-form-settlementMode");
    const root = document.getElementById("ch-contract-form");
    const mode =
      (modeEl && modeEl.value) ||
      (root && root.dataset.settlementMode) ||
      "人天池";
    document.querySelectorAll("[data-ch-field]").forEach((el) => {
      const modes = (el.getAttribute("data-ch-field") || "").split(/\s+/);
      el.style.display =
        modes.includes("all") || modes.includes(mode) ? "" : "none";
    });
    const instant =
      document.getElementById("ch-form-instantCommissionPayout")?.value === "1";
    document.querySelectorAll("[data-ch-field-instant]").forEach((el) => {
      el.style.display = mode === "链接类" && instant ? "" : "none";
    });
  }

  function saveContract(form, editId) {
    const channelName = String(form.channelName || "").trim();
    const loginAccount = String(form.loginAccount || "").trim();
    const settlementMode = form.settlementMode || "人天池";
    const city = form.city || "上海";
    const status = form.status || "在营";
    const contactName = String(form.contactName || "").trim();
    const contactPhone = String(form.contactPhone || "").trim();

    if (!channelName) return { ok: false, msg: "请填写渠道商名称" };
    if (!loginAccount) return { ok: false, msg: "请填写登录手机号" };
    if (!/^1\d{10}$/.test(loginAccount)) {
      return { ok: false, msg: "登录账号须为 11 位手机号" };
    }

    const isNew = !editId || editId === "new";
    if (isNew && settlementMode !== "人天池" && settlementMode !== "链接类") {
      return { ok: false, msg: "新增仅支持人天池或推广（链接类）" };
    }

    const inherited = inheritDayQuota();
    let wholesalePrice = null;
    let minDays = null;
    let minCodes = null;
    let codeSkuName = null;
    let codeValidityDays = null;
    let monthlyRent = null;
    let instantCommissionPayout = false;
    let commissionRate = null;
    let dedicatedSiteId = null;
    let dedicatedSiteName = null;
    let whitelistDefaultAccess = null;
    let crossNetworkEnabled = null;

    if (settlementMode === "人天池") {
      wholesalePrice = inherited.wholesalePrice;
      minDays = inherited.minDays;
    } else if (settlementMode === "激活码") {
      wholesalePrice = parseFloat(form.wholesalePriceAct);
      minCodes = parseInt(form.minCodes, 10);
      codeSkuName = form.codeSkuName || "30天包月";
      codeValidityDays = parseInt(form.codeValidityDays, 10) || 30;
      if (!Number.isFinite(wholesalePrice) || wholesalePrice <= 0) {
        return { ok: false, msg: "请填写有效单码批发价" };
      }
      if (!Number.isFinite(minCodes) || minCodes <= 0) {
        return { ok: false, msg: "请填写最低起购（码）" };
      }
    } else if (settlementMode === "设备租赁") {
      monthlyRent = parseFloat(form.monthlyRent);
      if (!Number.isFinite(monthlyRent) || monthlyRent <= 0) {
        return { ok: false, msg: "请填写月租" };
      }
      whitelistDefaultAccess = form.whitelistDefaultAccess || "paid";
      crossNetworkEnabled = form.crossNetworkEnabled !== "0";
      dedicatedSiteId = form.dedicatedSiteId || null;
      if (dedicatedSiteId === "new") {
        const nm = String(form.newSiteName || "").trim();
        if (!nm) return { ok: false, msg: "请填写新建专属站名称" };
        dedicatedSiteId = "ST-NEW-" + Date.now().toString().slice(-4);
        dedicatedSiteName = nm;
      } else if (dedicatedSiteId) {
        dedicatedSiteName =
          dedicatedSiteId === "ST-JD"
            ? "京东物流专属站"
            : form.newSiteName || "专属站";
      }
    } else if (settlementMode === "链接类") {
      instantCommissionPayout = form.instantCommissionPayout === "1";
      if (instantCommissionPayout) {
        const pct = parseFloat(form.commissionRatePct);
        if (!Number.isFinite(pct) || pct <= 0 || pct > 50) {
          return { ok: false, msg: "请填写有效佣金比例（0.1～50）" };
        }
        commissionRate = pct / 100;
      }
    }

    if (editId && editId !== "new") {
      const row = getContractById(editId);
      if (!row) return { ok: false, msg: "签约不存在" };
      row.channelName = channelName;
      row.status = status;
      const plat = getPlatformChannel(row.channelId);
      if (plat) {
        plat.name = channelName;
        plat.loginAccount = loginAccount;
        plat.city = city;
        plat.status = status;
        plat.contactName = contactName;
        plat.contactPhone = contactPhone;
      }
      if (settlementMode === "激活码") {
        row.wholesalePrice = wholesalePrice;
        row.minCodes = minCodes;
        row.codeSkuName = codeSkuName;
        row.codeValidityDays = codeValidityDays;
      }
      if (settlementMode === "设备租赁") {
        row.monthlyRent = monthlyRent;
        row.whitelistDefaultAccess = whitelistDefaultAccess;
        row.crossNetworkEnabled = crossNetworkEnabled;
        row.dedicatedSiteId = dedicatedSiteId;
        row.dedicatedSiteName = dedicatedSiteName;
      }
      if (settlementMode === "链接类") {
        row.instantCommissionPayout = instantCommissionPayout;
        row.commissionRate = commissionRate;
      }
      return { ok: true, contract: row };
    }

    const channelId = "CH-" + Date.now().toString().slice(-6);
    const contractId = "CC-" + Date.now().toString().slice(-6);
    platformChannels.unshift({
      id: channelId,
      name: channelName,
      city,
      status,
      settlementMode,
      loginAccount,
      contactName,
      contactPhone,
    });
    const sites =
      settlementMode === "人天池"
        ? ["浦东骑手驿站"]
        : dedicatedSiteName
          ? [dedicatedSiteName]
          : [];
    const row = {
      id: contractId,
      channelId,
      channelName,
      operatorId: OPERATOR_ID,
      operatorName: PAYEE_OPERATOR,
      settlementMode,
      wholesalePrice,
      minDays,
      minCodes,
      codeSkuName,
      codeValidityDays,
      codeInventory: settlementMode === "激活码" ? 0 : undefined,
      codesRedeemed: settlementMode === "激活码" ? 0 : undefined,
      monthlyRent,
      dedicatedSiteId,
      dedicatedSiteName,
      whitelistDefaultAccess,
      crossNetworkEnabled,
      whitelistCount: settlementMode === "设备租赁" ? 0 : undefined,
      billingStatus: settlementMode === "设备租赁" ? "待首缴" : undefined,
      instantCommissionPayout,
      commissionRate,
      cardSkus: settlementMode === "链接类" ? [] : undefined,
      sites,
      status,
    };
    channelContracts.unshift(row);
    if (settlementMode === "人天池") {
      dayPools.unshift({
        id: "QP-" + Date.now().toString().slice(-4),
        name: channelName + "人天池",
        ownerId: channelId,
        ownerName: channelName,
        sellerId: OPERATOR_ID,
        sellerName: PAYEE_OPERATOR,
        totalDays: 0,
        availableDays: 0,
        frozenDays: 0,
        consumedDays: 0,
        giftedDays: 0,
        refundedDays: 0,
        expiredDays: 0,
        validFrom: formatLocal().slice(0, 10),
        validTo: "2026-12-31",
        wholesalePrice: wholesalePrice,
        orderNo: null,
        status: "待首购",
        balancePct: 0,
        warnSms: false,
      });
    }
    if (settlementMode === "设备租赁") {
      channelLeaseSummary.push({
        channelId,
        monthlyRent: monthlyRent || 12000,
        devicesCovered: 0,
        cabinets: 0,
        batteries: 0,
        whitelistCount: 0,
        dedicatedSiteName,
        nextDue: formatLocal().slice(0, 10),
        billingStatus: "待首缴",
        monthSwaps: 0,
        operatorId: OPERATOR_ID,
        operatorName: PAYEE_OPERATOR,
      });
    }
    if (channelUsesCreditEval(channelId)) ensureChannelCreditProfile(channelId);
    return { ok: true, contract: row, created: true };
  }

  function adjustCreditLimit(channelId, newLimit, operatorName) {
    const prof = ensureChannelCreditProfile(channelId);
    if (!prof) return { ok: false, msg: "该渠道不适用信用额度" };
    const limit = parseInt(newLimit, 10);
    if (!Number.isFinite(limit) || limit < 0) return { ok: false, msg: "请输入有效额度" };
    prof.creditLimit = limit;
    prof.operatorOverride = operatorName || PAYEE_OPERATOR;
    prof.updatedAt = formatLocal().slice(0, 10);
    prof.creditedAmount = Math.min(prof.requiredDeposit || 0, limit);
    prof.gap = Math.max(0, (prof.requiredDeposit || 0) - prof.creditedAmount);
    prof.alert =
      prof.gap > 0 ? `押金缺口 ¥${prof.gap.toLocaleString()}，请提交打款凭证` : null;
    return { ok: true, profile: prof };
  }

  function creditPoolFromDayOrder(o) {
    const pool = dayPools.find((p) => p.ownerId === o.channelId) || dayPools[0];
    if (!pool) return;
    pool.availableDays = (pool.availableDays || 0) + (o.days || 0);
    pool.totalDays = (pool.totalDays || 0) + (o.days || 0);
    if (!o.poolId) o.poolId = pool.id;
    dayPoolLedger.unshift({
      id: "LG-" + Date.now(),
      poolId: pool.id,
      time: formatLocal(),
      type: "购买入账",
      deltaDays: o.days || 0,
      balanceAfter: pool.availableDays,
      operator: PAYEE_OPERATOR,
      ref: o.id,
      reason: "确认到账 · 人天采购",
    });
  }

  function confirmDayOrder(id, operatorName) {
    const o = channelSalesOrders.find((x) => x.id === id);
    if (!o || o.orderStatus !== "待确认到账") return { ok: false, msg: "订单不可确认" };
    o.orderStatus = "已完成";
    o.payStatus = "已付款";
    const now = formatLocal();
    o.payTime = now;
    o.confirmedAt = now;
    o.confirmedBy = operatorName || "运营商";
    creditPoolFromDayOrder(o);
    return { ok: true, order: o };
  }

  function confirmRentOrder(id, operatorName) {
    const o = channelRentTopupOrders.find((x) => x.id === id);
    if (!o || o.orderStatus !== "待确认到账") return { ok: false, msg: "订单不可确认" };
    o.orderStatus = "已完成";
    o.payStatus = "已付款";
    const now = formatLocal();
    o.payTime = now;
    o.confirmedBy = operatorName || "运营商";
    const lease = channelLeaseSummary.find((p) => p.channelId === o.channelId);
    if (lease) lease.billingStatus = (o.period || "账期") + "已缴";
    return { ok: true, order: o };
  }

  function confirmActOrder(id, operatorName) {
    const o = channelActivationOrders.find((x) => x.id === id);
    if (!o || o.orderStatus !== "待确认到账") return { ok: false, msg: "订单不可确认" };
    o.orderStatus = "已完成";
    o.payStatus = "已付款";
    const now = formatLocal();
    o.payTime = now;
    o.confirmedAt = now;
    o.confirmedBy = operatorName || "运营商";
    o.codesMinted = o.qty || 0;
    o.mintStatus = "已发码";
    const contract = channelContracts.find((c) => c.channelId === o.channelId);
    if (contract) {
      contract.codeInventory = (contract.codeInventory || 0) + (o.qty || 0);
    }
    return { ok: true, order: o };
  }

  function confirmOrder(kind, id, operatorName) {
    if (kind === "day") return confirmDayOrder(id, operatorName);
    if (kind === "rent") return confirmRentOrder(id, operatorName);
    if (kind === "act") return confirmActOrder(id, operatorName);
    return { ok: false, msg: "未知订单类型" };
  }

  function getDayOrders(operatorId) {
    const op = operatorId || OPERATOR_ID;
    return channelSalesOrders.filter((o) => o.operatorId === op);
  }

  function getRentOrders(operatorId) {
    const op = operatorId || OPERATOR_ID;
    return channelRentTopupOrders.filter((o) => o.operatorId === op);
  }

  function getActOrders(operatorId) {
    const op = operatorId || OPERATOR_ID;
    return channelActivationOrders.filter((o) => o.operatorId === op);
  }

  function getDayPools(operatorId) {
    const op = operatorId || OPERATOR_ID;
    return dayPools.filter((p) => p.sellerId === op);
  }

  function getDayPoolLedger(poolId) {
    return dayPoolLedger
      .filter((l) => !poolId || l.poolId === poolId)
      .slice(0, 8);
  }

  function getSalePackages(channelId) {
    if (!channelId) return channelSalePackages.slice();
    return channelSalePackages.filter((s) => s.channelId === channelId);
  }

  function getLeaseSummary(channelId) {
    return channelLeaseSummary.find((p) => p.channelId === channelId) || null;
  }

  function pendingConfirmCount(operatorId) {
    const op = operatorId || OPERATOR_ID;
    return (
      channelSalesOrders.filter(
        (o) => o.operatorId === op && o.orderStatus === "待确认到账"
      ).length +
      channelRentTopupOrders.filter(
        (o) => o.operatorId === op && o.orderStatus === "待确认到账"
      ).length +
      channelActivationOrders.filter(
        (o) => o.operatorId === op && o.orderStatus === "待确认到账"
      ).length
    );
  }

  function orderStatusClass(status) {
    if (status === "待确认到账" || status === "待支付" || status === "支付中") return "warn";
    if (status === "已完成" || status === "已付款") return "ok";
    return "";
  }

  function dataScopeHint(session) {
    const scope =
      (session && (session.dataScopeLabel || session.dataScope)) || "本运营商";
    const op =
      (session && session.account && session.account.operatorName) || PAYEE_OPERATOR;
    return `数据范围：${scope} · ${op}（${OPERATOR_ID}）`;
  }

  function renderTabs(tabs, activeId, action, dataKey, escapeHtml, escapeAttr) {
    return tabs
      .map((t) => {
        const on = t.id === activeId ? " active" : "";
        return `<button type="button" class="sites-tab${on}" data-action="${escapeAttr(
          action
        )}" data-${escapeAttr(dataKey)}="${escapeAttr(t.id)}">${escapeHtml(
          t.label
        )}</button>`;
      })
      .join("");
  }

  function renderSubTabs(tabs, activeId, action, dataKey, escapeHtml, escapeAttr) {
    return `<div class="lease-filters" style="padding-top:0">
      <div class="sites-tabs" role="tablist" style="border:0;padding:0 4px 8px">${renderTabs(
        tabs,
        activeId,
        action,
        dataKey,
        escapeHtml,
        escapeAttr
      )}</div>
    </div>`;
  }

  function renderChannelKvRows(rows, escapeHtml) {
    return rows
      .map(
        ([label, value]) =>
          `<div class="channel-kv-row"><span class="channel-kv-k">${escapeHtml(
            label
          )}</span><span class="channel-kv-v">${value}</span></div>`
      )
      .join("");
  }

  function renderContractCard(c, escapeHtml, escapeAttr) {
    const usesCredit = channelUsesCreditEval(c.channelId);
    const prof = usesCredit ? ensureChannelCreditProfile(c.channelId) : null;
    const creditVal = usesCredit
      ? `¥${(prof?.creditLimit ?? CHANNEL_DEFAULT_CREDIT_LIMIT).toLocaleString("zh-CN")}`
      : `<span class="channel-kv-muted">无（推广分销）</span>`;
    const kv = renderChannelKvRows(
      [
        ["批发/定价", escapeHtml(contractPricingText(c))],
        ["权益概要", escapeHtml(contractTermsText(c))],
        ["信用额度", creditVal],
      ],
      escapeHtml
    );
    return `<article class="sites-card channel-card" data-action="ch-open-contract" data-id="${escapeAttr(
      c.id
    )}">
      <div class="sites-card-hd">
        <div class="channel-card-title">
          <strong>${escapeHtml(c.channelName)}</strong>
          <div class="sites-meta">${escapeHtml(c.channelId)} · ${escapeHtml(
      settlementModeLabel(contractSettlementMode(c))
    )}</div>
        </div>
        <span class="status-pill ok">${escapeHtml(c.status || "在营")}</span>
      </div>
      <div class="channel-card-kv">${kv}</div>
    </article>`;
  }

  function renderOrderCard(o, kind, escapeHtml, escapeAttr) {
    let title = o.id;
    let rows = "";
    let confirmBtn = "";
    if (kind === "day") {
      const payLine = `${escapeHtml(o.payMethod || "—")}${
        o.transferRef ? `<br><span class="channel-kv-muted">${escapeHtml(o.transferRef)}</span>` : ""
      }`;
      rows = renderChannelKvRows(
        [
          ["渠道商", escapeHtml(o.channelName)],
          [
            "人天/金额",
            `<strong>${o.days} 人天</strong> · ¥${o.amount.toLocaleString("zh-CN")}`,
          ],
          ["支付", payLine],
          [
            "付款状态",
            `${escapeHtml(o.payStatus)}<span class="channel-kv-muted"> · ${escapeHtml(o.orderStatus)}</span>`,
          ],
        ],
        escapeHtml
      );
    } else if (kind === "rent") {
      rows = `
        <div><span>渠道</span><em>${escapeHtml(o.channelName)}</em></div>
        <div><span>账期</span><em>${escapeHtml(o.period || "—")}</em></div>
        <div><span>金额</span><em>¥${o.amount.toLocaleString("zh-CN")} · ${o.devicesCovered} 台</em></div>
        <div><span>状态</span><em>${escapeHtml(o.orderStatus)}</em></div>`;
    } else {
      rows = `
        <div><span>渠道</span><em>${escapeHtml(o.channelName)}</em></div>
        <div><span>套餐码</span><em>${escapeHtml(o.skuName)} · ${o.qty} 码</em></div>
        <div><span>金额</span><em>¥${o.amount.toLocaleString("zh-CN")}</em></div>
        <div><span>发码</span><em>${escapeHtml(o.mintStatus || "—")}</em></div>`;
    }
    if (o.orderStatus === "待确认到账") {
      confirmBtn = `<div class="channel-card-ft"><button type="button" class="btn-primary channel-card-btn" data-action="ch-confirm-order" data-kind="${escapeAttr(
        kind
      )}" data-id="${escapeAttr(o.id)}">确认到账</button></div>`;
    }
    const bodyWrap =
      kind === "day"
        ? `<div class="channel-card-kv">${rows}</div>`
        : `<div class="sites-card-rows">${rows}</div>`;
    return `<article class="sites-card channel-card channel-order-card">
      <div class="sites-card-hd">
        <div class="channel-card-title">
          <strong>${escapeHtml(title)}</strong>
          <div class="sites-meta">${escapeHtml(o.createdAt || "")}</div>
        </div>
        <span class="status-pill ${orderStatusClass(o.orderStatus)}">${escapeHtml(
      o.orderStatus
    )}</span>
      </div>
      ${bodyWrap}
      ${confirmBtn}
    </article>`;
  }

  function renderContractsTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const list = myContracts();
    const cards =
      list.map((c) => renderContractCard(c, escapeHtml, escapeAttr)).join("") ||
      `<div class="empty-inline compact">暂无签约渠道</div>`;
    return `
      <div class="channel-list-toolbar">
        <button type="button" class="btn-primary channel-add-btn" data-action="ch-new-contract">+ 新增渠道商</button>
      </div>
      <div class="sites-list">${cards}</div>`;
  }

  function renderOrdersTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sub = "day";
    const orders = getDayOrders();
    const cards =
      orders.map((o) => renderOrderCard(o, sub, escapeHtml, escapeAttr)).join("") ||
      `<div class="empty-inline compact">暂无订单</div>`;
    const subTabs =
      ORDER_SUB_TABS.length > 1
        ? renderSubTabs(ORDER_SUB_TABS, sub, "ch-orders-sub", "sub", escapeHtml, escapeAttr)
        : `<p class="ops-hint" style="margin:0 14px 8px">人天批发 · 到账后额度池入账</p>`;
    return subTabs + `<div class="sites-list">${cards}</div>`;
  }

  function renderDayPoolAssets(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const pools = getDayPools();
    const poolCards = pools
      .map((p) => {
        const warn = p.status === "余额不足" ? "warn" : "ok";
        return `<article class="sites-card">
          <div class="sites-card-hd">
            <div>
              <strong>${escapeHtml(p.name)}</strong>
              <div class="sites-meta">${escapeHtml(p.id)} · ${escapeHtml(p.ownerName)}</div>
            </div>
            <span class="status-pill ${warn}">${escapeHtml(p.status)}</span>
          </div>
          <div class="sites-card-rows">
            <div><span>可用/总量</span><em>${p.availableDays} / ${p.totalDays} 人天</em></div>
            <div><span>批发价</span><em>¥${p.wholesalePrice}/人天</em></div>
            <div><span>有效期</span><em>${escapeHtml(p.validFrom)} ~ ${escapeHtml(p.validTo)}</em></div>
          </div>
          <div class="ch-pool-actions">
            <button type="button" class="btn-secondary" data-action="ch-pool-adjust" data-pool="${escapeAttr(
              p.id
            )}">额度调整</button>
            <button type="button" class="btn-secondary" data-action="ch-pool-ledger" data-pool="${escapeAttr(
              p.id
            )}" data-channel-id="${escapeAttr(p.ownerId)}">查看变动</button>
          </div>
        </article>`;
      })
      .join("");
    return `<div class="sites-list">${poolCards || `<div class="empty-inline compact">暂无人天池</div>`}</div>`;
  }

  function renderPoolAdjust(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const pool = getPoolById(ch.poolId);
    if (!pool) {
      return `<div class="empty-full">额度池不存在<button type="button" class="btn-secondary" data-action="ch-back-assets">返回</button></div>`;
    }
    const typeOpts = POOL_ADJUST_TYPES.map(
      (t) =>
        `<option value="${escapeAttr(t)}" ${(ch.poolForm?.adjustType || "充值") === t ? "selected" : ""}>${escapeHtml(t)}</option>`
    ).join("");
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-assets" aria-label="返回">‹</button>
          <h1>额度调整</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body">
          <p class="ops-hint">${escapeHtml(pool.id)} · ${escapeHtml(pool.name)} · 可用 ${pool.availableDays} 人天</p>
          <label class="sites-field">调整类型
            <select id="ch-pool-adjust-type">${typeOpts}</select>
          </label>
          <label class="sites-field">人天数
            <input id="ch-pool-adjust-days" type="number" min="1" step="1" value="${escapeAttr(
              ch.poolForm?.adjustDays != null ? ch.poolForm.adjustDays : "100"
            )}" />
          </label>
          <p class="sites-hint ch-form-callout">「退款」「修正」为扣减：填正数，系统记负向变动；扣减后可用不得为负。</p>
          <label class="sites-field">原因 / 协商单号
            <textarea id="ch-pool-adjust-remark" rows="3" placeholder="线下协商退款，扣减未使用购买额度">${escapeHtml(
              ch.poolForm?.remark || ""
            )}</textarea>
          </label>
          <button type="button" class="btn-primary" data-action="ch-save-pool-adjust">保存</button>
        </div>
      </div>`;
  }

  function renderPoolLedger(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const rows = filterLedgerRows(ch);
    const chOpts = poolChannelOptions()
      .map(
        (o) =>
          `<option value="${escapeAttr(o.id)}" ${ch.ledgerChannelId === o.id ? "selected" : ""}>${escapeHtml(
            o.name
          )}</option>`
      )
      .join("");
    const typeOpts = ledgerTypeOptions()
      .map(
        (t) =>
          `<option value="${escapeAttr(t)}" ${ch.ledgerType === t ? "selected" : ""}>${escapeHtml(t)}</option>`
      )
      .join("");
    const list = rows
      .map(
        (l) => `<article class="sites-card compact">
        <div class="sites-card-hd">
          <div>
            <strong>${escapeHtml(l.type)}</strong>
            <div class="sites-meta">${escapeHtml(l.time)} · ${escapeHtml(l.channelName)}</div>
          </div>
          <span class="status-pill ${l.deltaDays < 0 ? "warn" : "ok"}">${l.deltaDays > 0 ? "+" : ""}${l.deltaDays} 人天</span>
        </div>
        <div class="sites-card-rows compact">
          <div><span>额度池</span><em>${escapeHtml(l.poolName)}</em></div>
          <div><span>余额后</span><em>${l.balanceAfter} 人天</em></div>
          <div><span>关联</span><em>${escapeHtml(l.ref || "—")}</em></div>
          <div><span>说明</span><em>${escapeHtml(l.reason || "—")}</em></div>
        </div>
      </article>`
      )
      .join("");
    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-assets" aria-label="返回">‹</button>
          <h1>额度变动</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="lease-filters" style="padding:0 10px 8px">
          <label class="sites-field" style="margin-bottom:8px">渠道商
            <select id="ch-ledger-channel">${chOpts}</select>
          </label>
          <label class="sites-field">类型
            <select id="ch-ledger-type">${typeOpts}</select>
          </label>
        </div>
        <div class="sites-list">${list || `<div class="empty-inline compact">该筛选下暂无变动记录</div>`}</div>
      </div>`;
  }

  function renderCardAssets(ctx) {
    const { escapeHtml } = ctx;
    const contracts = myContracts().filter((c) => contractSettlementMode(c) === "链接类");
    const cards = contracts
      .flatMap((c) =>
        getSalePackages(c.channelId).map((s) => ({ c, s }))
      )
      .map(
        ({ c, s }) => `<article class="sites-card">
        <div class="sites-card-hd">
          <div><strong>${escapeHtml(s.name)}</strong><div class="sites-meta">${escapeHtml(
          c.channelName
        )}</div></div>
          <span class="status-pill ok">${escapeHtml(s.status)}</span>
        </div>
        <div class="sites-card-rows">
          <div><span>型号</span><em>${escapeHtml(s.batteryModel)}</em></div>
          <div><span>专享价</span><em>¥${s.channelPrice}（官 ¥${s.officialPrice}）</em></div>
          <div><span>佣金</span><em>¥${s.commissionPerOrder}/单</em></div>
        </div>
      </article>`
      )
      .join("");
    return `<div class="sites-list">${cards || `<div class="empty-inline compact">暂无渠道分销 SKU</div>`}</div>`;
  }

  function renderRentAssets(ctx) {
    const { escapeHtml } = ctx;
    const contracts = myContracts().filter((c) => contractSettlementMode(c) === "设备租赁");
    const cards = contracts
      .map((c) => {
        const lease = getLeaseSummary(c.channelId);
        return `<article class="sites-card">
          <div class="sites-card-hd">
            <div><strong>${escapeHtml(c.channelName)}</strong><div class="sites-meta">${escapeHtml(
          c.dedicatedSiteName || lease?.dedicatedSiteName || "—"
        )}</div></div>
            <span class="status-pill ok">${escapeHtml(lease?.billingStatus || c.billingStatus || "—")}</span>
          </div>
          <div class="sites-card-rows">
            <div><span>月租</span><em>¥${(lease?.monthlyRent || c.monthlyRent || 0).toLocaleString("zh-CN")}</em></div>
            <div><span>设备</span><em>${lease?.devicesCovered || "—"} 台（柜 ${lease?.cabinets || "—"} / 电 ${lease?.batteries || "—"}）</em></div>
            <div><span>白名单</span><em>${lease?.whitelistCount ?? c.whitelistCount ?? "—"} 人 · 月换 ${lease?.monthSwaps ?? "—"} 次</em></div>
            <div><span>下次账期</span><em>${escapeHtml(lease?.nextDue || "—")}</em></div>
          </div>
        </article>`;
      })
      .join("");
    return `<div class="sites-list">${cards || `<div class="empty-inline compact">暂无设备租赁签约</div>`}</div>`;
  }

  function renderActAssets(ctx) {
    const { escapeHtml } = ctx;
    const contracts = myContracts().filter((c) => contractSettlementMode(c) === "激活码");
    const cards = contracts
      .map(
        (c) => `<article class="sites-card">
        <div class="sites-card-hd">
          <div><strong>${escapeHtml(c.channelName)}</strong><div class="sites-meta">${escapeHtml(
          c.codeSkuName || "30天包月"
        )}</div></div>
          <span class="status-pill ok">在营</span>
        </div>
        <div class="sites-card-rows">
          <div><span>批发价</span><em>¥${c.wholesalePrice}/码</em></div>
          <div><span>库存</span><em>${c.codeInventory ?? "—"} 张</em></div>
          <div><span>已核销</span><em>${c.codesRedeemed ?? "—"}</em></div>
          <div><span>起购</span><em>${c.minCodes ?? "—"} 码</em></div>
        </div>
      </article>`
      )
      .join("");
    return `<div class="sites-list">${cards || `<div class="empty-inline compact">暂无激活码签约</div>`}</div>`;
  }

  function normalizeAssetsSub(sub) {
    if (sub === "card") return "card";
    return "dayPool";
  }

  function renderAssetsTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sub = normalizeAssetsSub(ch.assetsSub);
    const body =
      sub === "card" ? renderCardAssets(ctx) : renderDayPoolAssets(ch, ctx);
    return (
      renderSubTabs(ASSET_SUB_TABS, sub, "ch-assets-sub", "sub", escapeHtml, escapeAttr) +
      body
    );
  }

  function renderContractDetail(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const c = getContractById(ch.editId);
    if (!c) {
      return `<div class="empty-full">签约不存在<button type="button" class="btn-secondary" data-action="ch-back-hub">返回</button></div>`;
    }
    const plat = getPlatformChannel(c.channelId);
    const usesCredit = channelUsesCreditEval(c.channelId);
    const prof = usesCredit ? ensureChannelCreditProfile(c.channelId) : null;
    const siteText = (c.sites || []).join("、") || "—";
    const creditBlock = usesCredit
      ? `<section class="devstat-sec">
          <div class="devstat-hd"><strong>信用额度</strong></div>
          <div class="sites-card-rows">
            <div><span>授信额度</span><em>¥${(prof?.creditLimit ?? CHANNEL_DEFAULT_CREDIT_LIMIT).toLocaleString("zh-CN")}</em></div>
            <div><span>应押/缺口</span><em>应押 ¥${(prof?.requiredDeposit || 0).toLocaleString("zh-CN")}${prof?.gap ? ` · 缺口 ¥${prof.gap.toLocaleString("zh-CN")}` : ""}</em></div>
            ${prof?.alert ? `<p class="ops-hint">${escapeHtml(prof.alert)}</p>` : ""}
          </div>
          <button type="button" class="btn-secondary" style="width:100%;margin-top:8px" data-action="ch-open-credit" data-channel-id="${escapeAttr(
            c.channelId
          )}">调整额度</button>
        </section>`
      : `<p class="ops-hint">链接类分销不适用渠道信用评估。</p>`;
    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-hub" aria-label="返回">‹</button>
          <h1>签约详情</h1>
          <button type="button" class="sites-header-btn" data-action="ch-edit-contract" data-id="${escapeAttr(
            c.id
          )}">编辑</button>
        </div>
        <article class="sites-card">
          <div class="sites-card-hd">
            <div><strong>${escapeHtml(c.channelName)}</strong><div class="sites-meta">${escapeHtml(
      c.channelId
    )}</div></div>
            <span class="status-pill ok">${escapeHtml(c.status || "在营")}</span>
          </div>
          <div class="sites-card-rows">
            <div><span>结算模式</span><em>${escapeHtml(settlementModeLabel(contractSettlementMode(c)))}</em></div>
            <div><span>登录账号</span><em>${escapeHtml(plat?.loginAccount || "—")}</em></div>
            <div><span>城市 / 状态</span><em>${escapeHtml(plat?.city || "—")} · ${escapeHtml(plat?.status || c.status || "—")}</em></div>
            <div><span>联系人</span><em>${escapeHtml(plat?.contactName || "—")}${plat?.contactPhone ? " · " + escapeHtml(plat.contactPhone) : ""}</em></div>
            <div><span>批发/定价</span><em>${escapeHtml(contractPricingText(c))}</em></div>
            <div><span>权益概要</span><em>${escapeHtml(contractTermsText(c))}</em></div>
            <div><span>授权站点</span><em>${escapeHtml(siteText)}</em></div>
            <div><span>运营商</span><em>${escapeHtml(c.operatorName)}</em></div>
          </div>
        </article>
        ${creditBlock}
      </div>`;
  }

  function renderContractForm(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const isNew = !ch.editId || ch.editId === "new";
    const c = isNew ? null : getContractById(ch.editId);
    const form = ch.form && Object.keys(ch.form).length ? ch.form : formFromContract(c);
    const mode = form.settlementMode || "人天池";
    const modeList = isNew ? NEW_CHANNEL_SETTLEMENT_MODES : SETTLEMENT_MODES;
    const modeOpts = modeList.map(
      (m) =>
        `<option value="${escapeAttr(m.id)}" ${mode === m.id ? "selected" : ""}>${escapeHtml(
          m.label
        )}</option>`
    ).join("");
    const cityOpts = CHANNEL_CITIES.map(
      (city) =>
        `<option value="${escapeAttr(city)}" ${form.city === city ? "selected" : ""}>${escapeHtml(
          city
        )}</option>`
    ).join("");
    const statusOpts = CHANNEL_STATUSES.map(
      (st) =>
        `<option value="${escapeAttr(st)}" ${form.status === st ? "selected" : ""}>${escapeHtml(
          st
        )}</option>`
    ).join("");
    const modeLocked = !isNew;
    const codeSkuOpts = ["30天包月", "7天体验"]
      .map(
        (sku) =>
          `<option ${form.codeSkuName === sku ? "selected" : ""}>${escapeHtml(sku)}</option>`
      )
      .join("");
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-detail" aria-label="返回">‹</button>
          <h1>${isNew ? "新增渠道商" : "编辑签约"}</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body" id="ch-contract-form" data-settlement-mode="${escapeAttr(mode)}">
          <p class="sites-hint">保存后同步至平台「渠道商管理」（平台只读监管）。</p>
          <label class="sites-field" data-ch-field="all">渠道商名称
            <input id="ch-form-channelName" type="text" value="${escapeAttr(
              form.channelName || ""
            )}" placeholder="如：同城配送渠道" />
          </label>
          <label class="sites-field" data-ch-field="all">登录账号（手机号）
            <input id="ch-form-loginAccount" type="tel" inputmode="numeric" maxlength="11" value="${escapeAttr(
              form.loginAccount || ""
            )}" placeholder="11 位手机号，用于登录渠道商后台" />
            <small class="sites-hint" style="margin-top:6px;display:block">默认密码：${DEFAULT_CHANNEL_PASSWORD}</small>
          </label>
          <label class="sites-field" data-ch-field="all">结算模式
            ${
              modeLocked
                ? `<input type="text" readonly value="${escapeAttr(
                    settlementModeLabel(mode)
                  )}" />`
                : `<select id="ch-form-settlementMode">${modeOpts}</select>`
            }
          </label>
          <label class="sites-field" data-ch-field="all">城市
            <select id="ch-form-city">${cityOpts}</select>
          </label>
          <label class="sites-field" data-ch-field="all">状态
            <select id="ch-form-status">${statusOpts}</select>
          </label>
          <p class="sites-hint" data-ch-field="设备租赁" style="color:var(--warning,#b45309)">设备租赁（二期）：「已停用」后白名单用户不出电，仍可还电入柜。</p>
          <label class="sites-field" data-ch-field="all">联系人
            <input id="ch-form-contactName" type="text" value="${escapeAttr(
              form.contactName || ""
            )}" placeholder="选填" />
          </label>
          <label class="sites-field" data-ch-field="all">联系电话
            <input id="ch-form-contactPhone" type="tel" value="${escapeAttr(
              form.contactPhone || ""
            )}" placeholder="选填" />
          </label>
          <p class="sites-hint ch-form-callout" data-ch-field="人天池">人天池：批发单价与最低起购请在「平台设置 → 人天批发价」维护；新建签约继承<strong>默认批发价</strong>（当前 ¥${DEFAULT_DAY_WHOLESALE}/人天，起购 ${DEFAULT_DAY_MIN} 人天）。</p>
          <p class="sites-hint ch-form-callout" data-ch-field="链接类">推广（链接类）：授权套餐与专享价请在「平台设置 → 渠道分销价」维护。</p>
          <label class="sites-field" data-ch-field="链接类">佣金及时到付
            <select id="ch-form-instantCommissionPayout">
              <option value="0" ${form.instantCommissionPayout !== "1" ? "selected" : ""}>关闭 · 佣金线下结算</option>
              <option value="1" ${form.instantCommissionPayout === "1" ? "selected" : ""}>开启 · 支付成功即时分账至渠道</option>
            </select>
          </label>
          <label class="sites-field" data-ch-field="链接类" data-ch-field-instant="1">渠道佣金比例（%）
            <input id="ch-form-commissionRatePct" type="number" min="0.1" max="50" step="0.1" value="${escapeAttr(
              form.commissionRatePct || "9"
            )}" />
          </label>
          <label class="sites-field" data-ch-field="设备租赁">月租（元/月 · 签约统一价）
            <input id="ch-form-monthlyRent" type="number" min="1000" step="100" value="${escapeAttr(
              form.monthlyRent || "12000"
            )}" />
          </label>
          <label class="sites-field" data-ch-field="设备租赁">白名单默认类型
            <select id="ch-form-whitelistDefaultAccess">
              <option value="paid" ${form.whitelistDefaultAccess !== "free" ? "selected" : ""}>白名单付费（须购白名单套餐）</option>
              <option value="free" ${form.whitelistDefaultAccess === "free" ? "selected" : ""}>白名单免费（B2B 月租覆盖）</option>
            </select>
          </label>
          <label class="sites-field" data-ch-field="设备租赁">开通跨网
            <select id="ch-form-crossNetworkEnabled">
              <option value="1" ${form.crossNetworkEnabled !== "0" ? "selected" : ""}>开通 · 须缴平台跨网保证金</option>
              <option value="0" ${form.crossNetworkEnabled === "0" ? "selected" : ""}>关闭</option>
            </select>
          </label>
          <label class="sites-field" data-ch-field="设备租赁">专属站点
            <select id="ch-form-dedicatedSiteId">
              <option value="">（暂不绑定）</option>
              <option value="new" ${form.dedicatedSiteId === "new" ? "selected" : ""}>+ 新建专属站点</option>
              <option value="ST-JD" ${form.dedicatedSiteId === "ST-JD" ? "selected" : ""}>京东物流专属站 · 渠道专属</option>
            </select>
          </label>
          <label class="sites-field" data-ch-field="设备租赁">新建站点名称
            <input id="ch-form-newSiteName" type="text" value="${escapeAttr(
              form.newSiteName || ""
            )}" placeholder="选择「+ 新建专属站点」时填写" />
          </label>
          <label class="sites-field" data-ch-field="激活码">单码批发价（元）
            <input id="ch-form-wholesalePriceAct" type="number" min="1" step="1" value="${escapeAttr(
              form.wholesalePriceAct || "255"
            )}" />
          </label>
          <label class="sites-field" data-ch-field="激活码">最低起购（码）
            <input id="ch-form-minCodes" type="number" min="1" step="1" value="${escapeAttr(
              form.minCodes || "100"
            )}" />
          </label>
          <label class="sites-field" data-ch-field="激活码">默认套餐码
            <select id="ch-form-codeSkuName">${codeSkuOpts}</select>
          </label>
          <label class="sites-field" data-ch-field="激活码">服务人天（计提用）
            <input id="ch-form-codeValidityDays" type="number" min="1" step="1" value="${escapeAttr(
              form.codeValidityDays || "30"
            )}" />
          </label>
          <p class="sites-hint" data-ch-field="all">新增仅支持<strong>人天池</strong>或<strong>推广（链接类）</strong>；停服用「状态」。</p>
          <button type="button" class="btn-primary" data-action="ch-save-contract">保存</button>
        </div>
      </div>`;
  }

  function renderCreditForm(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const prof = ensureChannelCreditProfile(ch.creditChannelId);
    if (!prof) {
      return `<div class="empty-full">不适用信用额度<button type="button" class="btn-secondary" data-action="ch-back-detail">返回</button></div>`;
    }
    const contract = channelContracts.find((c) => c.channelId === ch.creditChannelId);
    const limitVal =
      ch.form && ch.form.creditLimit != null
        ? ch.form.creditLimit
        : String(prof.creditLimit ?? CHANNEL_DEFAULT_CREDIT_LIMIT);
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-detail" aria-label="返回">‹</button>
          <h1>调整额度</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body">
          <p class="ops-hint">${escapeHtml(contract?.channelName || ch.creditChannelId)} · 平台默认 ¥${CHANNEL_DEFAULT_CREDIT_LIMIT.toLocaleString("zh-CN")}（一期不展示信用分）</p>
          <label class="sites-field">运营商授信额度（元）
            <input id="ch-form-creditLimit" type="number" step="1000" min="0" value="${escapeAttr(
              limitVal
            )}" />
          </label>
          <div class="sites-card-rows">
            <div><span>应押</span><em>¥${(prof.requiredDeposit || 0).toLocaleString("zh-CN")}</em></div>
            <div><span>已入账信用</span><em>¥${(prof.creditedAmount || 0).toLocaleString("zh-CN")}</em></div>
          </div>
          <button type="button" class="btn-primary" data-action="ch-save-credit">保存</button>
        </div>
      </div>`;
  }

  function menuEntryTitle(tabId) {
    const row =
      MENU_ENTRIES.find((t) => t.id === tabId) ||
      MAIN_TABS.find((t) => t.id === tabId);
    return row ? row.label : "渠道管理";
  }

  function renderStatusPill(status) {
    const cls = status === "生效" || status === "启用" ? "ok" : "";
    return `<span class="sites-tag ${cls}">${status}</span>`;
  }

  function renderQuotaPricingTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const rows = operatorQuotaRows();
    const cards = rows
      .map((r) => {
        const isDef = r.channelId === "*";
        const title = isDef
          ? "默认批发价"
          : escapeHtml(r.channelName || r.channelId);
        const sub = isDef ? "无渠道 · 新建签约继承" : escapeHtml(r.channelId);
        const kv = renderChannelKvRows(
          [
            ["平台标准价", `¥${PLATFORM_STD_DAY_PRICE}/人天 · 只读`],
            ["我的批发价", `¥${r.wholesalePrice}/人天`],
            ["最低起购", `${r.minDays} 人天`],
            ["状态", renderStatusPill(r.status)],
          ],
          escapeHtml
        );
        return `<article class="sites-card channel-card">
          <div class="sites-card-hd">
            <div class="channel-card-title"><strong>${title}</strong>${isDef ? `<span class="sites-tag ok">默认</span>` : ""}</div>
            <span class="sites-tag">${sub}</span>
          </div>
          <div class="channel-card-kv">${kv}</div>
          <div class="channel-card-ft">
            <button type="button" class="btn-secondary channel-card-btn" data-action="ch-quota-edit" data-id="${escapeAttr(
              r.id
            )}">${isDef ? "设置" : "编辑"}</button>
          </div>
        </article>`;
      })
      .join("");
    return `
      <p class="ops-hint channel-page-note">默认价供无渠道/新建签约继承；各渠道可单独覆盖（PC：平台设置 → 人天批发价）。</p>
      <div class="channel-list-toolbar">
        <button type="button" class="btn-primary channel-add-btn" data-action="ch-quota-new">+ 新增渠道批发价</button>
      </div>
      <div class="channel-card-list">${cards}</div>`;
  }

  function renderCardPricingTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const rows = cardPricingRows();
    if (!myLinkContracts().length) {
      return `<p class="empty-inline">暂无推广（链接类）签约。请先在「签约渠道」新增后再维护分销价。</p>`;
    }
    const cards = rows
      .map(
        (r) => `<article class="sites-card channel-card">
        <div class="sites-card-hd">
          <div class="channel-card-title"><strong>${escapeHtml(r.name)}</strong></div>
          <span class="sites-tag">${escapeHtml(r.channelName)}</span>
        </div>
        <div class="channel-card-kv">${renderChannelKvRows(
          [
            ["电池型号", escapeHtml(r.batteryModel || "—")],
            ["正式零售价", `¥${r.officialPrice}`],
            ["渠道专享价", `¥${r.channelPrice}`],
            ["佣金/单", `¥${r.commissionPerOrder}`],
            ["状态", renderStatusPill(r.status)],
          ],
          escapeHtml
        )}</div>
        <div class="channel-card-ft">
          <button type="button" class="btn-secondary channel-card-btn" data-action="ch-card-edit" data-id="${escapeAttr(
            r.id
          )}">编辑</button>
        </div>
      </article>`
      )
      .join("");
    return `
      <p class="ops-hint channel-page-note">按签约渠道分别设定正式价、专享价与佣金（PC：平台设置 → 渠道分销价）。</p>
      <div class="channel-card-list">${cards || '<p class="empty-inline">暂无分销 SKU</p>'}</div>`;
  }

  function renderLinkSettleFilters(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const f = ch.linkSettleFilter || {};
    const channels = [{ id: "全部", name: "全部渠道" }].concat(
      myLinkContracts().map((c) => ({ id: c.channelId, name: c.channelName }))
    );
    const chOpts = channels
      .map(
        (o) =>
          `<option value="${escapeAttr(o.id)}"${
            (f.channelId || "全部") === o.id ? " selected" : ""
          }>${escapeHtml(o.name)}</option>`
      )
      .join("");
    const settleOpts = ["全部", "即时分账", "线下结算"]
      .map(
        (t) =>
          `<option value="${escapeAttr(t)}"${
            (f.settleType || "全部") === t ? " selected" : ""
          }>${escapeHtml(t)}</option>`
      )
      .join("");
    return `<div class="channel-filter-compact">
      <label class="sites-field sites-field-compact">月起<input type="month" id="ch-ls-monthFrom" value="${escapeAttr(
        f.monthFrom || "2026-05"
      )}" /></label>
      <label class="sites-field sites-field-compact">月止<input type="month" id="ch-ls-monthTo" value="${escapeAttr(
        f.monthTo || "2026-06"
      )}" /></label>
      <label class="sites-field sites-field-compact">渠道<select id="ch-ls-channelId">${chOpts}</select></label>
      <label class="sites-field sites-field-compact">结算<select id="ch-ls-settleType">${settleOpts}</select></label>
      <button type="button" class="btn-primary channel-filter-query" data-action="ch-link-settle-query">查询</button>
    </div>`;
  }

  function renderLinkSettleTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    if (!myLinkContracts().length) {
      return `<p class="empty-inline">暂无链接类签约渠道。请先新增<strong>推广（链接类）</strong>签约，并在「推广分销价」授权套餐。</p>
        <button type="button" class="btn-primary" data-action="ch-enter-section" data-tab="contracts">去签约渠道</button>`;
    }
    const f = ch.linkSettleFilter || {};
    const rangeMonths = promoSettleRangeMonths(f);
    const monthSet = new Set(rangeMonths);
    let monthRows = operatorLinkSettleMonthRows(rangeMonths, f.channelId || "全部").filter(
      (r) => (f.settleType || "全部") === "全部" || r.settleType === f.settleType
    );
    monthRows = monthRows.map((r) => {
      const settled =
        r.settleType === "即时分账" || r.status === "已线下结清" ? r.netCommission : 0;
      const pending = r.status === "待线下结清" ? r.netCommission : 0;
      const statusLabel =
        r.status === "待线下结清"
          ? "待线下结算"
          : r.status === "已线下结清"
            ? "已线下结算"
            : r.status;
      return Object.assign({}, r, {
        settledAmount: settled,
        pendingAmount: pending,
        statusLabel,
      });
    });
    const grand = monthRows.reduce(
      (acc, r) => ({
        orderCount: acc.orderCount + r.orderCount,
        totalCommission: acc.totalCommission + r.totalCommission,
        totalClawback: acc.totalClawback + r.totalClawback,
        pendingNet: acc.pendingNet + r.pendingAmount,
      }),
      { orderCount: 0, totalCommission: 0, totalClawback: 0, pendingNet: 0 }
    );
    const sub = ch.linkSettleSub || "summary";
    const subTabs = renderSubTabs(
      LINK_SETTLE_SUB_TABS,
      sub,
      "ch-link-settle-sub",
      "sub",
      escapeHtml,
      escapeAttr
    );
    const kpi = `<div class="channel-kpi-grid">
      <div class="channel-kpi"><span>成交</span><strong>${grand.orderCount} 笔</strong></div>
      <div class="channel-kpi"><span>佣金毛额</span><strong>¥${grand.totalCommission.toFixed(2)}</strong></div>
      <div class="channel-kpi"><span>退款冲正</span><strong>¥${grand.totalClawback.toFixed(2)}</strong></div>
      <div class="channel-kpi warn"><span>待线下结算</span><strong>¥${grand.pendingNet.toFixed(2)}</strong></div>
    </div>`;
    let body = "";
    if (sub === "detail") {
      const orders = channelLinkOrders
        .filter((o) => monthSet.has(payMonthKey(o.payTime)))
        .filter((o) => (f.channelId || "全部") === "全部" || o.channelId === f.channelId)
        .filter(
          (o) =>
            (f.settleType || "全部") === "全部" ||
            orderCommissionSettleType(o) === f.settleType
        )
        .sort((a, b) => String(b.payTime).localeCompare(String(a.payTime)));
      body = orders
        .map((o) => {
          const claw = orderCommissionClawback(o);
          return `<article class="sites-card channel-card channel-order-card">
            <div class="sites-card-hd"><div class="channel-card-title"><strong>${escapeHtml(
              o.id
            )}</strong></div><span class="sites-tag">${escapeHtml(
              orderCommissionSettleType(o)
            )}</span></div>
            <div class="channel-card-kv">${renderChannelKvRows(
              [
                ["渠道", escapeHtml(channelDisplayName(o.channelId))],
                ["用户", `${escapeHtml(o.riderName)} · ${escapeHtml(o.phone)}`],
                ["套餐", escapeHtml(o.skuName)],
                ["实付", `¥${Number(o.paidPrice).toFixed(2)}`],
                ["佣金", `¥${Number(o.commission).toFixed(2)}`],
                ["冲正", claw > 0 ? `¥${claw.toFixed(2)}` : "—"],
                ["链接用途", escapeHtml(o.linkPurpose || "—")],
                ["支付时间", escapeHtml(o.payTime)],
              ],
              escapeHtml
            )}</div>
          </article>`;
        })
        .join("");
      body = `<div class="channel-card-list">${body || '<p class="empty-inline">暂无订单</p>'}</div>`;
    } else {
      body = monthRows
        .map((r) => {
          let op = "";
          if (r.settleType === "线下结算" && r.status === "待线下结清") {
            op = `<button type="button" class="btn-primary channel-card-btn" data-action="ch-offline-settle-open" data-key="${escapeAttr(
              r.key
            )}">登记线下结算</button>`;
          } else if (r.settleType === "线下结算" && r.status === "已线下结清") {
            op = `<button type="button" class="btn-secondary channel-card-btn" data-action="ch-offline-settle-view" data-key="${escapeAttr(
              r.key
            )}">查看凭证</button>`;
          }
          return `<article class="sites-card channel-card">
            <div class="sites-card-hd">
              <div class="channel-card-title"><strong>${escapeHtml(r.month)}</strong> · ${escapeHtml(
                r.channelName
              )}</div>
              <span class="sites-tag">${escapeHtml(r.settleType)}</span>
            </div>
            <div class="channel-card-kv">${renderChannelKvRows(
              [
                ["成交", `${r.orderCount} 笔 · 实付 ¥${r.totalPaid.toFixed(2)}`],
                ["佣金毛额", `¥${r.totalCommission.toFixed(2)}`],
                ["退款冲正", r.totalClawback > 0 ? `¥${r.totalClawback.toFixed(2)}` : "—"],
                ["当期应付", `¥${r.netCommission.toFixed(2)}`],
                ["累计已结", `¥${r.settledAmount.toFixed(2)}`],
                ["剩余待结", `¥${r.pendingAmount.toFixed(2)}`],
                ["状态", renderStatusPill(r.statusLabel)],
              ],
              escapeHtml
            )}</div>
            ${op ? `<div class="channel-card-ft">${op}</div>` : ""}
          </article>`;
        })
        .join("");
      body = `<div class="channel-card-list">${body || '<p class="empty-inline">所选范围暂无汇总</p>'}</div>`;
    }
    return `
      <p class="ops-hint channel-page-note">即时分账支付时完成；线下结算可登记凭证（PC：渠道管理 → 推广结算）。</p>
      ${renderLinkSettleFilters(ch, ctx)}
      ${kpi}
      <div class="lease-filters">${subTabs}</div>
      ${body}`;
  }

  function renderQuotaPricingForm(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const editId = ch.quotaEditId || "new";
    const row =
      editId === "new" ? null : operatorDayQuotaPrices.find((r) => r.id === editId);
    const form = ch.quotaForm || {};
    const isDef = row && row.channelId === "*";
    const isNew = editId === "new";
    let channelField = "";
    if (isNew) {
      const opts = dayPoolContractsForQuota()
        .filter((c) => !quotaPriceForChannel(c.channelId))
        .map(
          (c) =>
            `<option value="${escapeAttr(c.channelId)}">${escapeHtml(c.channelName)}</option>`
        )
        .join("");
      channelField = `<label class="sites-field">渠道商<select id="ch-quota-channelId"><option value="">请选择</option>${opts}</select></label>`;
    } else if (row) {
      channelField = `<p class="ops-hint">${escapeHtml(row.channelName)}${
        isDef ? " · 无渠道默认" : ""
      }</p>`;
    }
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-quota-list" aria-label="返回">‹</button>
          <h1>${isNew ? "新增渠道批发价" : isDef ? "默认批发价" : "编辑批发价"}</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body">
          <p class="ops-hint">平台标准价 ¥${PLATFORM_STD_DAY_PRICE}/人天（只读）</p>
          ${
            isNew
              ? `<p class="ops-hint channel-page-note">新增字段：渠道商、批发单价、最低起购、状态；保存后写入列表并同步签约 wholesalePrice/minDays。</p>`
              : ""
          }
          ${channelField}
          <label class="sites-field">批发单价（元/人天）
            <input id="ch-quota-wholesalePrice" type="number" step="0.1" min="0.1" value="${escapeAttr(
              form.wholesalePrice ??
                (row ? row.wholesalePrice : PLATFORM_STD_DAY_PRICE)
            )}" />
          </label>
          <label class="sites-field">最低起购（人天）
            <input id="ch-quota-minDays" type="number" min="1" step="1" value="${escapeAttr(
              form.minDays ?? (row ? row.minDays : 500)
            )}" />
          </label>
          <label class="sites-field">状态
            <select id="ch-quota-status">
              <option${(form.status || row?.status || "生效") === "生效" ? " selected" : ""}>生效</option>
              <option${(form.status || row?.status) === "停用" ? " selected" : ""}>停用</option>
            </select>
          </label>
          <button type="button" class="btn-primary" data-action="ch-save-quota">保存</button>
        </div>
      </div>`;
  }

  function renderCardPricingForm(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sku = channelSalePackages.find((s) => s.id === ch.cardEditId);
    if (!sku) {
      return `<div class="empty-full">SKU 不存在<button type="button" class="btn-secondary" data-action="ch-back-card-list">返回</button></div>`;
    }
    const form = ch.cardForm || {};
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-card-list" aria-label="返回">‹</button>
          <h1>编辑分销价</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body">
          <p class="ops-hint">${escapeHtml(channelDisplayName(sku.channelId))} · ${escapeHtml(
            sku.name
          )} · ${escapeHtml(sku.batteryModel || "")}</p>
          <label class="sites-field">正式零售价（元）
            <input id="ch-card-officialPrice" type="number" step="0.01" min="0" readonly value="${escapeAttr(
              sku.officialPrice
            )}" />
          </label>
          <p class="ops-hint channel-page-note">正式零售价来自<strong>个人套餐设置</strong>（平台设置），本页不可改；仅维护专享价与佣金。</p>
          <label class="sites-field">渠道专享价（元）
            <input id="ch-card-channelPrice" type="number" step="0.01" min="0" value="${escapeAttr(
              form.channelPrice ?? sku.channelPrice
            )}" />
          </label>
          <label class="sites-field">佣金/单（元）
            <input id="ch-card-commissionPerOrder" type="number" step="0.01" min="0" value="${escapeAttr(
              form.commissionPerOrder ?? sku.commissionPerOrder
            )}" />
          </label>
          <label class="sites-field">状态
            <select id="ch-card-status">
              <option${(form.status || sku.status) === "启用" ? " selected" : ""}>启用</option>
              <option${(form.status || sku.status) === "停用" ? " selected" : ""}>停用</option>
            </select>
          </label>
          <button type="button" class="btn-primary" data-action="ch-save-card">保存</button>
        </div>
      </div>`;
  }

  function renderOfflineSettleForm(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const key = ch.linkSettleRegisterKey || "";
    const keyParts = key.split("|");
    const channelId = keyParts[0] || "";
    const month = keyParts[1] || "";
    const rec = offlineCommissionSettleRecord(channelId, month);
    const viewOnly = ch.view === "linkSettleVoucher";
    const form = ch.offlineSettleForm || {};
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-link-settle" aria-label="返回">‹</button>
          <h1>${viewOnly ? "结算凭证" : "登记线下结算"}</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body">
          <p class="ops-hint">${escapeHtml(channelDisplayName(channelId))} · ${escapeHtml(month)}</p>
          ${
            viewOnly
              ? `<div class="sites-card-rows">
            <div><span>流水号</span><em>${escapeHtml(rec?.voucherNo || "—")}</em></div>
            <div><span>结算日期</span><em>${escapeHtml(rec?.settledAt || "—")}</em></div>
          </div>`
              : `<label class="sites-field">打款流水号
            <input id="ch-offline-voucherNo" value="${escapeAttr(form.voucherNo || "")}" placeholder="必填" />
          </label>
          <label class="sites-field">结算日期
            <input id="ch-offline-settledAt" type="date" value="${escapeAttr(
              form.settledAt || ""
            )}" />
          </label>
          <button type="button" class="btn-primary" data-action="ch-save-offline-settle">确认登记</button>`
          }
        </div>
      </div>`;
  }

  function readQuotaFormFromDom(isNew) {
    const g = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };
    return {
      channelId: isNew ? g("ch-quota-channelId") : undefined,
      wholesalePrice: g("ch-quota-wholesalePrice"),
      minDays: g("ch-quota-minDays"),
      status: g("ch-quota-status"),
    };
  }

  function readCardFormFromDom() {
    const g = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };
    return {
      officialPrice: g("ch-card-officialPrice"),
      channelPrice: g("ch-card-channelPrice"),
      commissionPerOrder: g("ch-card-commissionPerOrder"),
      status: g("ch-card-status"),
    };
  }

  function readOfflineSettleFromDom() {
    const g = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };
    return { voucherNo: g("ch-offline-voucherNo"), settledAt: g("ch-offline-settledAt") };
  }

  function renderMenu(ch, ctx) {
    const { escapeHtml, escapeAttr, session } = ctx;
    const pendingLs = pendingLinkSettleBadgeCount();
    const items = MENU_ENTRIES.map((e) => {
      const pendingBadge =
        e.id === "linkSettle" && pendingLs > 0
          ? `<span class="pending">${pendingLs}待结</span>`
          : "";
      return `
      <button type="button" class="app-tile" data-action="ch-enter-section" data-tab="${escapeAttr(
        e.id
      )}">
        <div class="ai">${e.icon || "▦"}${pendingBadge}</div>
        <div class="an">${escapeHtml(e.label)}</div>
      </button>`;
    }).join("");

    return `
      <div class="sites-page ops-page channel-menu-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="back-workbench" aria-label="返回">‹</button>
          <h1>渠道管理</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">${escapeHtml(dataScopeHint(session))}</p>
        <div class="grid-apps channel-module-grid" aria-label="渠道管理模块">${items}</div>
      </div>`;
  }

  function renderHub(ch, ctx) {
    const { escapeHtml, session } = ctx;
    const tab = ch.tab || "contracts";
    let body = "";
    if (tab === "orders") body = renderOrdersTab(ch, ctx);
    else if (tab === "assets") body = renderAssetsTab(ch, ctx);
    else if (tab === "quotaPricing") body = renderQuotaPricingTab(ch, ctx);
    else if (tab === "cardPricing") body = renderCardPricingTab(ch, ctx);
    else if (tab === "linkSettle") body = renderLinkSettleTab(ch, ctx);
    else body = renderContractsTab(ch, ctx);

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-menu" aria-label="返回">‹</button>
          <h1>${escapeHtml(menuEntryTitle(tab))}</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">${escapeHtml(dataScopeHint(session))}</p>
        ${body}
      </div>`;
  }

  function readContractFormFromDom() {
    const g = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };
    const root = document.getElementById("ch-contract-form");
    const lockedMode = root && root.dataset.settlementMode;
    return {
      channelName: g("ch-form-channelName"),
      loginAccount: g("ch-form-loginAccount"),
      settlementMode: g("ch-form-settlementMode") || lockedMode || "人天池",
      city: g("ch-form-city"),
      status: g("ch-form-status"),
      contactName: g("ch-form-contactName"),
      contactPhone: g("ch-form-contactPhone"),
      wholesalePriceAct: g("ch-form-wholesalePriceAct"),
      minCodes: g("ch-form-minCodes"),
      codeSkuName: g("ch-form-codeSkuName"),
      codeValidityDays: g("ch-form-codeValidityDays"),
      monthlyRent: g("ch-form-monthlyRent"),
      whitelistDefaultAccess: g("ch-form-whitelistDefaultAccess"),
      crossNetworkEnabled: g("ch-form-crossNetworkEnabled"),
      dedicatedSiteId: g("ch-form-dedicatedSiteId"),
      newSiteName: g("ch-form-newSiteName"),
      instantCommissionPayout: g("ch-form-instantCommissionPayout"),
      commissionRatePct: g("ch-form-commissionRatePct"),
    };
  }

  function readCreditLimitFromDom() {
    const el = document.getElementById("ch-form-creditLimit");
    return el ? el.value : "";
  }

  function render(state, ctx) {
    const ch = state.channel || defaultState();
    const view = ch.view || "hub";
    if (view === "contractDetail") return renderContractDetail(ch, ctx);
    if (view === "contractForm") return renderContractForm(ch, ctx);
    if (view === "creditForm") return renderCreditForm(ch, ctx);
    if (view === "poolAdjust") return renderPoolAdjust(ch, ctx);
    if (view === "poolLedger") return renderPoolLedger(ch, ctx);
    if (view === "quotaForm") return renderQuotaPricingForm(ch, ctx);
    if (view === "cardForm") return renderCardPricingForm(ch, ctx);
    if (view === "linkSettleRegister" || view === "linkSettleVoucher") {
      return renderOfflineSettleForm(ch, ctx);
    }
    if (view === "hub") return renderHub(ch, ctx);
    return renderMenu(ch, ctx);
  }

  global.OperatorAppChannels = {
    OPERATOR_ID,
    PAYEE_OPERATOR,
    CHANNEL_DEFAULT_CREDIT_LIMIT,
    SETTLEMENT_MODES,
    NEW_CHANNEL_SETTLEMENT_MODES,
    MAIN_TABS,
    MENU_ENTRIES,
    ORDER_SUB_TABS,
    ASSET_SUB_TABS,
    defaultState,
    formatLocal,
    contractSettlementMode,
    channelUsesCreditEval,
    settlementModeLabel,
    contractPricingText,
    contractTermsText,
    myContracts,
    getContractById,
    getCreditProfile,
    ensureChannelCreditProfile,
    emptyForm,
    formFromContract,
    readContractFormFromDom,
    readCreditLimitFromDom,
    saveContract,
    adjustCreditLimit,
    confirmDayOrder,
    confirmRentOrder,
    confirmActOrder,
    confirmOrder,
    getDayOrders,
    getRentOrders,
    getActOrders,
    getDayPools,
    getDayPoolLedger,
    getSalePackages,
    getLeaseSummary,
    pendingConfirmCount,
    syncFormModeSections,
    getPlatformChannel,
    inheritDayQuota,
    DEFAULT_CHANNEL_PASSWORD,
    getPoolById,
    adjustPoolQuota,
    readPoolAdjustFromDom,
    filterLedgerRows,
    POOL_ADJUST_TYPES,
    saveQuotaPricing,
    saveCardPricing,
    registerOfflineCommissionSettle,
    dayPoolContractsForQuota,
    quotaPriceForChannel,
    readQuotaFormFromDom,
    readCardFormFromDom,
    readOfflineSettleFromDom,
    render,
    get channelContracts() {
      return channelContracts;
    },
    get channelSalesOrders() {
      return channelSalesOrders;
    },
    get channelRentTopupOrders() {
      return channelRentTopupOrders;
    },
    get channelActivationOrders() {
      return channelActivationOrders;
    },
    get dayPools() {
      return dayPools;
    },
    get dayPoolLedger() {
      return dayPoolLedger;
    },
    get channelSalePackages() {
      return channelSalePackages;
    },
    get channelLeaseSummary() {
      return channelLeaseSummary;
    },
    get channelCreditProfiles() {
      return channelCreditProfiles;
    },
    get platformChannels() {
      return platformChannels;
    },
  };
})(window);
