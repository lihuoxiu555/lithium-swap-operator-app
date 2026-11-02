/**
 * 渠道商移动端 · 对齐 原型-外卖 渠道端 NAV（overview→数据统计，其余→工作台）
 */
(function (global) {
  const OPERATOR_NAME = "绿色出行";
  const OPERATOR_LOGO = "⚡";

  const PROFILES = {
    "CH-SF": {
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      settlementMode: "人天池",
      roleLabel: "客户·人天池",
      operatorName: OPERATOR_NAME,
      wholesalePrice: 8.5,
      sites: ["浦东骑手驿站", "世博换电服务点"],
    },
    "CH-CARD": {
      channelId: "CH-CARD",
      channelName: "骑士卡渠道",
      settlementMode: "链接类",
      roleLabel: "分销商·链接类",
      operatorName: OPERATOR_NAME,
      instantCommission: true,
      commissionRate: "9%",
      sites: ["浦东骑手驿站", "世博换电服务点", "陆家嘴分站"],
    },
  };

  const DAY_POOL = {
    id: "QP-2601",
    name: "顺丰浦东人天池",
    sellerName: OPERATOR_NAME,
    totalDays: 10000,
    giftedDays: 0,
    availableDays: 55,
    frozenDays: 12,
    consumedDays: 9933,
    wholesalePrice: 8.5,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    status: "余额不足",
    warnSms: true,
    balancePct: 0.55,
  };

  const MIN_PURCHASE_DAYS = 100;
  const MAX_PURCHASE_DAYS = 10000;

  /** @type {Array<object>} 渠道申购单（待运营商确认到账后入账额度明细） */
  let CHANNEL_PURCHASE_ORDERS = [];

  const DAY_POOL_LEDGER = [
    { id: "PL-001", type: "增购入账", days: 5000, time: "2026-01-02 11:00", remark: "PO-202601-088" },
    { id: "PL-002", type: "消耗扣减", days: -2, time: "2026-06-09 23:59", remark: "日终确认" },
    { id: "PL-003", type: "分配冻结", days: -30, time: "2026-05-01 10:00", remark: "王骑手" },
  ];

  const DAY_TEAMS = [
    {
      id: "TEAM-DEFAULT",
      name: "默认团队",
      riderCount: 5,
      status: "启用",
      isDefault: true,
      createdAt: "2026-01-01",
      remark: "渠道开户自动创建",
    },
    {
      id: "TEAM-WB",
      name: "世博车队",
      riderCount: 1,
      status: "启用",
      isDefault: false,
      createdAt: "2026-06-01",
      remark: "共享主池",
    },
    {
      id: "TEAM-NIGHT",
      name: "浦东夜班",
      riderCount: 0,
      status: "启用",
      isDefault: false,
      createdAt: "2026-07-01",
      remark: "空编演示",
    },
  ];

  const DAY_RIDERS = [
    {
      id: "U2101",
      name: "王骑手",
      phone: "138****2101",
      team: "默认团队",
      allocatedDays: 30,
      remainingDays: 18,
      todayEligibility: "已确认消耗",
      quotaStatus: "使用中",
      status: "在职",
    },
    {
      id: "U2102",
      name: "李骑手",
      phone: "139****2102",
      team: "默认团队",
      allocatedDays: 30,
      remainingDays: 22,
      todayEligibility: "今日可用",
      quotaStatus: "使用中",
      status: "在职",
    },
    {
      id: "U2112",
      name: "吴骑手",
      phone: "134****2112",
      team: "默认团队",
      allocatedDays: 30,
      remainingDays: 0,
      todayEligibility: "待还电",
      quotaStatus: "已用尽",
      status: "在职",
      holdingBattery: true,
    },
  ];

  const DAY_ALLOC_LOGS = [
    { id: "AL-001", riderName: "王骑手", type: "分配", days: 30, time: "2026-05-01 10:00" },
    { id: "AL-004", riderName: "周骑手", type: "收回", days: 18, time: "2026-06-07 16:20" },
  ];

  const DAY_CONSUME_RIDER = [
    { date: "2026-06-09", rider: "王骑手", team: "默认团队", confirmed: 1, swapCount: 1, site: "浦东骑手驿站" },
    { date: "2026-06-09", rider: "李骑手", team: "默认团队", confirmed: 1, swapCount: 0, site: "浦东骑手驿站" },
    { date: "2026-06-08", rider: "王骑手", team: "默认团队", confirmed: 1, swapCount: 2, site: "世博换电服务点" },
  ];

  const DAY_CONSUME_TEAM = [
    { date: "2026-06-09", team: "默认团队", confirmed: 2, swapCount: 1, riders: 2 },
    { date: "2026-06-08", team: "默认团队", confirmed: 3, swapCount: 3, riders: 3 },
  ];

  const DAY_RETAIL = [
    { sku: "按次换电", price: "¥3/次", site: "浦东骑手驿站", note: "渠道骑手零售价只读" },
    { sku: "应急换电", price: "¥5/次", site: "全签约站点", note: "与 PC「零售价」Tab 同口径演示" },
  ];

  const CREDIT = {
    creditLimit: 100000,
    requiredDeposit: 48000,
    creditedAmount: 32000,
    batteryDepositUnit: 8000,
    holdersWithBattery: 6,
    gap: 16000,
    channelUserDepositPolicy: "渠道统管押金",
  };

  const DEPOSIT_PROOFS = [
    {
      id: "DP-260601",
      amount: 6000,
      transferRef: "20260601123456",
      transferDate: "2026-06-01",
      status: "已通过",
      submitTime: "2026-06-01 10:00",
    },
    {
      id: "DP-260615",
      amount: 10000,
      transferRef: "20260615111222",
      transferDate: "2026-06-15",
      status: "待审核",
      submitTime: "2026-06-15 14:20",
    },
  ];

  const SALE_PACKAGES = [
    {
      id: "PKG-30D",
      skuId: "SKU-30D",
      name: "包月30天卡",
      batteryModel: "48V30Ah",
      officialPrice: 299,
      channelPrice: 279,
      commissionPerOrder: 25,
      linkCount: 3,
      clicks: 2180,
      conversions: 62,
      status: "启用",
    },
    {
      id: "PKG-7D",
      skuId: "SKU-7D",
      name: "7天卡",
      batteryModel: "48V30Ah",
      officialPrice: 89,
      channelPrice: 79,
      commissionPerOrder: 8,
      linkCount: 1,
      clicks: 1240,
      conversions: 23,
      status: "启用",
    },
  ];

  const PROMO_LINKS = [
    {
      id: "LNK-C001",
      packageId: "PKG-30D",
      sku: "包月30天卡",
      purpose: "App 首页 Banner",
      clicks: 820,
      conversions: 28,
      channelPrice: 279,
      officialPrice: 299,
      status: "启用",
      createdAt: "2026-03-01",
    },
    {
      id: "LNK-C002",
      packageId: "PKG-30D",
      sku: "包月30天卡",
      purpose: "短信召回活动",
      clicks: 560,
      conversions: 18,
      channelPrice: 279,
      officialPrice: 299,
      status: "启用",
      createdAt: "2026-04-15",
    },
    {
      id: "LNK-C004",
      packageId: "PKG-7D",
      sku: "7天卡",
      purpose: "新客试用入口",
      clicks: 1240,
      conversions: 23,
      channelPrice: 79,
      officialPrice: 89,
      status: "启用",
      createdAt: "2026-03-01",
    },
  ];

  const CARD_ORDERS = [
    {
      id: "LO-260601",
      riderName: "骑手A",
      phone: "138****2001",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25.11,
      settlement: "即时分账",
      linkPurpose: "App 首页 Banner",
      payTime: "2026-06-01 09:12",
    },
    {
      id: "LO-260608",
      riderName: "骑手C",
      phone: "137****2003",
      skuName: "7天卡",
      paidPrice: 79,
      commission: 7.11,
      settlement: "即时分账",
      linkPurpose: "新客试用入口",
      payTime: "2026-06-08 08:05",
    },
    {
      id: "LO-260610",
      riderName: "刘骑士",
      phone: "138****3001",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25.11,
      settlement: "即时分账",
      linkPurpose: "社群福利帖",
      payTime: "2026-06-10 16:30",
      clawback: true,
    },
    {
      id: "LO-260612",
      riderName: "骑手D",
      phone: "136****2004",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25,
      settlement: "线下结算",
      linkPurpose: "短信召回活动",
      payTime: "2026-06-12 11:08",
    },
  ];

  const COMMISSION_SUMMARY = [
    {
      month: "2026-06",
      settleType: "即时分账",
      orderCount: 4,
      totalPaid: 916,
      commission: 82.22,
      fee: 9.16,
      status: "已清分",
    },
    {
      month: "2026-06",
      settleType: "线下结算",
      orderCount: 1,
      totalPaid: 279,
      commission: 25,
      fee: 2.79,
      status: "待运营商登记",
    },
  ];

  const COMMISSION_MONTH_KPI = {
    month: "2026-06",
    orderCount: 5,
    totalPaid: 1195,
    totalCommission: 82.22,
    totalFee: 11.95,
    clawback: 25.11,
    net: 57.11,
  };

  const PAYOUT_ACCOUNT = {
    bank: "招商银行上海分行",
    accountNo: "6225 **** **** 6601",
    accountName: "骑士卡渠道",
    status: "已绑定",
    wxSubMch: "1900000***（分账）",
  };

  const ORDER_AUDIT = {
    "CH-SF": [
      {
        id: "AE-001",
        time: "2026-06-20 14:32",
        userPhone: "138****2001",
        eventType: "确认消耗",
        summary: "人天池 QP-2601 · -1 人天",
        before: "可用 186 人天",
        after: "可用 185 人天",
        by: "系统",
        refId: "SW260620001",
      },
      {
        id: "AE-002",
        time: "2026-06-07 16:20",
        userPhone: "139****2102",
        eventType: "额度收回",
        summary: "周骑手 · 收回 18 人天",
        before: "剩余 18",
        after: "剩余 0",
        by: "渠道管理员",
        refId: "AL-004",
      },
    ],
    "CH-CARD": [
      {
        id: "AE-005",
        time: "2026-06-10 16:30",
        userPhone: "138****3001",
        eventType: "链接购卡",
        summary: "经 LNK-C003 购包月30天卡 · LO-260610",
        before: "—",
        after: "服务中 · 渠道标记",
        by: "用户直购",
        refId: "LO-260610",
      },
      {
        id: "AE-006",
        time: "2026-06-18 10:00",
        userPhone: "138****3001",
        eventType: "退款冲正",
        summary: "LO-260610 套餐退款 · 佣金冲正",
        before: "已清分",
        after: "冲正 ¥25.11",
        by: "系统",
        refId: "LO-260610",
      },
    ],
  };

  const EMPLOYEES = [
    {
      id: "EMP-CH-01",
      name: "渠道运营张",
      phone: "139****3100",
      role: "渠道管理员",
      permSummary: "额度池编辑 · 骑手登记",
      status: "启用",
    },
    {
      id: "EMP-CH-02",
      name: "团队管理员李",
      phone: "138****3101",
      role: "团队管理员",
      permSummary: "仅本团队消耗只读",
      status: "启用",
    },
  ];

  /** 无额度仍持电 → 待办 Tab「异常」（非工作台模块） */
  function riderQuotaExceptions() {
    return DAY_RIDERS.filter(
      (r) =>
        r.status === "在职" &&
        r.remainingDays <= 0 &&
        (r.holdingBattery ||
          r.todayEligibility === "待还电" ||
          r.quotaStatus === "已用尽")
    ).map((r) => ({
      id: "CHX-" + r.id,
      riderId: r.id,
      riderName: r.name,
      phone: r.phone,
      team: r.team,
      subtype: "无额度持电",
      severity: "高",
      message: `个人剩余 ${r.remainingDays} 人天 · ${r.todayEligibility}，仍持有运营商电池`,
      status: "待处理",
      raisedAt: "今天 08:20",
      suggestAction: "分配额度或督促还电回池",
    }));
  }

  function getExceptionById(id) {
    return riderQuotaExceptions().find((x) => x.id === id) || null;
  }

  function exceptionCount(session) {
    if (!isChannelDay(session)) return 0;
    return riderQuotaExceptions().length;
  }

  function exceptionSummaries(session) {
    const n = exceptionCount(session);
    if (!n) return [];
    return [{ id: "quotaHold", title: "无额度持电", count: n }];
  }

  /** 人天额度池模块内 Tab（登记/分配已拆至工作台；异常进待办） */
  const DAY_POOL_TABS = [
    { id: "pools", label: "额度池" },
    { id: "consume", label: "消耗明细" },
    { id: "retail", label: "零售价" },
  ];

  function defaultState() {
    return {
      module: null,
      dayTab: "pools",
      dayPoolSub: "list",
      ridersSub: "list",
      allocSub: "riders",
      allocView: "home",
      allocRiderId: null,
      allocForm: { days: "30", remark: "" },
      consumeSub: "rider",
      linksSub: "packages",
      commissionSub: "summary",
      auditKw: "",
      creditView: "home",
      depositProofs: null,
      depositForm: { amount: "10000", transferRef: "", transferDate: "" },
      dayPoolView: "home",
      purchaseForm: null,
      view: "hub",
    };
  }

  function defaultPurchaseForm(session) {
    const p = profile(session);
    const now = new Date();
    const y = now.getFullYear();
    const orderSuffix = String(now.getTime()).slice(-4);
    return {
      totalDays: "1000",
      validFrom: DAY_POOL.validFrom || `${y}-01-01`,
      validTo: DAY_POOL.validTo || `${y}-12-31`,
      orderNo: `PO-${y}${String(now.getMonth() + 1).padStart(2, "0")}-${orderSuffix}`,
      payChannel: "offline",
      onlinePayMethod: "微信扫码",
      transferRef: "",
      payerAccount: "",
      remark: "向签约运营商增购人天",
      wholesalePrice: p.wholesalePrice || DAY_POOL.wholesalePrice,
    };
  }

  function formatPurchaseTime(d) {
    const dt = d instanceof Date ? d : new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(
      dt.getHours()
    )}:${pad(dt.getMinutes())}`;
  }

  function submitDayPoolPurchase(ch, session, raw) {
    const days = Math.floor(Number(raw.totalDays));
    if (!Number.isFinite(days) || days < MIN_PURCHASE_DAYS) {
      return { error: `购买人天数至少 ${MIN_PURCHASE_DAYS} 人天` };
    }
    if (days > MAX_PURCHASE_DAYS) {
      return { error: `单次最多 ${MAX_PURCHASE_DAYS.toLocaleString("zh-CN")} 人天` };
    }
    const orderNo = String(raw.orderNo || "").trim();
    if (!orderNo) {
      return { error: "请填写采购单号" };
    }
    const payChannel = raw.payChannel === "online" ? "online" : "offline";
    const transferRef = String(raw.transferRef || "").trim();
    if (payChannel === "offline" && !transferRef) {
      return { error: "线下打款请填写银行流水号（付款回单）" };
    }
    const p = profile(session);
    const unitPrice = Number(raw.wholesalePrice) || p.wholesalePrice || DAY_POOL.wholesalePrice;
    const amount = Math.round(days * unitPrice * 100) / 100;
    const now = new Date();
    const row = {
      id: orderNo,
      poolId: DAY_POOL.id,
      poolName: DAY_POOL.name,
      channelName: p.channelName,
      operatorName: p.operatorName,
      days,
      unitPrice,
      amount,
      payChannel,
      payMethod:
        payChannel === "online"
          ? raw.onlinePayMethod || "微信扫码"
          : "对公转账",
      orderStatus: payChannel === "online" ? "待支付" : "待确认到账",
      payStatus: payChannel === "online" ? "待支付" : "待付款",
      transferRef: payChannel === "offline" ? transferRef : "",
      payerAccount: payChannel === "offline" ? String(raw.payerAccount || "").trim() || "—" : "—",
      validFrom: String(raw.validFrom || "").trim() || DAY_POOL.validFrom,
      validTo: String(raw.validTo || "").trim() || DAY_POOL.validTo,
      remark: String(raw.remark || "").trim(),
      createdAt: formatPurchaseTime(now),
    };
    CHANNEL_PURCHASE_ORDERS.unshift(row);
    ch.dayPoolView = "home";
    ch.purchaseForm = defaultPurchaseForm(session);
    const msg =
      payChannel === "online"
        ? "已创建在线支付单（Mock），请完成支付"
        : "增购申请已提交，请等待运营商确认到账";
    return { ok: true, message: msg, order: row };
  }

  function getDepositProofs(ch) {
    if (!ch.depositProofs) {
      ch.depositProofs = DEPOSIT_PROOFS.map((p) => ({ ...p }));
    }
    return ch.depositProofs;
  }

  function submitDepositProof(ch, raw) {
    const amount = Number(raw.amount);
    const transferRef = String(raw.transferRef || "").trim();
    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: "请输入有效补缴金额" };
    }
    if (!transferRef) {
      return { error: "请填写银行流水号" };
    }
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const transferDate =
      String(raw.transferDate || "").trim() || now.toISOString().slice(0, 10);
    getDepositProofs(ch).unshift({
      id: "DP-" + String(now.getTime()).slice(-6),
      amount,
      transferRef,
      transferDate,
      status: "待审核",
      submitTime: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`,
    });
    ch.creditView = "home";
    ch.depositForm = { amount: "10000", transferRef: "", transferDate: "" };
    return { ok: true, message: "已提交打款凭证，等待运营商审核" };
  }

  function profile(session) {
    const id = session && session.channelId;
    return PROFILES[id] || PROFILES["CH-SF"];
  }

  function isChannelDay(session) {
    return session && session.role === "channelDay";
  }

  function isChannelLink(session) {
    return session && session.role === "channelLink";
  }

  function scopeHint(session) {
    const p = profile(session);
    return `当前：${p.channelName}（${p.channelId}）· 签约 ${p.operatorName} · ${p.roleLabel}`;
  }

  function renderKv(rows, escapeHtml) {
    return rows
      .map(
        ([k, v]) =>
          `<div class="channel-kv-row"><span class="channel-kv-k">${escapeHtml(k)}</span><span class="channel-kv-v">${v}</span></div>`
      )
      .join("");
  }

  function renderSubTabs(tabs, active, action, escapeHtml, escapeAttr) {
    return tabs
      .map(
        ([id, label]) =>
          `<button type="button" class="sites-tab${active === id ? " active" : ""}" data-action="${escapeAttr(
            action
          )}" data-sub="${escapeAttr(id)}">${escapeHtml(label)}</button>`
      )
      .join("");
  }

  function contractPanel(session, escapeHtml) {
    const p = profile(session);
    const sites = (p.sites || []).join("、");
    const extra =
      p.settlementMode === "链接类"
        ? [["佣金到付", p.instantCommission ? `即时分账 ${p.commissionRate}` : "线下"]]
        : [["批发单价", `¥${p.wholesalePrice}/人天`]];
    return `<article class="sites-card channel-card channel-contract-card">
      <div class="sites-card-hd"><span class="channel-contract-logo">${OPERATOR_LOGO}</span><div><strong>${escapeHtml(
        p.operatorName
      )}</strong><div class="channel-contract-sub">结算模式 · ${escapeHtml(p.settlementMode)}</div></div></div>
      <div class="channel-card-kv">${renderKv(
        [["可用站点", escapeHtml(sites)], ...extra],
        escapeHtml
      )}</div>
    </article>`;
  }

  function renderDataStats(state, ctx) {
    const { escapeHtml, session } = ctx;
    const p = profile(session);
    let warn = "";
    let cards = "";
    if (isChannelDay(session)) {
      warn = `<div class="channel-warn-banner"><strong>人天额度池余额不足</strong>：${escapeHtml(
        DAY_POOL.name
      )} 可用 <strong>${DAY_POOL.availableDays}</strong> 人天（已短信预警）。<button type="button" class="link-btn" data-action="open-module" data-id="ch.dayPool">进入额度池</button></div>`;
      cards = `
        <div class="channel-kpi-grid">
          <div class="channel-kpi warn"><span>人天池可用</span><strong>${DAY_POOL.availableDays} 人天</strong></div>
          <div class="channel-kpi"><span>在职骑手</span><strong>${DAY_RIDERS.filter((r) => r.status === "在职").length}</strong></div>
          <div class="channel-kpi"><span>签约运营商</span><strong>${escapeHtml(p.operatorName)}</strong></div>
          <div class="channel-kpi warn"><span>额度池预警</span><strong>${escapeHtml(DAY_POOL.id)}</strong></div>
        </div>`;
    } else {
      cards = `
        <div class="channel-kpi-grid">
          <div class="channel-kpi"><span>本月成交</span><strong>${COMMISSION_MONTH_KPI.orderCount} 单</strong></div>
          <div class="channel-kpi"><span>本月应结佣</span><strong>¥${COMMISSION_MONTH_KPI.totalCommission.toFixed(2)}</strong></div>
          <div class="channel-kpi"><span>推广链接</span><strong>${PROMO_LINKS.length} 条</strong></div>
          <div class="channel-kpi"><span>签约运营商</span><strong>${escapeHtml(p.operatorName)}</strong></div>
        </div>`;
    }
    return `
      <div class="data-stats-page">
        <div class="wb-top"><div class="tenant">${escapeHtml(p.channelName)}</div></div>
        <p class="ops-hint">${escapeHtml(scopeHint(session))}</p>
        ${isChannelDay(session) ? warn : ""}
        ${cards}
        <div class="channel-card-list" style="margin-top:12px">${contractPanel(session, escapeHtml)}</div>
        <p class="ops-hint channel-page-note">对应 PC「总览」；明细见工作台各模块（与 CHANNEL_NAV 一致）。</p>
      </div>`;
  }

  function riderById(id) {
    return DAY_RIDERS.find((r) => r.id === id) || null;
  }

  function pushAllocLog(riderName, type, days, remark) {
    DAY_ALLOC_LOGS.unshift({
      id: "AL-" + String(Date.now()).slice(-6),
      riderName,
      type,
      days,
      time: formatPurchaseTime(new Date()),
      remark: remark || "",
    });
  }

  function submitAllocateQuota(ch, riderId, raw) {
    const rider = riderById(riderId);
    if (!rider || rider.status !== "在职") {
      return { error: "骑手不存在或已离职" };
    }
    const days = Math.floor(Number(raw.days));
    if (!Number.isFinite(days) || days <= 0) {
      return { error: "请输入有效人天数" };
    }
    if (days > DAY_POOL.availableDays) {
      return { error: `额度池可用不足（当前 ${DAY_POOL.availableDays} 人天）` };
    }
    DAY_POOL.availableDays -= days;
    DAY_POOL.frozenDays += days;
    rider.allocatedDays = (rider.allocatedDays || 0) + days;
    rider.remainingDays = (rider.remainingDays || 0) + days;
    rider.quotaStatus = "使用中";
    pushAllocLog(rider.name, "分配", days, raw.remark);
    ch.allocView = "home";
    ch.allocRiderId = null;
    return { ok: true, message: `已向 ${rider.name} 分配 ${days} 人天` };
  }

  function submitRecoverQuota(ch, riderId, raw) {
    const rider = riderById(riderId);
    if (!rider || rider.status !== "在职") {
      return { error: "骑手不存在或已离职" };
    }
    const max = rider.remainingDays || 0;
    const days = Math.floor(Number(raw.days));
    if (!Number.isFinite(days) || days <= 0) {
      return { error: "请输入有效人天数" };
    }
    if (days > max) {
      return { error: `不得超过剩余人天（${max}）` };
    }
    rider.remainingDays = max - days;
    rider.allocatedDays = Math.max(0, (rider.allocatedDays || 0) - days);
    if (rider.remainingDays <= 0) {
      rider.quotaStatus = "已用尽";
    }
    DAY_POOL.availableDays += days;
    DAY_POOL.frozenDays = Math.max(0, DAY_POOL.frozenDays - days);
    pushAllocLog(rider.name, "收回", days, raw.remark);
    ch.allocView = "home";
    ch.allocRiderId = null;
    return { ok: true, message: `已收回 ${rider.name} ${days} 人天` };
  }

  function renderAllocForm(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const mode = ch.allocView;
    const rider = riderById(ch.allocRiderId);
    if (!rider || (mode !== "allocate" && mode !== "recover")) {
      return `<p class="empty-inline">未选择骑手</p>`;
    }
    const f = ch.allocForm || { days: "30", remark: "" };
    const isAlloc = mode === "allocate";
    const defaultDays = isAlloc
      ? String(Math.min(30, DAY_POOL.availableDays))
      : String(rider.remainingDays || 0);
    const daysVal = f.days != null && f.days !== "" ? f.days : defaultDays;
    const maxDays = isAlloc ? DAY_POOL.availableDays : rider.remainingDays || 0;
    return `
      <p class="ops-hint">${isAlloc ? "从额度池可用余额分配给骑手个人额度。" : "收回未使用人天回额度池（Mock 即时入账）。"}</p>
      <div class="sites-form-body channel-deposit-form">
        <div class="sites-field">
          <label>额度池</label>
          <input type="text" readonly value="${escapeAttr(
            `${DAY_POOL.id} · 可用 ${DAY_POOL.availableDays} 人天`
          )}" />
        </div>
        <div class="sites-field">
          <label>骑手</label>
          <input type="text" readonly value="${escapeAttr(
            `${rider.name} · ${rider.team} · 剩余 ${rider.remainingDays}/${rider.allocatedDays} 人天`
          )}" />
        </div>
        <div class="sites-field">
          <label for="ch-alloc-days">${isAlloc ? "分配人天数" : "收回人天数"}</label>
          <input id="ch-alloc-days" type="number" inputmode="numeric" min="1" max="${maxDays}"
            value="${escapeAttr(daysVal)}" ${maxDays <= 0 ? "disabled" : ""} />
          <p class="ops-hint">${isAlloc ? `最多 ${maxDays} 人天` : `最多收回 ${maxDays} 人天`}</p>
        </div>
        <div class="sites-field">
          <label for="ch-alloc-remark">备注</label>
          <textarea id="ch-alloc-remark" rows="2">${escapeHtml(
            f.remark || (isAlloc ? "分配给骑手换电使用" : "手动收回未使用额度")
          )}</textarea>
        </div>
      </div>
      <div class="sites-form-footer">
        <button type="button" class="sites-footer-ghost" data-action="ch-alloc-form-back">取消</button>
        <button type="button" class="sites-footer-primary" data-action="ch-alloc-submit" data-mode="${escapeAttr(
          mode
        )}" ${maxDays <= 0 ? "disabled" : ""}>确认${isAlloc ? "分配" : "收回"}</button>
      </div>`;
  }

  function renderDayRiders(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sub = ch.ridersSub || "list";
    const subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
      [
        ["list", "登记骑手"],
        ["teams", "骑手团队"],
      ],
      sub,
      "ch-riders-sub",
      escapeHtml,
      escapeAttr
    )}</div>`;
    let body = "";
    if (sub === "teams") {
      body = DAY_TEAMS.map(
        (t) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            t.name
          )}</strong><span class="sites-tag">${escapeHtml(t.status)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["在职", `${t.riderCount} 人`],
              ["默认团队", t.isDefault ? "是" : "否"],
              ["创建", escapeHtml(t.createdAt)],
              ["备注", escapeHtml(t.remark)],
            ],
            escapeHtml
          )}</div></article>`
      ).join("");
    } else {
      body = DAY_RIDERS.map(
        (r) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            r.name
          )}</strong><span class="sites-tag">${escapeHtml(r.quotaStatus)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["手机", escapeHtml(r.phone)],
              ["团队", escapeHtml(r.team)],
              ["剩余/分配", `${r.remainingDays}/${r.allocatedDays} 人天`],
              ["今日资格", escapeHtml(r.todayEligibility)],
            ],
            escapeHtml
          )}</div></article>`
      ).join("");
    }
    return `<p class="ops-hint channel-page-note">登记骑手与团队管理；扣减统一走渠道唯一额度池。</p>${subTabs}<div class="channel-card-list">${body}</div>`;
  }

  function renderDayAlloc(ch, ctx) {
    if (ch.allocView === "allocate" || ch.allocView === "recover") {
      return renderAllocForm(ch, ctx);
    }
    const { escapeHtml, escapeAttr } = ctx;
    const sub = ch.allocSub || "riders";
    const poolHint = `<p class="ops-hint channel-page-note">额度池 <strong>${escapeHtml(
      DAY_POOL.id
    )}</strong> 可用 <strong>${DAY_POOL.availableDays}</strong> 人天 · 冻结 ${DAY_POOL.frozenDays} 人天</p>`;
    const subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
      [
        ["riders", "按骑手"],
        ["logs", "变动记录"],
      ],
      sub,
      "ch-alloc-sub",
      escapeHtml,
      escapeAttr
    )}</div>`;
    let body = "";
    if (sub === "riders") {
      body = DAY_RIDERS.filter((r) => r.status === "在职")
        .map((r) => {
          const canRecover = (r.remainingDays || 0) > 0;
          const canAlloc = DAY_POOL.availableDays > 0;
          return `<article class="sites-card channel-card">
          <div class="sites-card-hd"><strong>${escapeHtml(r.name)}</strong><span class="sites-tag">${escapeHtml(
            r.quotaStatus
          )}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["团队", escapeHtml(r.team)],
              ["分配/剩余", `${r.allocatedDays}/${r.remainingDays} 人天`],
              ["今日资格", escapeHtml(r.todayEligibility)],
              ["状态", escapeHtml(r.status)],
            ],
            escapeHtml
          )}</div>
          <div class="channel-card-ft">
            <div class="channel-card-ft-row">
              <button type="button" class="btn-primary channel-card-btn" data-action="ch-alloc-open" data-mode="allocate" data-rider-id="${escapeAttr(
                r.id
              )}" ${canAlloc ? "" : "disabled"}>分配额度</button>
              <button type="button" class="btn-secondary channel-card-btn" data-action="ch-alloc-open" data-mode="recover" data-rider-id="${escapeAttr(
                r.id
              )}" ${canRecover ? "" : "disabled"}>收回额度</button>
            </div>
          </div>
        </article>`;
        })
        .join("");
    } else {
      body =
        DAY_ALLOC_LOGS.length === 0
          ? `<div class="empty-full"><div class="icon">📒</div>暂无变动记录</div>`
          : DAY_ALLOC_LOGS.map(
              (l) =>
                `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
                  [
                    ["骑手", escapeHtml(l.riderName)],
                    ["类型", escapeHtml(l.type)],
                    ["人天", String(l.days)],
                    ["时间", escapeHtml(l.time)],
                    l.remark ? ["备注", escapeHtml(l.remark)] : null,
                  ].filter(Boolean),
                  escapeHtml
                )}</div></article>`
            ).join("");
    }
    return `${poolHint}<p class="ops-hint">向骑手分配或收回人天额度（对齐 PC dayPool · 额度分配）。</p>${subTabs}<div class="channel-card-list">${body}</div>`;
  }

  function renderExceptionInbox(session, ctx, itemId) {
    const { escapeHtml, escapeAttr } = ctx;
    const items = riderQuotaExceptions();
    if (itemId) {
      const a = getExceptionById(itemId);
      if (!a) {
        return `<div class="todo-page"><div class="empty-full">异常不存在<button type="button" class="btn-secondary" data-action="ch-exceptions-back-list">返回</button></div></div>`;
      }
      return `
        <div class="todo-page">
          <div class="todo-header">
            <button type="button" class="todo-back" data-action="ch-exceptions-back-list" aria-label="返回">‹</button>
            <h1>异常详情</h1>
            <span class="todo-header-spacer"></span>
          </div>
          <article class="sites-card channel-card" style="margin:12px">
            <div class="channel-card-kv">${renderKv(
              [
                ["类型", escapeHtml(a.subtype)],
                ["骑手", `${escapeHtml(a.riderName)} · ${escapeHtml(a.phone)}`],
                ["团队", escapeHtml(a.team)],
                ["说明", escapeHtml(a.message)],
                ["建议", escapeHtml(a.suggestAction)],
                ["状态", escapeHtml(a.status)],
                ["时间", escapeHtml(a.raisedAt)],
              ],
              escapeHtml
            )}</div>
            <div class="channel-card-ft">
              <button type="button" class="btn-primary channel-card-btn" data-action="open-module" data-id="ch.dayAlloc">去分配额度</button>
              <button type="button" class="btn-secondary channel-card-btn" data-action="open-module" data-id="ch.dayRiders">查看骑手登记</button>
            </div>
          </article>
        </div>`;
    }
    const cards =
      items.length === 0
        ? `<div class="empty-full"><div class="icon">✓</div>暂无异常</div>`
        : items
            .map(
              (a) => `
        <article class="todo-card" data-action="ch-exception-open" data-id="${escapeAttr(a.id)}">
          <div class="todo-card-hd">
            <strong>${escapeHtml(a.subtype)} · ${escapeHtml(a.riderName)}</strong>
            <span class="todo-tag hot">${escapeHtml(a.severity)}</span>
          </div>
          <div class="todo-card-sum">${escapeHtml(a.message)}</div>
          <div class="todo-card-meta">${escapeHtml(a.status)} · ${escapeHtml(a.raisedAt)}</div>
        </article>`
            )
            .join("");
    return `
      <div class="todo-page">
        <div class="todo-header">
          <button type="button" class="todo-back" data-action="alerts-back-wb" aria-label="返回">‹</button>
          <h1>异常</h1>
          <span class="todo-header-count">${items.length}</span>
        </div>
        <p class="todo-source">无额度仍持电骑手 · 由待办推送（非历史异常台账）</p>
        <div class="todo-list">${cards}</div>
      </div>`;
  }

  function renderPurchaseOrdersBlock(escapeHtml) {
    if (!CHANNEL_PURCHASE_ORDERS.length) return "";
    const cards = CHANNEL_PURCHASE_ORDERS.slice(0, 5)
      .map(
        (o) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            o.id
          )}</strong><span class="sites-tag">${escapeHtml(o.orderStatus)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["人天 / 金额", `${o.days} 人天 · ¥${o.amount.toLocaleString("zh-CN")}`],
              ["支付", escapeHtml(o.payMethod)],
              ["提交时间", escapeHtml(o.createdAt)],
              o.transferRef ? ["流水号", escapeHtml(o.transferRef)] : null,
            ].filter(Boolean),
            escapeHtml
          )}</div>
          <p class="ops-hint" style="margin:8px 0 0">对公<strong>附言请填采购单号</strong>；确认到账后写入「额度明细」。</p>
          </article>`
      )
      .join("");
    return `<div class="channel-section-hd">最近申购</div>${cards}`;
  }

  function renderDayPoolPurchaseForm(ch, session, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const p = profile(session);
    const f = ch.purchaseForm || defaultPurchaseForm(session);
    const offline = f.payChannel !== "online";
    return `
      <p class="ops-hint">向签约运营商按批发价采购人天；<strong>一运营商一池</strong>，增购入账同一池（对齐 PC decision-114/115）。</p>
      <div class="sites-form-body channel-deposit-form" id="ch-purchase-form">
        <div class="sites-field">
          <label>入账额度池</label>
          <input type="text" readonly value="${escapeAttr(
            `${DAY_POOL.id} · ${DAY_POOL.name}（唯一池）`
          )}" />
        </div>
        <div class="sites-field">
          <label>渠道商</label>
          <input type="text" readonly value="${escapeAttr(p.channelName)}" />
        </div>
        <div class="sites-field">
          <label>售卖方（运营商）</label>
          <input type="text" readonly value="${escapeAttr(p.operatorName)}" />
        </div>
        <div class="sites-field">
          <label for="ch-purchase-days">购买人天数</label>
          <input id="ch-purchase-days" type="number" inputmode="numeric" min="${MIN_PURCHASE_DAYS}" max="${MAX_PURCHASE_DAYS}"
            value="${escapeAttr(f.totalDays)}" />
          <p class="ops-hint">${MIN_PURCHASE_DAYS}～${MAX_PURCHASE_DAYS.toLocaleString(
      "zh-CN"
    )} 人天/次</p>
        </div>
        <div class="sites-field">
          <label for="ch-purchase-valid-from">生效日期</label>
          <input id="ch-purchase-valid-from" type="date" value="${escapeAttr(f.validFrom)}" />
        </div>
        <div class="sites-field">
          <label for="ch-purchase-valid-to">失效日期</label>
          <input id="ch-purchase-valid-to" type="date" value="${escapeAttr(f.validTo)}" />
        </div>
        <div class="sites-field">
          <label>批发单价（元/人天）</label>
          <input type="text" readonly value="${escapeAttr(String(f.wholesalePrice))}" />
        </div>
        <div class="sites-field">
          <label for="ch-purchase-order-no">采购单号</label>
          <input id="ch-purchase-order-no" type="text" value="${escapeAttr(f.orderNo)}" />
          <p class="ops-hint">对公转账附言请填此单号</p>
        </div>
        <div class="sites-field">
          <label for="ch-purchase-pay">支付渠道</label>
          <select id="ch-purchase-pay">
            <option value="offline"${offline ? " selected" : ""}>线下打款</option>
            <option value="online"${!offline ? " selected" : ""}>在线支付</option>
          </select>
        </div>
        <div class="sites-field" id="ch-purchase-online-wrap" style="${offline ? "display:none" : ""}">
          <label for="ch-purchase-online-method">在线方式</label>
          <select id="ch-purchase-online-method">
            <option${f.onlinePayMethod === "微信扫码" ? " selected" : ""}>微信扫码</option>
            <option${f.onlinePayMethod === "支付宝扫码" ? " selected" : ""}>支付宝扫码</option>
          </select>
        </div>
        <div id="ch-purchase-offline-wrap" style="${offline ? "" : "display:none"}">
          <p class="ops-hint">流水号为付款回单证据；认款以<strong>金额 + 附言（采购单号）</strong>为主。不填转账日。</p>
          <div class="sites-field">
            <label for="ch-purchase-transfer-ref">银行流水号</label>
            <input id="ch-purchase-transfer-ref" type="text" placeholder="付款回单流水号"
              value="${escapeAttr(f.transferRef || "")}" />
          </div>
          <div class="sites-field">
            <label for="ch-purchase-payer">付款账户（建议）</label>
            <input id="ch-purchase-payer" type="text" placeholder="对公户名或账号后四位"
              value="${escapeAttr(f.payerAccount || "")}" />
          </div>
        </div>
        <div class="sites-field">
          <label for="ch-purchase-remark">备注</label>
          <textarea id="ch-purchase-remark" rows="2">${escapeHtml(f.remark || "")}</textarea>
        </div>
        <div class="sites-field">
          <label>收款信息（只读）</label>
          <p class="ops-hint" style="margin:4px 0 0">开户名：${escapeHtml(
            p.operatorName
          )} · 招商银行上海分行 · 对公专户（演示）</p>
        </div>
      </div>
      <div class="sites-form-footer">
        <button type="button" class="sites-footer-ghost" data-action="ch-day-purchase-back">取消</button>
        <button type="button" class="sites-footer-primary" data-action="ch-day-purchase-submit">提交申购</button>
      </div>`;
  }

  function renderDayPool(ch, ctx, session) {
    if ((ch.dayPoolView || "home") === "purchaseForm") {
      return renderDayPoolPurchaseForm(ch, session, ctx);
    }
    const { escapeHtml, escapeAttr } = ctx;
    const tab = ch.dayTab || "pools";
    const mainTabs = DAY_POOL_TABS.map(
      (t) =>
        `<button type="button" class="sites-tab${tab === t.id ? " active" : ""}" data-action="ch-day-tab" data-tab="${escapeAttr(
          t.id
        )}">${escapeHtml(t.label)}</button>`
    ).join("");

    let subTabs = "";
    let body = "";

    if (tab === "pools") {
      const sub = ch.dayPoolSub || "list";
      subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
        [
          ["list", "额度池列表"],
          ["ledger", "额度明细"],
        ],
        sub,
        "ch-day-pool-sub",
        escapeHtml,
        escapeAttr
      )}</div>`;
      if (sub === "ledger") {
        body = DAY_POOL_LEDGER.map(
          (l) =>
            `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
              [
                ["类型", escapeHtml(l.type)],
                ["人天", String(l.days)],
                ["时间", escapeHtml(l.time)],
                ["备注", escapeHtml(l.remark)],
              ],
              escapeHtml
            )}</div></article>`
        ).join("");
      } else {
        body = `<article class="sites-card channel-card">
          <div class="sites-card-hd"><strong>${escapeHtml(DAY_POOL.name)}</strong><span class="sites-tag warn">${escapeHtml(
            DAY_POOL.status
          )}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["池 ID", escapeHtml(DAY_POOL.id)],
              ["售卖方", escapeHtml(DAY_POOL.sellerName)],
              ["总购买", `${DAY_POOL.totalDays - DAY_POOL.giftedDays} 人天`],
              ["赠送", DAY_POOL.giftedDays ? `${DAY_POOL.giftedDays} 人天` : "—"],
              ["可用/冻结/已消耗", `${DAY_POOL.availableDays} / ${DAY_POOL.frozenDays} / ${DAY_POOL.consumedDays}`],
              ["余额比例", `${DAY_POOL.balancePct}%`],
              ["有效期", `${escapeHtml(DAY_POOL.validFrom)} ~ ${escapeHtml(DAY_POOL.validTo)}`],
            ],
            escapeHtml
          )}</div>
          <div class="channel-card-ft">
            <button type="button" class="btn-primary channel-card-btn" data-action="ch-day-purchase-open">增购人天额度</button>
          </div>
        </article>${renderPurchaseOrdersBlock(escapeHtml)}`;
      }
    } else if (tab === "consume") {
      const sub = ch.consumeSub || "rider";
      subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
        [
          ["rider", "按骑手"],
          ["team", "按团队"],
        ],
        sub,
        "ch-consume-sub",
        escapeHtml,
        escapeAttr
      )}</div>`;
      if (sub === "team") {
        body = DAY_CONSUME_TEAM.map(
          (c) =>
            `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
              [
                ["日期", escapeHtml(c.date)],
                ["团队", escapeHtml(c.team)],
                ["确认消耗", `${c.confirmed} 人天`],
                ["换电/骑手", `${c.swapCount} 次 / ${c.riders} 人`],
              ],
              escapeHtml
            )}</div></article>`
        ).join("");
      } else {
        body = DAY_CONSUME_RIDER.map(
          (c) =>
            `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
              [
                ["日期", escapeHtml(c.date)],
                ["骑手", escapeHtml(c.rider)],
                ["确认/换电", `${c.confirmed} 人天 / ${c.swapCount} 次`],
                ["站点", escapeHtml(c.site)],
              ],
              escapeHtml
            )}</div></article>`
        ).join("");
      }
    } else if (tab === "retail") {
      body = DAY_RETAIL.map(
        (r) =>
          `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
            [
              ["项目", escapeHtml(r.sku)],
              ["价格", escapeHtml(r.price)],
              ["站点", escapeHtml(r.site)],
              ["说明", escapeHtml(r.note)],
            ],
            escapeHtml
          )}</div></article>`
      ).join("");
    }

    return `
      <p class="ops-hint channel-page-note">额度池概况与消耗；登记/分配见工作台；无额度持电见待办·异常。</p>
      <div class="lease-filters"><div class="sites-tabs sites-tabs-scroll" role="tablist">${mainTabs}</div></div>
      ${subTabs}
      <div class="channel-card-list">${body}</div>`;
  }

  function renderSettlement(session, ctx) {
    const { escapeHtml } = ctx;
    const p = profile(session);
    const mode = p.settlementMode === "链接类" ? "推广（链接类）" : "人天池";
    const rows =
      p.settlementMode === "人天池"
        ? [
            ["模式", "向签约运营商采购人天 · 登记骑手 · 分配/收回"],
            ["消耗", "换电或日终持电确认扣减个人额度"],
            ["B 端平台费", "按平台标准人天价 1%（运营商侧代扣）"],
            ["退款", "额度池不支持在线退款（decision-126）"],
            ["可用站点", escapeHtml((p.sites || []).join("、"))],
          ]
        : [
            ["模式", "推广链接/二维码 · 用户小程序购套餐"],
            ["获客价", "24h 内新客首笔享渠道专享价"],
            ["佣金", p.instantCommission ? `及时分账 ${p.commissionRate}` : "线下结算对账"],
            ["平台费", "支付成功实时清分 1%"],
            ["线下状态", "渠道端待线下列显示 ——（运营商推广结算登记）"],
          ];
    return `<div class="channel-card-list"><article class="sites-card channel-card">
      <div class="channel-card-kv">${renderKv(rows, escapeHtml)}</div>
      <p class="ops-hint">对应 PC「结算模式说明」· <strong>${escapeHtml(mode)}</strong></p>
    </article>${contractPanel(session, escapeHtml)}</div>`;
  }

  function renderDepositProofForm(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const f = ch.depositForm || {};
    const gap = CREDIT.gap;
    return `
      <p class="ops-hint">线下对公打款后提交凭证，由签约运营商审核入账（对齐 PC 提交打款凭证）。</p>
      <div class="sites-form-body channel-deposit-form">
        <div class="sites-field">
          <label for="ch-deposit-amount">补缴金额（元）</label>
          <input id="ch-deposit-amount" type="number" inputmode="decimal" placeholder="如 10000"
            value="${escapeAttr(f.amount != null ? f.amount : "")}" />
          <p class="ops-hint">当前待补缴约 ¥${gap.toLocaleString("zh-CN")}（演示）</p>
        </div>
        <div class="sites-field">
          <label for="ch-deposit-ref">银行流水号</label>
          <input id="ch-deposit-ref" type="text" placeholder="对公转账流水号"
            value="${escapeAttr(f.transferRef || "")}" />
        </div>
        <div class="sites-field">
          <label for="ch-deposit-date">转账日期</label>
          <input id="ch-deposit-date" type="date" value="${escapeAttr(f.transferDate || "")}" />
        </div>
        <div class="sites-field">
          <label>收款信息（只读）</label>
          <p class="ops-hint" style="margin:4px 0 0">开户名：绿色出行 · 招商银行上海分行 · 对公专户（演示）</p>
        </div>
      </div>
      <div class="sites-form-footer">
        <button type="button" class="sites-footer-ghost" data-action="ch-credit-form-back">取消</button>
        <button type="button" class="sites-footer-primary" data-action="ch-deposit-proof-submit">提交</button>
      </div>`;
  }

  function renderCredit(session, ch, ctx) {
    const { escapeHtml } = ctx;
    if (isChannelLink(session)) {
      return `<div class="channel-card-list"><article class="sites-card channel-card">
        <p class="ops-hint">推广分销渠道不涉及渠道信用额度；用户押金按 C 端规则处理（对齐 PC channelCredit 链接类空态）。</p>
      </article></div>`;
    }
    if ((ch.creditView || "home") === "depositForm") {
      return renderDepositProofForm(ch, ctx);
    }
    const c = CREDIT;
    const proofs = getDepositProofs(ch).map(
      (p) =>
        `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
          p.id
        )}</strong><span class="sites-tag">${escapeHtml(p.status)}</span></div>
        <div class="channel-card-kv">${renderKv(
          [
            ["金额", `¥${p.amount.toLocaleString("zh-CN")}`],
            ["流水", escapeHtml(p.transferRef)],
            ["转账日", escapeHtml(p.transferDate)],
            ["提交", escapeHtml(p.submitTime)],
          ],
          escapeHtml
        )}</div></article>`
    ).join("");
    return `<div class="channel-kpi-grid">
        <div class="channel-kpi"><span>信用额度</span><strong>¥${c.creditLimit.toLocaleString("zh-CN")}</strong></div>
        <div class="channel-kpi"><span>应押</span><strong>¥${c.requiredDeposit.toLocaleString("zh-CN")}</strong></div>
        <div class="channel-kpi warn"><span>待补缴</span><strong>¥${c.gap.toLocaleString("zh-CN")}</strong></div>
        <div class="channel-kpi"><span>持电骑手</span><strong>${c.holdersWithBattery} 人</strong></div>
      </div>
      <p class="ops-hint">应押 = 电池押金 ¥${c.batteryDepositUnit.toLocaleString("zh-CN")} × 持电 ${c.holdersWithBattery}；信用分一期不展示。</p>
      <div class="channel-card-ft" style="padding:0 16px 8px">
        <button type="button" class="btn-primary channel-card-btn" data-action="ch-deposit-proof-open">提交打款凭证</button>
      </div>
      <div class="group-title" style="padding:8px 16px 0">押金补缴凭证</div>
      <div class="channel-card-list">${proofs}</div>`;
  }

  function renderLinks(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sub = ch.linksSub || "packages";
    const subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
      [
        ["packages", "可销售套餐"],
        ["links", "推广链接"],
      ],
      sub,
      "ch-links-sub",
      escapeHtml,
      escapeAttr
    )}</div>`;
    let body = "";
    if (sub === "links") {
      body = PROMO_LINKS.map(
        (l) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            l.purpose
          )}</strong><span class="sites-tag">${escapeHtml(l.status)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["套餐", escapeHtml(l.sku)],
              ["ID", escapeHtml(l.id)],
              ["专享/正式", `¥${l.channelPrice} / ¥${l.officialPrice}`],
              ["点击/成交", `${l.clicks} / ${l.conversions}`],
            ],
            escapeHtml
          )}</div>
          <div class="channel-card-ft">
            <button type="button" class="btn-secondary channel-card-btn" data-action="ch-mock-copy-link" data-link="${escapeAttr(
              l.id
            )}">复制链接</button>
            <button type="button" class="btn-secondary channel-card-btn" data-action="ch-mock-toast" data-msg="二维码（Mock）">二维码</button>
          </div></article>`
      ).join("");
    } else {
      body = SALE_PACKAGES.map(
        (p) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            p.name
          )}</strong><span class="sites-tag">${escapeHtml(p.status)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["型号", escapeHtml(p.batteryModel)],
              ["正式/专享", `¥${p.officialPrice} / ¥${p.channelPrice}`],
              ["佣金/单", `¥${p.commissionPerOrder}`],
              ["链接/点击/成交", `${p.linkCount} 条 / ${p.clicks} / ${p.conversions}`],
            ],
            escapeHtml
          )}</div></article>`
      ).join("");
    }
    return `${subTabs}<p class="ops-hint channel-page-note">价格由运营商签约配置；同一套餐可多条链接（对齐 PC channelLinks）。</p>
      <div class="channel-card-list">${body}</div>
      <div class="channel-card-ft" style="padding:8px 16px"><button type="button" class="btn-primary channel-card-btn" data-action="ch-mock-toast" data-msg="新建推广链接（Mock）">+ 新建链接</button></div>`;
  }

  function renderCardOrders(ctx) {
    const { escapeHtml } = ctx;
    return `<p class="ops-hint channel-page-note">经推广链接购卡 · 24h 新客首笔专享价（对齐 PC channelOrders）。</p>
      <div class="channel-card-list">${CARD_ORDERS.map(
        (o) =>
          `<article class="sites-card channel-card channel-order-card">
        <div class="sites-card-hd"><strong>${escapeHtml(o.id)}</strong><span class="sites-tag">${escapeHtml(o.settlement)}</span></div>
        <div class="channel-card-kv">${renderKv(
          [
            ["用户", `${escapeHtml(o.riderName)} · ${escapeHtml(o.phone)}`],
            ["套餐", escapeHtml(o.skuName)],
            ["实付/佣金", `¥${o.paidPrice} / ¥${o.commission}`],
            ["链接用途", escapeHtml(o.linkPurpose)],
            ["支付时间", escapeHtml(o.payTime)],
            ...(o.clawback ? [["退款冲正", "佣金已冲正 ¥25.11"]] : []),
          ],
          escapeHtml
        )}</div></article>`
      ).join("")}</div>`;
  }

  function renderCommission(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const sub = ch.commissionSub || "summary";
    const subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
      [
        ["summary", "月度汇总"],
        ["detail", "订单明细"],
      ],
      sub,
      "ch-commission-sub",
      escapeHtml,
      escapeAttr
    )}</div>`;
    const kpi = `<div class="channel-kpi-grid">
      <div class="channel-kpi"><span>${escapeHtml(COMMISSION_MONTH_KPI.month)}</span><strong>${COMMISSION_MONTH_KPI.orderCount} 笔</strong></div>
      <div class="channel-kpi"><span>实付合计</span><strong>¥${COMMISSION_MONTH_KPI.totalPaid}</strong></div>
      <div class="channel-kpi"><span>佣金</span><strong>¥${COMMISSION_MONTH_KPI.totalCommission.toFixed(2)}</strong></div>
      <div class="channel-kpi"><span>平台 1%</span><strong>¥${COMMISSION_MONTH_KPI.totalFee.toFixed(2)}</strong></div>
    </div>
    <p class="ops-hint">当前生效：<strong>佣金及时到付 · 9%</strong> · 支付成功即时分账至渠道子商户。</p>`;

    let body = "";
    if (sub === "detail") {
      body = CARD_ORDERS.map(
        (o) =>
          `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
            [
              ["订单", escapeHtml(o.id)],
              ["用户/套餐", `${escapeHtml(o.riderName)} · ${escapeHtml(o.skuName)}`],
              ["实付/佣金", `¥${o.paidPrice} / ¥${o.commission}`],
              ["结算", escapeHtml(o.settlement)],
              ["支付", escapeHtml(o.payTime)],
            ],
            escapeHtml
          )}</div></article>`
      ).join("");
    } else {
      body = COMMISSION_SUMMARY.map(
        (r) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            r.month
          )}</strong><span class="sites-tag">${escapeHtml(r.settleType)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["成交", `${r.orderCount} 笔`],
              ["实付/佣金", `¥${r.totalPaid} / ¥${r.commission.toFixed(2)}`],
              ["平台 1%", `¥${r.fee.toFixed(2)}`],
              ["状态", escapeHtml(r.status)],
            ],
            escapeHtml
          )}</div></article>`
      ).join("");
    }
    return `${subTabs}${kpi}<div class="channel-card-list">${body}</div>
      <p class="ops-hint channel-page-note">线下结算状态以运营商「推广结算」登记为准。</p>`;
  }

  function renderAccount(ctx) {
    const { escapeHtml } = ctx;
    const a = PAYOUT_ACCOUNT;
    return `<div class="channel-card-list"><article class="sites-card channel-card">
      <div class="channel-card-kv">${renderKv(
        [
          ["开户名", escapeHtml(a.accountName)],
          ["银行", escapeHtml(a.bank)],
          ["账号", escapeHtml(a.accountNo)],
          ["微信子商户", escapeHtml(a.wxSubMch)],
          ["状态", escapeHtml(a.status)],
        ],
        escapeHtml
      )}</div>
      <p class="ops-hint">对应 PC「收款账户」· 变更请联系签约运营商。</p>
    </article></div>`;
  }

  function renderOrderAudit(ch, session, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const cid = session.channelId || "CH-SF";
    const kw = (ch.auditKw || "").trim().toLowerCase();
    const rows = (ORDER_AUDIT[cid] || []).filter((e) => {
      if (!kw) return true;
      return (
        e.summary.toLowerCase().includes(kw) ||
        e.userPhone.includes(kw) ||
        (e.refId && e.refId.toLowerCase().includes(kw))
      );
    });
    const list = rows
      .map(
        (e) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            e.eventType
          )}</strong><span class="sites-tag">${escapeHtml(e.time.slice(0, 10))}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["用户", escapeHtml(e.userPhone)],
              ["摘要", escapeHtml(e.summary)],
              ["变更", `${escapeHtml(e.before)} → ${escapeHtml(e.after)}`],
              ["操作人", escapeHtml(e.by)],
              ["关联", escapeHtml(e.refId || "—")],
            ],
            escapeHtml
          )}</div></article>`
      )
      .join("");
    return `<p class="ops-hint channel-page-note">统一变更记录 · 仅本渠道成员相关（对齐 PC orderAudit）。</p>
      <div class="channel-ls-filter">
        <input type="search" class="channel-filter-input" id="ch-audit-kw" placeholder="手机/单号/摘要" value="${escapeAttr(
          ch.auditKw || ""
        )}" />
        <button type="button" class="btn-secondary channel-filter-btn" data-action="ch-audit-search">查询</button>
      </div>
      <div class="channel-card-list">${list || '<p class="empty-inline">暂无变更记录</p>'}</div>`;
  }

  function renderEmployees(ctx) {
    const { escapeHtml } = ctx;
    return `<p class="ops-hint channel-page-note">渠道后台登录账号与功能权限（对齐 PC employees · 渠道主体）。</p>
      <div class="channel-kpi-grid">
        <div class="channel-kpi"><span>运营员工</span><strong>${EMPLOYEES.length}</strong></div>
        <div class="channel-kpi"><span>启用</span><strong>${EMPLOYEES.filter((e) => e.status === "启用").length}</strong></div>
      </div>
      <div class="channel-card-list">${EMPLOYEES.map(
        (e) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            e.name
          )}</strong><span class="sites-tag">${escapeHtml(e.status)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["手机", escapeHtml(e.phone)],
              ["岗位", escapeHtml(e.role)],
              ["权限", escapeHtml(e.permSummary)],
            ],
            escapeHtml
          )}</div>
          <div class="channel-card-ft"><button type="button" class="btn-secondary channel-card-btn" data-action="ch-mock-toast" data-msg="编辑员工（Mock）">编辑</button></div>
          </article>`
      ).join("")}</div>
      <div class="channel-card-ft" style="padding:8px 16px"><button type="button" class="btn-primary channel-card-btn" data-action="ch-mock-toast" data-msg="新增员工（Mock）">+ 新增员工</button></div>`;
  }

  function moduleTitle(moduleId) {
    const map = {
      "ch.dayPool": "人天额度池",
      "ch.dayRiders": "骑手登记",
      "ch.dayAlloc": "额度分配",
      "ch.settlement": "结算模式说明",
      "ch.credit": "渠道信用额度",
      "ch.links": "套餐与链接",
      "ch.cardOrders": "购卡记录",
      "ch.commission": "佣金对账",
      "ch.account": "收款账户",
      "ch.orderAudit": "变更记录",
      "ch.employees": "员工",
    };
    return map[moduleId] || "渠道业务";
  }

  function renderModuleBody(moduleId, ch, session, ctx) {
    if (moduleId === "ch.dayPool") return renderDayPool(ch, ctx, session);
    if (moduleId === "ch.dayRiders") return renderDayRiders(ch, ctx);
    if (moduleId === "ch.dayAlloc") return renderDayAlloc(ch, ctx);
    if (moduleId === "ch.settlement") return renderSettlement(session, ctx);
    if (moduleId === "ch.credit") return renderCredit(session, ch, ctx);
    if (moduleId === "ch.links") return renderLinks(ch, ctx);
    if (moduleId === "ch.cardOrders") return renderCardOrders(ctx);
    if (moduleId === "ch.commission") return renderCommission(ch, ctx);
    if (moduleId === "ch.account") return renderAccount(ctx);
    if (moduleId === "ch.orderAudit") return renderOrderAudit(ch, session, ctx);
    if (moduleId === "ch.employees") return renderEmployees(ctx);
    return `<p class="empty-inline">模块开发中</p>`;
  }

  function render(state, ctx) {
    const session = ctx.session;
    const ch = state.chPartner || defaultState();
    const mod = ch.module;
    if (!mod) {
      return `<div class="empty-full">未选择模块</div>`;
    }
    const { escapeHtml, session: s } = ctx;
    const creditForm = mod === "ch.credit" && ch.creditView === "depositForm";
    const purchaseForm = mod === "ch.dayPool" && ch.dayPoolView === "purchaseForm";
    const allocForm =
      mod === "ch.dayAlloc" &&
      (ch.allocView === "allocate" || ch.allocView === "recover");
    const backAction = creditForm
      ? "ch-credit-form-back"
      : purchaseForm
        ? "ch-day-purchase-back"
        : allocForm
          ? "ch-alloc-form-back"
          : "ch-partner-back";
    const pageTitle = creditForm
      ? "提交打款凭证"
      : purchaseForm
        ? "购买人天额度"
        : allocForm
          ? ch.allocView === "allocate"
            ? "分配人天额度"
            : "收回人天额度"
          : moduleTitle(mod);
    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="${backAction}" aria-label="返回">‹</button>
          <h1>${escapeHtml(pageTitle)}</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">${escapeHtml(scopeHint(s))}</p>
        ${renderModuleBody(mod, ch, session, ctx)}
      </div>`;
  }

  function todoSummaries(session) {
    if (isChannelDay(session)) {
      return [{ id: "poolWarn", title: "额度池余额不足", count: 1 }];
    }
    if (isChannelLink(session)) {
      return [{ id: "commission", title: "佣金对账关注", count: 1 }];
    }
    return [];
  }

  global.OperatorAppChannelPartner = {
    PROFILES,
    defaultState,
    profile,
    isChannelDay,
    isChannelLink,
    scopeHint,
    submitDepositProof,
    submitDayPoolPurchase,
    submitAllocateQuota,
    submitRecoverQuota,
    riderById,
    defaultPurchaseForm,
    MIN_PURCHASE_DAYS,
    MAX_PURCHASE_DAYS,
    exceptionCount,
    exceptionSummaries,
    getExceptionById,
    renderExceptionInbox,
    renderDataStats,
    render,
    moduleTitle,
    todoSummaries,
  };
})(window);
