/**
 * 柜外电池作业 · Mock + 流程（柜外换电/退电/领电、远程出电）
 * 决策 decision-067
 */
(function (global) {
  const ORDER_TYPES = {
    off_swap: { id: "off_swap", label: "柜外换电" },
    off_return: { id: "off_return", label: "柜外退电" },
    off_pickup: { id: "off_pickup", label: "柜外领电" },
    remote_out: { id: "remote_out", label: "远程出电" },
  };

  const SWAP_STATUS = {
    in_progress: "进行中",
    outbound_timeout: "出电超时-退电",
    completed: "已完成",
  };

  /** @type {Record<string, { sn: string, boundUserPhone?: string, inCabinet?: { cab: string, port: number, door: string } }>} */
  let BATTERIES = {
    "035211127474": { sn: "035211127474", boundUserPhone: "18915821617" },
    "035211210001": { sn: "035211210001", boundUserPhone: "13800138001" },
    "492391002233": { sn: "492391002233" },
    "492391883344": { sn: "492391883344" },
    "492399990003": {
      sn: "492399990003",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 7,
        door: "关闭",
        soc: 65,
      },
    },
    "492399990001": {
      sn: "492399990001",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 3,
        door: "关闭",
        soc: 92,
      },
    },
    "492399990002": {
      sn: "492399990002",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 5,
        door: "关闭",
        soc: 78,
      },
    },
  };

  /** @type {Array<object>} */
  let USERS = [
    {
      id: "u-shi",
      name: "史建国",
      phone: "18915821617",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: "035211127474",
      waitPickup: false,
    },
    {
      id: "u-wang",
      name: "王骑手",
      phone: "13800138001",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: null,
      waitPickup: true,
    },
    {
      id: "u-chen",
      name: "陈晓",
      phone: "13900001111",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: null,
      waitPickup: false,
    },
    {
      id: "u-li",
      name: "李骑手",
      phone: "13700002222",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: null,
      waitPickup: false,
    },
  ];

  /** @type {Array<object>} */
  let CABINET_SWAPS = [
    {
      id: "sw-r1",
      userId: "u-chen",
      orderNo: "SW260928001",
      status: "in_progress",
      createdAt: "2026-10-28 16:10",
      outboundDeadlineMs: Date.now() + 4 * 60 * 1000,
      r1: true,
      r2: false,
      returnedSn: "492391002233",
      outboundSn: "492399990001",
      returnRecorded: true,
      cabinetId: "cab-pd-1",
      siteName: "浦东骑手驿站",
      cabinetName: "浦东 1 号柜",
      cab: "浦东 1 号柜",
      outPort: 3,
    },
    {
      id: "sw-r2",
      userId: "u-li",
      orderNo: "SW260928002",
      status: "in_progress",
      createdAt: "2026-10-28 16:20",
      outboundDeadlineMs: Date.now() - 60000,
      r1: false,
      r2: true,
      returnedSn: null,
      outboundSn: "492399990002",
      returnRecorded: false,
      openFail: true,
      cabinetId: "cab-pd-1",
      siteName: "浦东骑手驿站",
      cabinetName: "浦东 1 号柜",
      cab: "浦东 1 号柜",
      outPort: 5,
    },
  ];

  /** @type {Array<object>} */
  let OFF_ORDERS = [];

  function searchUsers(kw) {
    const q = String(kw || "")
      .trim()
      .toLowerCase();
    if (!q) return USERS.slice();
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.heldSn && u.heldSn.includes(q))
    );
  }

  function userById(id) {
    return USERS.find((u) => u.id === id) || null;
  }

  function batteryInfo(sn) {
    return BATTERIES[sn] || null;
  }

  function validateRecycle(sn, user) {
    const b = BATTERIES[sn];
    if (!b) return { ok: false, msg: "电池编码不存在（体系外不可回收）" };
    if (!user.heldSn || user.heldSn !== sn)
      return { ok: false, msg: "与用户当前持电不一致" };
    return { ok: true };
  }

  function validateBind(sn, user) {
    const b = BATTERIES[sn];
    if (!b) return { ok: false, msg: "电池编码不存在" };
    if (b.boundUserPhone && b.boundUserPhone !== user.phone)
      return { ok: false, msg: "电池已绑定其他用户" };
    if (b.inCabinet) return { ok: false, msg: "电池仍在柜内，请走远程出电或柜机流程" };
    return { ok: true };
  }

  function doRecycle(sn, user, operatorName) {
    const v = validateRecycle(sn, user);
    if (!v.ok) return v;
    delete BATTERIES[sn].boundUserPhone;
    user.heldSn = null;
    user.waitPickup = true;
    return {
      ok: true,
      log: {
        type: "recycle",
        sn,
        operatorName,
        at: new Date().toISOString(),
        label: "运营商回收",
      },
    };
  }

  function doBind(sn, user, operatorName) {
    const v = validateBind(sn, user);
    if (!v.ok) return v;
    if (!BATTERIES[sn]) BATTERIES[sn] = { sn };
    BATTERIES[sn].boundUserPhone = user.phone;
    user.heldSn = sn;
    user.waitPickup = false;
    return {
      ok: true,
      log: {
        type: "bind",
        sn,
        operatorName,
        at: new Date().toISOString(),
        label: "绑定用户",
      },
    };
  }

  function createOffOrder(typeKey, user, operatorName, steps, extra) {
    const type = ORDER_TYPES[typeKey];
    const row = {
      id: "OC-" + Date.now(),
      orderType: type.label,
      orderTypeKey: typeKey,
      userName: user.name,
      phone: user.phone,
      operatorName,
      createdAt: formatLocal(),
      steps: steps.slice(),
      extra: extra || {},
    };
    OFF_ORDERS.unshift(row);
    return row;
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

  function latestCabinetSwap(userId) {
    return CABINET_SWAPS.filter((s) => s.userId === userId).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    )[0];
  }

  function refreshSwapTimeout(sw) {
    if (!sw || sw.status !== "in_progress") return sw;
    if (Date.now() > sw.outboundDeadlineMs) sw.status = "outbound_timeout";
    return sw;
  }

  function listRemoteSlots(sw) {
    if (!sw || !sw.cabinetId) return [];
    const rows = [];
    Object.keys(BATTERIES).forEach((sn) => {
      const b = BATTERIES[sn];
      const ic = b && b.inCabinet;
      if (!ic || ic.cabinetId !== sw.cabinetId) return;
      rows.push({
        port: ic.port,
        sn,
        soc: typeof ic.soc === "number" ? ic.soc : null,
        door: ic.door || "—",
        siteName: ic.siteName || sw.siteName,
        cabinetName: ic.cabinetName || sw.cabinetName,
      });
    });
    return rows.sort((a, b) => a.port - b.port);
  }

  function defaultRemoteSlot(sw, slots) {
    if (!slots.length) return null;
    const bySn = slots.find((s) => s.sn === sw.outboundSn);
    if (bySn) return bySn;
    const byPort = slots.find((s) => s.port === sw.outPort);
    if (byPort) return byPort;
    return slots[0];
  }

  function remoteEligibility(sw) {
    refreshSwapTimeout(sw);
    if (!sw) return { ok: false, msg: "无换电记录" };
    const tags = [];
    if (sw.r1) tags.push("R1·已还入未取新");
    if (sw.r2) tags.push("R2·出电失败仍在柜");
    if (!tags.length) return { ok: false, msg: "不满足远程出电条件" };
    const slots = listRemoteSlots(sw);
    if (!slots.length) return { ok: false, msg: "该柜暂无带电格口，无法远程出电" };
    return { ok: true, tags, swap: sw, slots };
  }

  function remoteOpenPort(sw, port, sn, user, operatorName) {
    const b = BATTERIES[sn];
    const ic = b && b.inCabinet;
    if (!ic || ic.cabinetId !== sw.cabinetId || ic.port !== port)
      return { ok: false, msg: "所选格口无可用电池" };
    const siteName = sw.siteName || ic.siteName || "—";
    const cabinetName = sw.cabinetName || ic.cabinetName || sw.cab || "—";
    delete BATTERIES[sn].inCabinet;
    BATTERIES[sn].boundUserPhone = user.phone;
    user.heldSn = sn;
    user.waitPickup = false;
    sw.status = "completed";
    return {
      ok: true,
      log: {
        type: "remote_open",
        sn,
        port,
        siteName,
        cabinetName,
        operatorName,
        at: new Date().toISOString(),
        label: `远程出电 · ${siteName} · ${cabinetName} · ${port}号`,
      },
    };
  }

  function simulateUserConfirm(sn) {
    return {
      type: "user_confirm",
      sn,
      at: new Date().toISOString(),
      label: "用户小程序确认领取",
    };
  }

  function render(state, ctx) {
    const { escapeHtml, escapeAttr, session } = ctx;
    const oc = state.offCab || {};
    const view = oc.view || "search";
    const operatorName =
      (session && (session.account.operatorName || session.roleLabel)) || "运营商";

    if (view === "result" && oc.lastOrder) {
      const o = oc.lastOrder;
      const steps = o.steps
        .map(
          (s) =>
            `<li><strong>${escapeHtml(s.label)}</strong> · ${escapeHtml(s.sn || "")} · ${escapeHtml(
              s.operatorName || o.operatorName
            )}${s.userConfirm ? " · 用户已确认" : ""}</li>`
        )
        .join("");
      return `
        <div class="sites-page ops-page">
          <div class="sites-header">
            <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
            <h1>作业完成</h1>
            <div class="sites-header-spacer"></div>
          </div>
          <article class="sites-card offcab-result">
            <div class="sites-card-hd"><strong>${escapeHtml(o.orderType)}</strong></div>
            <div class="sites-card-rows">
              <div><span>单号</span><em>${escapeHtml(o.id)}</em></div>
              <div><span>时间</span><em>${escapeHtml(o.createdAt)}</em></div>
              <div><span>操作人</span><em>${escapeHtml(o.operatorName)}</em></div>
            </div>
            <ul class="offcab-steps">${steps}</ul>
          </article>
          <button type="button" class="btn-primary offcab-btn" data-action="offcab-back-search">返回搜索</button>
        </div>`;
    }

    if (view === "flow" && oc.userId && oc.flowType) {
      return renderFlow(state, ctx, operatorName);
    }

    if (view === "remote" && oc.userId) {
      return renderRemote(state, ctx, operatorName);
    }

    const kw = oc.kw || "";
    const list = searchUsers(kw);
    const cards = list
      .map((u) => {
        const held = u.heldSn
          ? `持电 ${escapeHtml(u.heldSn)}`
          : u.waitPickup
            ? '<em class="brand">待领取电池</em>'
            : "无持电";
        const actions = [];
        const hasSwap = !!latestCabinetSwap(u.id);
        if (u.heldSn) {
          actions.push(
            `<button type="button" data-action="offcab-start" data-flow="off_swap" data-uid="${escapeAttr(
              u.id
            )}">柜外换电</button>`,
            `<button type="button" data-action="offcab-start" data-flow="off_return" data-uid="${escapeAttr(
              u.id
            )}">柜外退电</button>`
          );
        } else if (u.packageOk) {
          if (u.waitPickup && !hasSwap) {
            actions.push(
              `<button type="button" class="is-primary" data-action="offcab-start" data-flow="off_pickup" data-uid="${escapeAttr(
                u.id
              )}">柜外领电</button>`
            );
          } else if (hasSwap) {
            actions.push(
              `<button type="button" data-action="offcab-remote" data-uid="${escapeAttr(
                u.id
              )}">远程出电</button>`
            );
            if (!u.waitPickup) {
              actions.push(
                `<button type="button" class="is-primary" data-action="offcab-start" data-flow="off_pickup" data-uid="${escapeAttr(
                  u.id
                )}">柜外领电</button>`
              );
            }
          } else {
            actions.push(
              `<button type="button" class="is-primary" data-action="offcab-start" data-flow="off_pickup" data-uid="${escapeAttr(
                u.id
              )}">柜外领电</button>`
            );
          }
        }
        return `<article class="sites-card">
          <div class="sites-card-hd">
            <div>
              <strong>${escapeHtml(u.name)}</strong>
              <div class="sites-meta">${escapeHtml(u.phone)}</div>
            </div>
          </div>
          <div class="sites-card-rows">
            <div><span>套餐</span><em>${escapeHtml(u.packageLabel)}</em></div>
            <div><span>电池</span><em>${held}</em></div>
          </div>
          <div class="offcab-actions">${actions.join("")}</div>
        </article>`;
      })
      .join("");

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="back-workbench" aria-label="返回">‹</button>
          <h1>柜外电池作业</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">待领取且无柜机换电记录 → 仅柜外领电。有换电记录可走远程出电（R1/R2）。持电用户仅柜外退/换电。</p>
        <div class="sites-filters">
          <div class="sites-search-row">
            <input type="search" class="offcab-kw" data-action="offcab-kw-input" placeholder="手机号 / 姓名" value="${escapeAttr(
              kw
            )}" />
            <button type="button" class="sites-confirm" data-action="offcab-kw-apply">确定</button>
          </div>
        </div>
        <div class="sites-list">${cards || `<div class="empty-inline compact">无匹配用户</div>`}</div>
      </div>`;
  }

  function renderSnInput(stepKey, oc, escapeAttr) {
    const v = (oc.draftSn && oc.draftSn[stepKey]) || "";
    return `<div class="offcab-sn-row">
      <input type="text" class="offcab-sn" data-action="offcab-sn" data-step="${escapeAttr(
        stepKey
      )}" placeholder="扫码或手动输入电池编码" value="${escapeAttr(v)}" />
    </div>`;
  }

  function renderFlow(state, ctx, operatorName) {
    const { escapeHtml, escapeAttr } = ctx;
    const oc = state.offCab;
    const user = userById(oc.userId);
    if (!user) return `<div class="empty-full">用户不存在</div>`;
    const type = ORDER_TYPES[oc.flowType];
    const steps = oc.flowSteps || [];
    const stepLog = steps
      .map((s) => `<li>${escapeHtml(s.label)} · ${escapeHtml(s.sn)}</li>`)
      .join("");

    let body = "";
    if (oc.flowType === "off_return") {
      body = `<section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>A · 回收原电池</strong></div>
        ${renderSnInput("recycle", oc, escapeAttr)}
        <button type="button" class="btn-primary offcab-btn" data-action="offcab-recycle-only">确认回收</button>
      </section>`;
    } else if (oc.flowType === "off_pickup") {
      body = `<section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>A · 绑定电池</strong></div>
        ${renderSnInput("bind", oc, escapeAttr)}
        <button type="button" class="btn-primary offcab-btn" data-action="offcab-bind">确认绑定</button>
        <button type="button" class="btn-secondary offcab-btn" data-action="offcab-user-confirm" data-step="bind">模拟用户扫码确认</button>
      </section>`;
    } else if (oc.flowType === "off_swap") {
      body = `<section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>A · 回收原电池</strong></div>
        ${renderSnInput("recycle", oc, escapeAttr)}
        <button type="button" class="btn-secondary offcab-btn" data-action="offcab-recycle-step">确认回收（可稍后再领）</button>
      </section>
      <section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>B · 绑定新电池</strong></div>
        ${renderSnInput("bind", oc, escapeAttr)}
        <button type="button" class="btn-primary offcab-btn" data-action="offcab-bind" ${user.waitPickup && !oc.recycledThisSession ? " disabled" : ""}>确认绑定新电</button>
        <button type="button" class="btn-secondary offcab-btn" data-action="offcab-user-confirm" data-step="bind">模拟用户扫码确认</button>
      </section>`;
    }

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
          <h1>${escapeHtml(type.label)}</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">${escapeHtml(user.name)} · ${escapeHtml(user.packageLabel)} · ${
          user.heldSn ? "持电 " + escapeHtml(user.heldSn) : "待领取/无持电"
        }</p>
        ${body}
        ${stepLog ? `<ul class="offcab-steps">${stepLog}</ul>` : ""}
        <button type="button" class="btn-secondary offcab-btn" data-action="offcab-finish-flow">完成并生成订单</button>
      </div>`;
  }

  function renderRemote(state, ctx, operatorName) {
    const { escapeHtml, escapeAttr } = ctx;
    const oc = state.offCab;
    const user = userById(oc.userId);
    const sw = latestCabinetSwap(user.id);
    refreshSwapTimeout(sw);
    const el = remoteEligibility(sw);

    if (!el.ok) {
      return `
        <div class="sites-page ops-page">
          <div class="sites-header">
            <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
            <h1>远程出电</h1>
            <div class="sites-header-spacer"></div>
          </div>
          <div class="empty-inline compact">${escapeHtml(el.msg)}</div>
        </div>`;
    }

    const tags = el.tags.map((t) => `<span class="offcab-tag">${escapeHtml(t)}</span>`).join("");
    const statusLabel = SWAP_STATUS[sw.status] || sw.status;
    const remainMin = Math.max(0, Math.round((sw.outboundDeadlineMs - Date.now()) / 60000));
    const slots = el.slots || [];
    const fallback = defaultRemoteSlot(sw, slots);
    const selectedSn = oc.remoteSn || (fallback && fallback.sn) || "";

    const slotCards = slots
      .map((s) => {
        const selected = s.sn === selectedSn;
        const isOutbound = s.sn === sw.outboundSn;
        const socLabel = s.soc != null ? `${s.soc}%` : "—";
        return `<button type="button" class="offcab-slot${selected ? " is-selected" : ""}" data-action="offcab-select-slot" data-port="${s.port}" data-sn="${escapeAttr(
          s.sn
        )}">
          <span class="offcab-slot-port">${s.port} 号</span>
          <span class="offcab-slot-soc">SOC ${escapeHtml(socLabel)}</span>
          <span class="offcab-slot-sn">${escapeHtml(s.sn)}</span>
          ${isOutbound ? `<span class="offcab-slot-tag">换出电</span>` : ""}
        </button>`;
      })
      .join("");

    const selectedSlot = slots.find((s) => s.sn === selectedSn);

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
          <h1>远程出电</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">${escapeHtml(user.name)} · 最近换电 ${escapeHtml(sw.orderNo)} · <strong>${escapeHtml(
          statusLabel
        )}</strong>${sw.status === "in_progress" ? ` · 出电限时约 ${remainMin} 分钟` : ""}</p>
        <div class="offcab-tags">${tags}</div>
        <section class="devstat-sec offcab-remote-cab">
          <div class="devstat-hd"><strong>柜机</strong></div>
          <div class="sites-card-rows inline">
            <div><span>站点</span><em>${escapeHtml(sw.siteName || "—")}</em></div>
            <div><span>柜机名称</span><em>${escapeHtml(sw.cabinetName || sw.cab || "—")}</em></div>
            <div><span>换出编码</span><em>${escapeHtml(sw.outboundSn)}</em></div>
            <div><span>还入记录</span><em>${sw.returnRecorded ? "有（R1）" : "无（R2）"}</em></div>
          </div>
        </section>
        <section class="devstat-sec offcab-sec">
          <div class="devstat-hd"><strong>C · 选择格口并远程出电</strong></div>
          <p class="ops-hint">仅展示<strong>有电池</strong>的格口；请选择后远程开门并绑给用户。</p>
          <div class="offcab-slot-list">${slotCards}</div>
          ${
            selectedSlot
              ? `<p class="offcab-slot-pick">已选 ${selectedSlot.port} 号 · SOC ${
                  selectedSlot.soc != null ? selectedSlot.soc + "%" : "—"
                } · ${escapeHtml(selectedSlot.sn)}</p>`
              : ""
          }
          <button type="button" class="btn-primary offcab-btn" data-action="offcab-remote-open" ${
            selectedSn ? "" : "disabled"
          }>远程开门 · 绑给用户</button>
          <button type="button" class="btn-secondary offcab-btn" data-action="offcab-user-confirm" data-step="remote">模拟用户扫码确认</button>
        </section>
      </div>`;
  }

  global.OperatorAppOffCabinet = {
    ORDER_TYPES,
    SWAP_STATUS,
    searchUsers,
    userById,
    batteryInfo,
    validateRecycle,
    validateBind,
    doRecycle,
    doBind,
    createOffOrder,
    latestCabinetSwap,
    listRemoteSlots,
    defaultRemoteSlot,
    remoteEligibility,
    remoteOpenPort,
    simulateUserConfirm,
    getOffOrders: () => OFF_ORDERS.slice(),
    getCabinetSwaps: () => CABINET_SWAPS.slice(),
    render,
  };
})(window);
