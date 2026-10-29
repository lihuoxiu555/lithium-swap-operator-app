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
    },
  ];

  const DAY_ALLOC_RIDERS = [
    { name: "王骑手", team: "默认团队", allocated: 30, remaining: 18, status: "使用中" },
    { name: "李骑手", team: "默认团队", allocated: 30, remaining: 22, status: "使用中" },
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

  const DAY_EXCEPTIONS = [
    { id: "EX-01", time: "2026-06-08 22:10", rider: "吴骑手", type: "待还电未确认", status: "处理中" },
    { id: "EX-02", time: "2026-06-07 09:00", rider: "周骑手", type: "分配收回异常", status: "已关闭" },
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

  const DAY_MAIN_TABS = [
    { id: "pools", label: "额度池" },
    { id: "riders", label: "骑手登记" },
    { id: "allocations", label: "额度分配" },
    { id: "consume", label: "消耗明细" },
    { id: "retail", label: "零售价" },
    { id: "exceptions", label: "异常记录" },
  ];

  function defaultState() {
    return {
      module: null,
      dayTab: "pools",
      dayPoolSub: "list",
      ridersSub: "list",
      allocSub: "logs",
      consumeSub: "rider",
      linksSub: "packages",
      commissionSub: "summary",
      auditKw: "",
      creditView: "home",
      depositProofs: null,
      depositForm: { amount: "10000", transferRef: "", transferDate: "" },
      view: "hub",
    };
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

  function renderDayPool(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const tab = ch.dayTab || "pools";
    const mainTabs = DAY_MAIN_TABS.map(
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
            <button type="button" class="btn-secondary channel-card-btn" data-action="ch-mock-toast" data-msg="增购人天（Mock）">增购人天额度</button>
          </div>
        </article>`;
      }
    } else if (tab === "riders") {
      const sub = ch.ridersSub || "list";
      subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
        [
          ["list", "登记骑手"],
          ["teams", "骑手团队"],
        ],
        sub,
        "ch-riders-sub",
        escapeHtml,
        escapeAttr
      )}</div>`;
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
    } else if (tab === "allocations") {
      const sub = ch.allocSub || "logs";
      subTabs = `<div class="sites-tabs channel-subtabs">${renderSubTabs(
        [
          ["riders", "按骑手"],
          ["logs", "变动记录"],
        ],
        sub,
        "ch-alloc-sub",
        escapeHtml,
        escapeAttr
      )}</div>`;
      if (sub === "riders") {
        body = DAY_ALLOC_RIDERS.map(
          (r) =>
            `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
              [
                ["骑手", escapeHtml(r.name)],
                ["团队", escapeHtml(r.team)],
                ["分配/剩余", `${r.allocated}/${r.remaining} 人天`],
                ["状态", escapeHtml(r.status)],
              ],
              escapeHtml
            )}</div></article>`
        ).join("");
      } else {
        body = DAY_ALLOC_LOGS.map(
          (l) =>
            `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
              [
                ["骑手", escapeHtml(l.riderName)],
                ["类型", escapeHtml(l.type)],
                ["人天", String(l.days)],
                ["时间", escapeHtml(l.time)],
              ],
              escapeHtml
            )}</div></article>`
        ).join("");
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
    } else if (tab === "exceptions") {
      body = DAY_EXCEPTIONS.map(
        (e) =>
          `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
            e.type
          )}</strong><span class="sites-tag">${escapeHtml(e.status)}</span></div>
          <div class="channel-card-kv">${renderKv(
            [
              ["时间", escapeHtml(e.time)],
              ["骑手", escapeHtml(e.rider)],
              ["单号", escapeHtml(e.id)],
            ],
            escapeHtml
          )}</div></article>`
      ).join("");
    }

    return `
      <p class="ops-hint channel-page-note">一运营商一池；团队/骑手均从唯一额度池扣减（对齐 PC dayPool）。</p>
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
    if (moduleId === "ch.dayPool") return renderDayPool(ch, ctx);
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
    const backAction = creditForm ? "ch-credit-form-back" : "ch-partner-back";
    const pageTitle = creditForm ? "提交打款凭证" : moduleTitle(mod);
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
    renderDataStats,
    render,
    moduleTitle,
    todoSummaries,
  };
})(window);
