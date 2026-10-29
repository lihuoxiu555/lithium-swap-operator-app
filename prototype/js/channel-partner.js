/**
 * 渠道商移动端 · 客户·人天池 / 分销商·链接类
 * Mock 对齐 原型-外卖 渠道端菜单子集
 */
(function (global) {
  const OPERATOR_NAME = "绿色出行";

  const PROFILES = {
    "CH-SF": {
      channelId: "CH-SF",
      channelName: "顺丰同城渠道",
      settlementMode: "人天池",
      roleLabel: "客户·人天池",
      operatorName: OPERATOR_NAME,
    },
    "CH-CARD": {
      channelId: "CH-CARD",
      channelName: "骑士卡渠道",
      settlementMode: "链接类",
      roleLabel: "分销商·链接类",
      operatorName: OPERATOR_NAME,
      instantCommission: true,
      commissionRate: "9%",
    },
  };

  const DAY_POOL = {
    id: "QP-2601",
    name: "顺丰浦东人天池",
    totalDays: 10000,
    availableDays: 55,
    frozenDays: 12,
    consumedDays: 9933,
    wholesalePrice: 8.5,
    validTo: "2026-12-31",
    status: "余额不足",
  };

  const DAY_TEAMS = [
    { id: "TEAM-DEFAULT", name: "默认团队", riderCount: 5, status: "启用", isDefault: true },
    { id: "TEAM-WB", name: "世博车队", riderCount: 1, status: "启用", isDefault: false },
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
    },
  ];

  const DAY_ALLOC_LOGS = [
    { id: "AL-001", riderName: "王骑手", type: "分配", days: 30, time: "2026-05-01 10:00" },
    { id: "AL-004", riderName: "周骑手", type: "收回", days: 18, time: "2026-06-07 16:20" },
  ];

  const DAY_CONSUME = [
    { date: "2026-06-09", team: "默认团队", confirmed: 2, swapCount: 1, site: "浦东骑手驿站" },
    { date: "2026-06-08", team: "默认团队", confirmed: 3, swapCount: 3, site: "浦东骑手驿站" },
  ];

  const CREDIT = {
    creditLimit: 100000,
    requiredDeposit: 48000,
    creditedAmount: 32000,
  };

  const PROMO_LINKS = [
    {
      id: "LNK-C001",
      sku: "包月30天卡",
      purpose: "App 首页 Banner",
      clicks: 820,
      conversions: 28,
      channelPrice: 279,
      officialPrice: 299,
    },
    {
      id: "LNK-C004",
      sku: "7天卡",
      purpose: "新客试用入口",
      clicks: 1240,
      conversions: 23,
      channelPrice: 79,
      officialPrice: 89,
    },
  ];

  const CARD_ORDERS = [
    {
      id: "LO-260601",
      riderName: "骑手A",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25.11,
      settlement: "即时分账",
      payTime: "2026-06-01 09:12",
    },
    {
      id: "LO-260612",
      riderName: "骑手D",
      skuName: "包月30天卡",
      paidPrice: 279,
      commission: 25,
      settlement: "线下结算",
      payTime: "2026-06-12 11:08",
    },
  ];

  const COMMISSION_ROWS = [
    { month: "2026-06", gross: 82.22, clawback: 25.11, net: 57.11, settle: "即时+线下", status: "部分待线下" },
    { month: "2026-05", gross: 57.22, clawback: 0, net: 57.22, settle: "即时分账", status: "已清分" },
  ];

  const PAYOUT_ACCOUNT = {
    bank: "招商银行上海分行",
    accountNo: "6225 **** **** 6601",
    accountName: "骑士卡渠道",
    status: "已绑定",
  };

  const DAY_POOL_TABS = [
    { id: "pool", label: "额度" },
    { id: "teams", label: "团队" },
    { id: "riders", label: "登记" },
    { id: "alloc", label: "分配" },
    { id: "consume", label: "消耗" },
  ];

  function defaultState() {
    return { module: null, dayTab: "pool", view: "hub" };
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

  function renderDataStats(state, ctx) {
    const { escapeHtml, session } = ctx;
    const p = profile(session);
    let cards = "";
    if (isChannelDay(session)) {
      cards = `
        <div class="channel-kpi-grid">
          <div class="channel-kpi warn"><span>池可用</span><strong>${DAY_POOL.availableDays} 人天</strong></div>
          <div class="channel-kpi"><span>在职骑手</span><strong>${DAY_RIDERS.length}</strong></div>
          <div class="channel-kpi"><span>今日确认消耗</span><strong>2 人天</strong></div>
          <div class="channel-kpi"><span>池状态</span><strong>${escapeHtml(DAY_POOL.status)}</strong></div>
        </div>`;
    } else {
      cards = `
        <div class="channel-kpi-grid">
          <div class="channel-kpi"><span>本月成交</span><strong>5 笔</strong></div>
          <div class="channel-kpi"><span>本月佣金</span><strong>¥82.22</strong></div>
          <div class="channel-kpi"><span>推广链接</span><strong>${PROMO_LINKS.length} 条</strong></div>
          <div class="channel-kpi warn"><span>待线下结</span><strong>¥25.00</strong></div>
        </div>`;
    }
    return `
      <div class="data-stats-page">
        <div class="wb-top"><div class="tenant">${escapeHtml(p.channelName)}</div></div>
        <p class="ops-hint">${escapeHtml(scopeHint(session))}</p>
        ${cards}
        <p class="ops-hint channel-page-note">数据统计为渠道端总览 Mock；明细见工作台各模块。</p>
      </div>`;
  }

  function renderDayPool(ch, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const tab = ch.dayTab || "pool";
    const tabs = DAY_POOL_TABS.map(
      (t) =>
        `<button type="button" class="sites-tab${tab === t.id ? " active" : ""}" data-action="ch-day-tab" data-tab="${escapeAttr(
          t.id
        )}">${escapeHtml(t.label)}</button>`
    ).join("");
    let body = "";
    if (tab === "teams") {
      body = DAY_TEAMS.map(
        (t) => `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
          t.name
        )}</strong><span class="sites-tag">${escapeHtml(t.status)}</span></div>
        <div class="channel-card-kv">${renderKv(
          [
            ["成员", `${t.riderCount} 人`],
            ["默认团队", t.isDefault ? "是" : "否"],
          ],
          escapeHtml
        )}</div></article>`
      ).join("");
    } else if (tab === "riders") {
      body = DAY_RIDERS.map(
        (r) => `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
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
    } else if (tab === "alloc") {
      body = DAY_ALLOC_LOGS.map(
        (l) => `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
          [
            ["骑手", escapeHtml(l.riderName)],
            ["类型", escapeHtml(l.type)],
            ["人天", String(l.days)],
            ["时间", escapeHtml(l.time)],
          ],
          escapeHtml
        )}</div></article>`
      ).join("");
    } else if (tab === "consume") {
      body = DAY_CONSUME.map(
        (c) => `<article class="sites-card channel-card"><div class="channel-card-kv">${renderKv(
          [
            ["日期", escapeHtml(c.date)],
            ["团队", escapeHtml(c.team)],
            ["确认消耗", `${c.confirmed} 人天`],
            ["换电次数", String(c.swapCount)],
            ["站点", escapeHtml(c.site)],
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
            ["可用/总量", `${DAY_POOL.availableDays} / ${DAY_POOL.totalDays} 人天`],
            ["冻结", `${DAY_POOL.frozenDays} 人天`],
            ["已消耗", `${DAY_POOL.consumedDays} 人天`],
            ["批发价", `¥${DAY_POOL.wholesalePrice}/人天`],
            ["有效期至", escapeHtml(DAY_POOL.validTo)],
          ],
          escapeHtml
        )}</div>
        <p class="ops-hint channel-page-note">额度池不支持在线退款，需与运营商线下协商（decision-126）。</p>
      </article>`;
    }
    return `
      <div class="lease-filters"><div class="sites-tabs" role="tablist">${tabs}</div></div>
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
            ["B 端平台费", "按平台标准人天价 1%（运营商侧代扣演示）"],
            ["退款", "额度池不支持在线退款"],
          ]
        : [
            ["模式", "推广链接/二维码 · 用户小程序购套餐"],
            ["获客价", "24h 内新客首笔享渠道专享价"],
            ["佣金", p.instantCommission ? `及时分账 ${p.commissionRate}` : "线下结算对账"],
            ["线下状态", "渠道端佣金对账线下列显示 ——"],
          ];
    return `<div class="channel-card-list"><article class="sites-card channel-card">
      <div class="channel-card-kv">${renderKv(rows, escapeHtml)}</div>
      <p class="ops-hint">结算模式：<strong>${escapeHtml(mode)}</strong> · 详规见 PC《渠道结算模式规则》</p>
    </article></div>`;
  }

  function renderCredit(ctx) {
    const { escapeHtml } = ctx;
    return `<div class="channel-card-list"><article class="sites-card channel-card">
      <div class="channel-card-kv">${renderKv(
        [
          ["授信额度", `¥${CREDIT.creditLimit.toLocaleString("zh-CN")}`],
          ["应押", `¥${CREDIT.requiredDeposit.toLocaleString("zh-CN")}`],
          ["已入账信用", `¥${CREDIT.creditedAmount.toLocaleString("zh-CN")}`],
          ["信用分", "一期不展示"],
        ],
        escapeHtml
      )}</div>
      <p class="ops-hint channel-page-note">调额与凭证审核在签约运营商侧处理。</p>
    </article></div>`;
  }

  function renderLinks(ctx) {
    const { escapeHtml } = ctx;
    const cards = PROMO_LINKS.map(
      (l) => `<article class="sites-card channel-card"><div class="sites-card-hd"><strong>${escapeHtml(
        l.sku
      )}</strong></div>
      <div class="channel-card-kv">${renderKv(
        [
          ["用途", escapeHtml(l.purpose)],
          ["专享/正式", `¥${l.channelPrice} / ¥${l.officialPrice}`],
          ["点击/成交", `${l.clicks} / ${l.conversions}`],
        ],
        escapeHtml
      )}</div>
      <div class="channel-card-ft"><button type="button" class="btn-secondary channel-card-btn" data-action="ch-mock-copy-link">复制链接（Mock）</button></div>
      </article>`
    ).join("");
    return `<p class="ops-hint channel-page-note">套餐授权与专享价由运营商在「渠道分销价」维护；本页仅管理链接。</p>
      <div class="channel-card-list">${cards}</div>`;
  }

  function renderCardOrders(ctx) {
    const { escapeHtml } = ctx;
    return `<div class="channel-card-list">${CARD_ORDERS.map(
      (o) => `<article class="sites-card channel-card channel-order-card">
        <div class="sites-card-hd"><strong>${escapeHtml(o.id)}</strong><span class="sites-tag">${escapeHtml(o.settlement)}</span></div>
        <div class="channel-card-kv">${renderKv(
          [
            ["用户", escapeHtml(o.riderName)],
            ["套餐", escapeHtml(o.skuName)],
            ["实付/佣金", `¥${o.paidPrice} / ¥${o.commission}`],
            ["支付时间", escapeHtml(o.payTime)],
          ],
          escapeHtml
        )}</div></article>`
    ).join("")}</div>`;
  }

  function renderCommission(ctx) {
    const { escapeHtml } = ctx;
    return `<div class="channel-card-list">${COMMISSION_ROWS.map(
      (r) => `<article class="sites-card channel-card">
        <div class="sites-card-hd"><strong>${escapeHtml(r.month)}</strong><span class="sites-tag">${escapeHtml(r.status)}</span></div>
        <div class="channel-card-kv">${renderKv(
          [
            ["佣金毛额", `¥${r.gross.toFixed(2)}`],
            ["退款冲正", r.clawback ? `¥${r.clawback.toFixed(2)}` : "—"],
            ["净佣金", `¥${r.net.toFixed(2)}`],
            ["结算方式", escapeHtml(r.settle)],
          ],
          escapeHtml
        )}</div></article>`
    ).join("")}<p class="ops-hint channel-page-note">线下结算状态以运营商「推广结算」登记为准；渠道端仍为 ——。</p></div>`;
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
          ["状态", escapeHtml(a.status)],
        ],
        escapeHtml
      )}</div>
      <p class="ops-hint">对公卡变更请联系签约运营商代维护。</p>
    </article></div>`;
  }

  function moduleTitle(moduleId) {
    const map = {
      "ch.dayPool": "人天额度池",
      "ch.settlement": "结算说明",
      "ch.credit": "信用额度",
      "ch.links": "套餐与链接",
      "ch.cardOrders": "购卡记录",
      "ch.commission": "佣金对账",
      "ch.account": "收款账户",
    };
    return map[moduleId] || "渠道业务";
  }

  function renderModuleBody(moduleId, ch, session, ctx) {
    if (moduleId === "ch.dayPool") return renderDayPool(ch, ctx);
    if (moduleId === "ch.settlement") return renderSettlement(session, ctx);
    if (moduleId === "ch.credit") return renderCredit(ctx);
    if (moduleId === "ch.links") return renderLinks(ctx);
    if (moduleId === "ch.cardOrders") return renderCardOrders(ctx);
    if (moduleId === "ch.commission") return renderCommission(ctx);
    if (moduleId === "ch.account") return renderAccount(ctx);
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
    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="ch-partner-back" aria-label="返回">‹</button>
          <h1>${escapeHtml(moduleTitle(mod))}</h1>
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
    renderDataStats,
    render,
    moduleTitle,
    todoSummaries,
  };
})(window);
