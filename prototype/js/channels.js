/**
 * 渠道管理 · 签约渠道 / 渠道订单 / 渠道权益（移动端）
 * Mock 自 原型-外卖 config-mock 子集；decision-098 信用额度
 */
(function (global) {
  const OPERATOR_ID = "OP-SX";
  const PAYEE_OPERATOR = "绿色出行";
  const CHANNEL_DEFAULT_CREDIT_LIMIT = 100000;

  const SETTLEMENT_MODES = [
    { id: "人天池", label: "人天池" },
    { id: "链接类", label: "链接类" },
    { id: "设备租赁", label: "设备租赁（二期）" },
    { id: "激活码", label: "激活码（二期）" },
  ];

  const MAIN_TABS = [
    { id: "contracts", label: "签约渠道" },
    { id: "orders", label: "渠道订单" },
    { id: "assets", label: "渠道权益" },
  ];

  const ORDER_SUB_TABS = [
    { id: "day", label: "人天批发" },
    { id: "rent", label: "设备月租" },
    { id: "act", label: "激活码批发" },
  ];

  const ASSET_SUB_TABS = [
    { id: "dayPool", label: "人天池" },
    { id: "card", label: "渠道分销" },
    { id: "rent", label: "设备租赁" },
    { id: "act", label: "激活码" },
  ];

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
  const channelLeaseSummary = [
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

  function defaultState() {
    return {
      tab: "contracts",
      ordersSub: "day",
      assetsSub: "dayPool",
      view: "hub",
      editId: null,
      creditChannelId: null,
      form: {},
      ledgerPoolId: "QP-2601",
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

  function emptyForm() {
    return {
      channelName: "",
      settlementMode: "人天池",
      wholesalePrice: "8.5",
      minDays: "1000",
      sites: "浦东骑手驿站",
    };
  }

  function formFromContract(c) {
    if (!c) return emptyForm();
    return {
      channelName: c.channelName || "",
      settlementMode: contractSettlementMode(c),
      wholesalePrice: c.wholesalePrice != null ? String(c.wholesalePrice) : "",
      minDays: c.minDays != null ? String(c.minDays) : "",
      sites: Array.isArray(c.sites) ? c.sites.join("、") : String(c.sites || ""),
    };
  }

  function parseSitesText(text) {
    return String(text || "")
      .split(/[,，、\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function saveContract(form, editId) {
    const channelName = String(form.channelName || "").trim();
    const settlementMode = form.settlementMode || "人天池";
    const sites = parseSitesText(form.sites);
    if (!channelName) return { ok: false, msg: "请填写渠道商名称" };
    if (settlementMode === "人天池") {
      const wp = parseFloat(form.wholesalePrice);
      const md = parseInt(form.minDays, 10);
      if (!Number.isFinite(wp) || wp <= 0) return { ok: false, msg: "请填写有效批发单价" };
      if (!Number.isFinite(md) || md <= 0) return { ok: false, msg: "请填写最低起购人天" };
      if (!sites.length) return { ok: false, msg: "请填写授权站点" };
    }

    if (editId && editId !== "new") {
      const row = getContractById(editId);
      if (!row) return { ok: false, msg: "签约不存在" };
      row.channelName = channelName;
      if (settlementMode === "人天池") {
        row.wholesalePrice = parseFloat(form.wholesalePrice);
        row.minDays = parseInt(form.minDays, 10);
        row.sites = sites;
      } else if (Array.isArray(row.sites)) {
        row.sites = sites.length ? sites : row.sites;
      }
      return { ok: true, contract: row };
    }

    const seq = String(channelContracts.length + 1).padStart(2, "0");
    const channelId = "CH-NEW-" + seq;
    const row = {
      id: "CC-NEW-" + seq,
      channelId,
      channelName,
      operatorId: OPERATOR_ID,
      operatorName: PAYEE_OPERATOR,
      settlementMode,
      wholesalePrice:
        settlementMode === "人天池" ? parseFloat(form.wholesalePrice) : null,
      minDays: settlementMode === "人天池" ? parseInt(form.minDays, 10) : null,
      sites: settlementMode === "人天池" ? sites : [],
      status: "在营",
    };
    channelContracts.unshift(row);
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

  function renderContractCard(c, escapeHtml, escapeAttr) {
    const usesCredit = channelUsesCreditEval(c.channelId);
    const prof = usesCredit ? ensureChannelCreditProfile(c.channelId) : null;
    const creditLine = usesCredit
      ? `信用 ¥${(prof?.creditLimit ?? CHANNEL_DEFAULT_CREDIT_LIMIT).toLocaleString("zh-CN")}`
      : "分销 · 无渠道信用";
    return `<article class="sites-card" data-action="ch-open-contract" data-id="${escapeAttr(
      c.id
    )}">
      <div class="sites-card-hd">
        <div>
          <strong>${escapeHtml(c.channelName)}</strong>
          <div class="sites-meta">${escapeHtml(c.channelId)} · ${escapeHtml(
      settlementModeLabel(contractSettlementMode(c))
    )}</div>
        </div>
        <span class="status-pill ok">${escapeHtml(c.status || "在营")}</span>
      </div>
      <div class="sites-card-rows">
        <div><span>批发/定价</span><em>${escapeHtml(contractPricingText(c))}</em></div>
        <div><span>权益概要</span><em>${escapeHtml(contractTermsText(c))}</em></div>
        <div><span>信用</span><em>${escapeHtml(creditLine)}</em></div>
      </div>
    </article>`;
  }

  function renderOrderCard(o, kind, escapeHtml, escapeAttr) {
    let title = o.id;
    let rows = "";
    let confirmBtn = "";
    if (kind === "day") {
      rows = `
        <div><span>渠道</span><em>${escapeHtml(o.channelName)}</em></div>
        <div><span>人天/金额</span><em>${o.days} 人天 · ¥${o.amount.toLocaleString("zh-CN")}</em></div>
        <div><span>支付</span><em>${escapeHtml(o.payMethod || "—")}${o.transferRef ? " · " + escapeHtml(o.transferRef) : ""}</em></div>
        <div><span>状态</span><em>${escapeHtml(o.orderStatus)} / ${escapeHtml(o.payStatus)}</em></div>`;
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
      confirmBtn = `<button type="button" class="btn-primary" style="width:100%;margin-top:10px" data-action="ch-confirm-order" data-kind="${escapeAttr(
        kind
      )}" data-id="${escapeAttr(o.id)}">确认到账</button>`;
    }
    return `<article class="sites-card">
      <div class="sites-card-hd">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <div class="sites-meta">${escapeHtml(o.createdAt || "")}</div>
        </div>
        <span class="status-pill ${orderStatusClass(o.orderStatus)}">${escapeHtml(
      o.orderStatus
    )}</span>
      </div>
      <div class="sites-card-rows">${rows}</div>
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
      <div class="sites-list">
        <button type="button" class="btn-primary" style="width:100%;margin-bottom:10px" data-action="ch-new-contract">+ 新增渠道商</button>
        ${cards}
      </div>`;
  }

  function renderOrdersTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sub = ch.ordersSub || "day";
    let orders = getDayOrders();
    if (sub === "rent") orders = getRentOrders();
    if (sub === "act") orders = getActOrders();
    const cards =
      orders.map((o) => renderOrderCard(o, sub, escapeHtml, escapeAttr)).join("") ||
      `<div class="empty-inline compact">暂无订单</div>`;
    return (
      renderSubTabs(ORDER_SUB_TABS, sub, "ch-orders-sub", "sub", escapeHtml, escapeAttr) +
      `<div class="sites-list">${cards}</div>`
    );
  }

  function renderDayPoolAssets(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const pools = getDayPools();
    const ledgerPool = ch.ledgerPoolId || pools[0]?.id || "QP-2601";
    const ledger = getDayPoolLedger(ledgerPool);
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
          <button type="button" class="btn-secondary" style="width:100%;margin-top:8px" data-action="ch-ledger-pool" data-pool="${escapeAttr(
            p.id
          )}">查看流水</button>
        </article>`;
      })
      .join("");
    const ledgerRows = ledger
      .map(
        (l) =>
          `<div class="lease-row"><span class="lk">${escapeHtml(l.time.slice(5, 16))} ${escapeHtml(
            l.type
          )}</span><span class="lv">${l.deltaDays ? (l.deltaDays > 0 ? "+" : "") + l.deltaDays + "天 · " : ""}余 ${l.balanceAfter}</span></div>`
      )
      .join("");
    return `
      <div class="sites-list">${poolCards || `<div class="empty-inline compact">暂无人天池</div>`}</div>
      <section class="devstat-sec">
        <div class="devstat-hd"><strong>额度流水</strong><span class="sites-meta">${escapeHtml(
          ledgerPool
        )}</span></div>
        <div class="sites-card-rows compact">${ledgerRows || `<div class="empty-inline compact">暂无流水</div>`}</div>
      </section>`;
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

  function renderAssetsTab(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sub = ch.assetsSub || "dayPool";
    let body = "";
    if (sub === "card") body = renderCardAssets(ctx);
    else if (sub === "rent") body = renderRentAssets(ctx);
    else if (sub === "act") body = renderActAssets(ctx);
    else body = renderDayPoolAssets(ch, ctx);
    return (
      renderSubTabs(ASSET_SUB_TABS, sub, "ch-assets-sub", "sub", escapeHtml, escapeAttr) + body
    );
  }

  function renderContractDetail(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const c = getContractById(ch.editId);
    if (!c) {
      return `<div class="empty-full">签约不存在<button type="button" class="btn-secondary" data-action="ch-back-hub">返回</button></div>`;
    }
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
    const modeOpts = SETTLEMENT_MODES.map(
      (m) =>
        `<option value="${escapeAttr(m.id)}" ${form.settlementMode === m.id ? "selected" : ""}>${escapeHtml(
          m.label
        )}</option>`
    ).join("");
    const modeLocked = !isNew;
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-back-detail" aria-label="返回">‹</button>
          <h1>${isNew ? "新增渠道商" : "编辑签约"}</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body">
          <p class="sites-hint">保存后同步 Mock 签约列表；人天池需填写批发价、起购与站点。</p>
          <label class="sites-field">渠道商名称
            <input id="ch-form-channelName" type="text" value="${escapeAttr(
              form.channelName || ""
            )}" placeholder="如：同城配送渠道" />
          </label>
          <label class="sites-field">结算模式
            ${
              modeLocked
                ? `<input type="text" readonly value="${escapeAttr(
                    settlementModeLabel(form.settlementMode)
                  )}" />`
                : `<select id="ch-form-settlementMode">${modeOpts}</select>`
            }
          </label>
          <label class="sites-field">批发单价（元/人天）
            <input id="ch-form-wholesalePrice" type="number" step="0.1" min="0" value="${escapeAttr(
              form.wholesalePrice || ""
            )}" placeholder="8.5" />
          </label>
          <label class="sites-field">最低起购（人天）
            <input id="ch-form-minDays" type="number" step="1" min="1" value="${escapeAttr(
              form.minDays || ""
            )}" placeholder="1000" />
          </label>
          <label class="sites-field">授权站点（顿号或逗号分隔）
            <textarea id="ch-form-sites" rows="3" placeholder="浦东骑手驿站、世博换电服务点">${escapeHtml(
              form.sites || ""
            )}</textarea>
          </label>
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

  function renderHub(ch, ctx) {
    const { escapeHtml, escapeAttr, session } = ctx;
    const tab = ch.tab || "contracts";
    let body = "";
    if (tab === "orders") body = renderOrdersTab(ch, ctx);
    else if (tab === "assets") body = renderAssetsTab(ch, ctx);
    else body = renderContractsTab(ch, ctx);

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="back-workbench" aria-label="返回">‹</button>
          <h1>渠道管理</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">${escapeHtml(dataScopeHint(session))}</p>
        <div class="sites-tabs" role="tablist">${renderTabs(
          MAIN_TABS,
          tab,
          "ch-tab",
          "tab",
          escapeHtml,
          escapeAttr
        )}</div>
        ${body}
      </div>`;
  }

  function readContractFormFromDom() {
    const g = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };
    return {
      channelName: g("ch-form-channelName"),
      settlementMode: g("ch-form-settlementMode") || "人天池",
      wholesalePrice: g("ch-form-wholesalePrice"),
      minDays: g("ch-form-minDays"),
      sites: g("ch-form-sites"),
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
    return renderHub(ch, ctx);
  }

  global.OperatorAppChannels = {
    OPERATOR_ID,
    PAYEE_OPERATOR,
    CHANNEL_DEFAULT_CREDIT_LIMIT,
    SETTLEMENT_MODES,
    MAIN_TABS,
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
  };
})(window);
