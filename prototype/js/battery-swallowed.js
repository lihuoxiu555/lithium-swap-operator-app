/**
 * 电池被吞 · 柜内还电成功但出电未取 / 弹仓失败等（Mock）
 */
(function (global) {
  /** @type {Array<object>} */
  let INCIDENTS = [
    {
      id: "SW-260908001",
      siteName: "浦东骑手驿站",
      cabinetName: "浦东 1 号柜",
      cabinetSn: "CAB-22018",
      port: 3,
      batterySn: "492399990001",
      swapOrderId: "SW20261108001",
      userName: "李骑手",
      phone: "13700002222",
      status: "pending",
      reason: "还电成功 · 出电未取（换电超时）",
      reportedAt: "2026-11-08 14:32",
    },
    {
      id: "SW-260907002",
      siteName: "世博换电服务点",
      cabinetName: "世博 1 号柜",
      cabinetSn: "CAB-22021",
      port: 5,
      batterySn: "035211128027",
      swapOrderId: "SW20261107018",
      userName: "赵阳",
      phone: "13900002222",
      status: "processing",
      reason: "弹仓失败 · 电池仍在柜",
      reportedAt: "2026-11-07 09:15",
    },
    {
      id: "SW-260905003",
      siteName: "浦东骑手驿站",
      cabinetName: "浦东 2 号柜",
      cabinetSn: "CAB-22019",
      port: 8,
      batterySn: "492391002233",
      swapOrderId: "SW20261105006",
      userName: "王骑手",
      phone: "13800138001",
      status: "resolved",
      reason: "开仓取回已完成",
      reportedAt: "2026-11-05 18:40",
      resolvedAt: "2026-11-05 19:02",
    },
  ];

  const STATUS_LABEL = {
    pending: "待处理",
    processing: "处理中",
    resolved: "已取回",
  };

  function defaultState() {
    return { kw: "", tab: "pending", view: "list", incidentId: null };
  }

  function filterList(kw, tab) {
    const q = String(kw || "")
      .trim()
      .toLowerCase();
    return INCIDENTS.filter((row) => {
      if (tab === "pending" && row.status !== "pending" && row.status !== "processing") return false;
      if (tab === "done" && row.status !== "resolved") return false;
      if (!q) return true;
      const hay = [
        row.id,
        row.siteName,
        row.cabinetName,
        row.cabinetSn,
        row.batterySn,
        row.swapOrderId,
        row.userName,
        row.phone,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function byId(id) {
    return INCIDENTS.find((r) => r.id === id) || null;
  }

  function render(state, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const st = state.batterySwallow || defaultState();
    if (st.view === "detail" && st.incidentId) {
      const row = byId(st.incidentId);
      if (!row) {
        return listPage(st, ctx);
      }
      const stat = STATUS_LABEL[row.status] || row.status;
      return `
        <div class="sites-page ops-page swallow-page">
          <div class="sites-header">
            <button type="button" class="sites-back" data-action="swallow-back-list" aria-label="返回">‹</button>
            <h1>被吞详情</h1>
            <div class="sites-header-spacer"></div>
          </div>
          <article class="sites-card">
            <div class="sites-card-hd">
              <strong>${escapeHtml(row.cabinetName)} · ${row.port}号格口</strong>
              <span class="sites-tag${row.status === "pending" ? " warn" : ""}">${escapeHtml(stat)}</span>
            </div>
            <div class="sites-card-rows">
              <div><span>工单</span><em>${escapeHtml(row.id)}</em></div>
              <div><span>站点</span><em>${escapeHtml(row.siteName)}</em></div>
              <div><span>柜机 SN</span><em>${escapeHtml(row.cabinetSn)}</em></div>
              <div><span>电池 SN</span><em>${escapeHtml(row.batterySn)}</em></div>
              <div><span>关联换电单</span><em>${escapeHtml(row.swapOrderId)}</em></div>
              <div><span>用户</span><em>${escapeHtml(row.userName)} ${escapeHtml(row.phone)}</em></div>
              <div><span>原因</span><em>${escapeHtml(row.reason)}</em></div>
              <div><span>上报时间</span><em>${escapeHtml(row.reportedAt)}</em></div>
              ${
                row.resolvedAt
                  ? `<div><span>取回时间</span><em>${escapeHtml(row.resolvedAt)}</em></div>`
                  : ""
              }
            </div>
          </article>
          ${
            row.status !== "resolved"
              ? `<div class="swallow-actions">
              <button type="button" class="btn-primary" data-action="swallow-open-door" data-id="${escapeAttr(
                row.id
              )}">开仓取电</button>
              <button type="button" class="btn-secondary" data-action="swallow-mark-done" data-id="${escapeAttr(
                row.id
              )}">标记已取回</button>
            </div>`
              : ""
          }
        </div>`;
    }
    return listPage(st, ctx);
  }

  function listPage(st, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const tabs = [
      { id: "pending", label: "待处理" },
      { id: "done", label: "已取回" },
    ]
      .map((t) => {
        const on = st.tab === t.id ? " active" : "";
        return `<button type="button" class="sites-tab${on}" data-action="swallow-tab" data-tab="${escapeAttr(
          t.id
        )}">${escapeHtml(t.label)}</button>`;
      })
      .join("");
    const list = filterList(st.kw, st.tab);
    const cards = list.length
      ? list
          .map((row) => {
            const stat = STATUS_LABEL[row.status] || row.status;
            return `<article class="sites-card swallow-card">
              <button type="button" class="swallow-card-hit" data-action="swallow-detail" data-id="${escapeAttr(
                row.id
              )}">
                <div class="sites-card-hd">
                  <strong>${escapeHtml(row.cabinetName)} · ${row.port}号</strong>
                  <span class="sites-tag${row.status === "pending" ? " warn" : ""}">${escapeHtml(stat)}</span>
                </div>
                <div class="sites-card-rows compact">
                  <div><span>站点</span><em>${escapeHtml(row.siteName)}</em></div>
                  <div><span>电池</span><em>${escapeHtml(row.batterySn)}</em></div>
                  <div><span>原因</span><em>${escapeHtml(row.reason)}</em></div>
                  <div><span>上报</span><em>${escapeHtml(row.reportedAt)}</em></div>
                </div>
              </button>
            </article>`;
          })
          .join("")
      : `<div class="empty-full"><div class="icon">📥</div>暂无被吞记录</div>`;

    return `
      <div class="sites-page ops-page swallow-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="back-workbench" aria-label="返回">‹</button>
          <h1>电池被吞</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">还电成功但新电池未取、或弹仓失败导致电池滞留柜内。Mock 数据。</p>
        <div class="sites-search-row">
          <input id="swallow-kw" type="search" placeholder="站点 / 柜机 / 电池 SN / 换电单号" value="${escapeAttr(
            st.kw || ""
          )}" />
          <button type="button" class="sites-search-btn" data-action="swallow-search">查询</button>
        </div>
        <div class="alert-tabs swallow-tabs">${tabs}</div>
        <div class="swallow-list">${cards}</div>
      </div>`;
  }

  function openDoor(id) {
    const row = byId(id);
    if (!row || row.status === "resolved") return { ok: false, msg: "无法操作" };
    row.status = "processing";
    return { ok: true, msg: `已向 ${row.cabinetName} ${row.port}号格口下发开仓指令（Mock）` };
  }

  function markResolved(id) {
    const row = byId(id);
    if (!row) return { ok: false, msg: "工单不存在" };
    row.status = "resolved";
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    row.resolvedAt = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
      d.getMinutes()
    )}`;
    return { ok: true, msg: "已标记取回" };
  }

  global.OperatorAppBatterySwallowed = {
    defaultState,
    render,
    openDoor,
    markResolved,
    getIncidents: () => INCIDENTS.slice(),
  };
})(window);
