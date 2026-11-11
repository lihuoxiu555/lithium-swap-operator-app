/**
 * 其他 · 员工管理（对齐 原型-外卖 · 运营商员工 + 区域=业务城市）
 */
(function (global) {
  function bizCities() {
    const Scope = global.OperatorAppOperatorScope;
    if (Scope && Scope.listBizCities) return Scope.listBizCities();
    return ["上海", "杭州", "溧阳", "苏州"];
  }

  const PERMISSIONS = [
    { id: "orders.view", label: "订单查看" },
    { id: "refunds.view", label: "退款查看" },
    { id: "refunds.audit", label: "退款确认" },
    { id: "sites.view", label: "站点查看" },
    { id: "sites.edit", label: "站点编辑" },
    { id: "devices.view", label: "设备查看" },
    { id: "devices.edit", label: "设备运维" },
    { id: "users.view", label: "骑手用户" },
    { id: "flows.view", label: "流水查看" },
    { id: "accounts.view", label: "收款账户" },
    { id: "channel_sales.view", label: "渠道管理" },
    { id: "employees.view", label: "员工查看" },
    { id: "employees.edit", label: "员工编辑" },
  ];

  const STORE = [
    {
      id: "EMP-LY-01",
      name: "赵溧阳",
      phone: "13700002001",
      jobTitle: "城市运营",
      status: "启用",
      regionScope: "cities",
      regionCities: ["溧阳"],
      permissions: ["orders.view", "sites.view", "devices.view", "devices.edit", "users.view"],
      lastLoginAt: "2026-11-08 09:12",
    },
    {
      id: "EMP-SH-02",
      name: "周浦东",
      phone: "13700002002",
      jobTitle: "站点运维",
      status: "启用",
      regionScope: "cities",
      regionCities: ["上海"],
      permissions: ["orders.view", "sites.view", "devices.view", "devices.edit"],
      lastLoginAt: "2026-11-09 18:40",
    },
    {
      id: "EMP-ALL-03",
      name: "钱总部",
      phone: "13700002003",
      jobTitle: "运营主管",
      status: "启用",
      regionScope: "all",
      regionCities: [],
      permissions: [
        "orders.view",
        "refunds.view",
        "refunds.audit",
        "sites.view",
        "devices.view",
        "users.view",
        "channel_sales.view",
        "employees.view",
      ],
      lastLoginAt: "2026-11-10 08:05",
    },
    {
      id: "EMP-HZ-04",
      name: "吴杭州",
      phone: "13700002004",
      jobTitle: "财务助理",
      status: "停用",
      regionScope: "cities",
      regionCities: ["杭州", "苏州"],
      permissions: ["flows.view", "accounts.view", "orders.view", "refunds.view"],
      lastLoginAt: "—",
    },
  ];

  function defaultState() {
    return { view: "list", kw: "", cityFilter: "全部", editId: null };
  }

  function regionLabel(row) {
    if (!row || row.regionScope === "all") return "全网";
    const c = row.regionCities || [];
    return c.length ? c.join("、") : "未配置";
  }

  function permSummary(ids) {
    const list = ids || [];
    const labels = list
      .slice(0, 3)
      .map((id) => PERMISSIONS.find((p) => p.id === id)?.label || id);
    return labels.join("、") + (list.length > 3 ? "…" : "");
  }

  function filterList(kw, cityFilter) {
    const k = (kw || "").trim().toLowerCase();
    return STORE.filter((e) => {
      if (cityFilter && cityFilter !== "全部") {
        if (e.regionScope === "all") {
          if (cityFilter !== "全网") return false;
        } else if (!(e.regionCities || []).includes(cityFilter)) return false;
      }
      if (!k) return true;
      return (
        (e.name && e.name.toLowerCase().includes(k)) ||
        (e.phone && e.phone.includes(k)) ||
        (e.jobTitle && e.jobTitle.includes(k))
      );
    });
  }

  function getById(id) {
    return STORE.find((e) => e.id === id) || null;
  }

  function validateForm(payload) {
    if (!(payload.name || "").trim()) return "请输入姓名";
    const phone = (payload.phone || "").trim();
    if (!/^\d{11}$/.test(phone)) return "请输入 11 位手机号";
    const dup = STORE.some((e) => e.id !== payload.id && e.phone === phone);
    if (dup) return "该手机号已存在";
    if (payload.regionScope === "cities" && !(payload.regionCities || []).length) {
      return "请至少选择一个业务城市";
    }
    if (!(payload.permissions || []).length) return "请至少选择一项功能权限";
    return "";
  }

  function saveRow(payload) {
    const err = validateForm(payload);
    if (err) return err;
    const row = {
      id: payload.id || "EMP-" + Date.now().toString().slice(-6),
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      jobTitle: (payload.jobTitle || "").trim() || "运营员工",
      status: payload.status === "停用" ? "停用" : "启用",
      regionScope: payload.regionScope === "cities" ? "cities" : "all",
      regionCities:
        payload.regionScope === "cities" ? [...(payload.regionCities || [])] : [],
      permissions: [...(payload.permissions || [])],
      lastLoginAt: payload.lastLoginAt || "尚未登录",
    };
    const idx = STORE.findIndex((e) => e.id === row.id);
    if (idx >= 0) STORE[idx] = { ...STORE[idx], ...row };
    else STORE.unshift(row);
    return "";
  }

  function renderList(state, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const list = filterList(state.employees.kw, state.employees.cityFilter);
  const cityOpts = bizCities().map(
      (c) =>
        `<option value="${escapeAttr(c)}" ${
          state.employees.cityFilter === c ? "selected" : ""
        }>${escapeHtml(c)}</option>`
    ).join("");
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">👥</div>暂无员工</div>`
        : list
            .map((e) => {
              const off = e.status === "停用";
              return `<article class="user-card emp-card">
          <div class="user-id">
            <strong>${escapeHtml(e.name)}</strong>
            <em class="user-tag ${off ? "" : "ok"}">${escapeHtml(e.status)}</em>
          </div>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">手机号</span><span class="lv">${escapeHtml(
              e.phone
            )}</span></div>
            <div class="lease-row"><span class="lk">岗位</span><span class="lv">${escapeHtml(
              e.jobTitle
            )}</span></div>
            <div class="lease-row"><span class="lk">区域</span><span class="lv"><em class="user-tag ok">${escapeHtml(
              regionLabel(e)
            )}</em></span></div>
            <div class="lease-row"><span class="lk">权限</span><span class="lv"><small>${escapeHtml(
              permSummary(e.permissions)
            )}</small></span></div>
            <div class="lease-row"><span class="lk">最近登录</span><span class="lv">${escapeHtml(
              e.lastLoginAt || "—"
            )}</span></div>
          </div>
          <button type="button" class="btn-secondary emp-edit-btn" data-action="employee-edit" data-id="${escapeAttr(
            e.id
          )}">编辑</button>
        </article>`;
            })
            .join("");
    return `
      <div class="sites-page">
        ${ctx.opsHeader("员工管理")}
        <p class="sites-hint">对齐 PC · 运营商员工；<strong>区域</strong>为业务城市，控制员工数据与待办可见范围（演示）。</p>
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="emp-kw" type="search" value="${escapeAttr(
              state.employees.kw
            )}" placeholder="姓名 / 手机号 / 岗位" />
            <button type="button" class="sites-confirm" data-action="emp-search">确定</button>
          </div>
          <label class="emp-city-filter">区域筛选
            <select id="emp-city-filter" data-action="emp-city-filter">
              <option value="全部">全部</option>
              <option value="全网" ${state.employees.cityFilter === "全网" ? "selected" : ""}>全网</option>
              ${cityOpts}
            </select>
          </label>
        </div>
        <button type="button" class="btn-primary emp-add-top" data-action="employee-add">新增员工</button>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function renderForm(state, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const isNew = !state.employees.editId;
    const row = isNew
      ? {
          name: "",
          phone: "",
          jobTitle: "",
          status: "启用",
          regionScope: "cities",
          regionCities: ["上海"],
          permissions: ["orders.view", "sites.view", "devices.view"],
        }
      : getById(state.employees.editId);
    if (!row) return `<div class="empty-full">员工不存在</div>`;
    const scopeAll = row.regionScope !== "cities";
    const permHtml = PERMISSIONS.map(
      (p) => `<label class="emp-perm-item">
          <input type="checkbox" name="emp-perm" value="${escapeAttr(p.id)}" ${
        (row.permissions || []).includes(p.id) ? "checked" : ""
      } />
          <span>${escapeHtml(p.label)}</span>
        </label>`
    ).join("");
    const cityChecks = bizCities().map(
      (c) => `<label class="emp-city-chip">
          <input type="checkbox" name="emp-city" value="${escapeAttr(c)}" ${
        (row.regionCities || []).includes(c) ? "checked" : ""
      } ${scopeAll ? "disabled" : ""} />
          <span>${escapeHtml(c)}</span>
        </label>`
    ).join("");
    return `
      <div class="sites-page sites-page-form emp-form-page">
        <header class="page-header">
          <button type="button" class="icon-back" data-action="employee-back" aria-label="返回">‹</button>
          <h1>${isNew ? "新增员工" : "编辑员工"}</h1>
          <span class="header-spacer"></span>
        </header>
        <div class="sites-form emp-form-block">
          <label class="fin-field">姓名<span class="req">*</span>
            <input id="emp-name" type="text" value="${escapeAttr(row.name)}" maxlength="20" placeholder="真实姓名" />
          </label>
          <label class="fin-field">手机号<span class="req">*</span>
            <input id="emp-phone" type="tel" inputmode="numeric" maxlength="11" value="${escapeAttr(
              row.phone
            )}" placeholder="登录账号" />
          </label>
          <label class="fin-field">岗位
            <input id="emp-job" type="text" value="${escapeAttr(row.jobTitle)}" placeholder="如：站点运维" />
          </label>
          <fieldset class="emp-fieldset">
            <legend>区域 · 业务城市<span class="req">*</span></legend>
            <p class="sites-hint">员工仅处理所选城市范围内站点/订单/待办（与 PC 员工管理扩展字段一致）。</p>
            <div class="emp-scope-row">
              <label><input type="radio" name="emp-region-scope" value="all" ${
                scopeAll ? "checked" : ""
              } data-action="emp-scope-sync" /> 全网</label>
              <label><input type="radio" name="emp-region-scope" value="cities" ${
                !scopeAll ? "checked" : ""
              } data-action="emp-scope-sync" /> 指定城市</label>
            </div>
            <div class="emp-city-pick ${scopeAll ? "disabled" : ""}" id="emp-city-pick">${cityChecks}</div>
          </fieldset>
          <label class="fin-field">状态
            <select id="emp-status">
              <option ${row.status !== "停用" ? "selected" : ""}>启用</option>
              <option ${row.status === "停用" ? "selected" : ""}>停用</option>
            </select>
          </label>
          <fieldset class="emp-fieldset">
            <legend>功能权限<span class="req">*</span></legend>
            <div class="emp-perm-grid">${permHtml}</div>
          </fieldset>
        </div>
        <div class="lease-footer-bar">
          <button type="button" class="btn-primary" data-action="employee-save" data-id="${escapeAttr(
            row.id || ""
          )}">保存</button>
        </motion>
      </div>`;
  }

  function render(state, ctx) {
    if (state.employees.view === "form") return renderForm(state, ctx);
    return renderList(state, ctx);
  }

  function readFormFromDom(existingId) {
    const name = document.getElementById("emp-name")?.value || "";
    const phone = document.getElementById("emp-phone")?.value || "";
    const jobTitle = document.getElementById("emp-job")?.value || "";
    const status = document.getElementById("emp-status")?.value || "启用";
    const scope =
      document.querySelector('input[name="emp-region-scope"]:checked')?.value || "cities";
    const regionCities = Array.from(
      document.querySelectorAll('input[name="emp-city"]:checked')
    ).map((el) => el.value);
    const permissions = Array.from(
      document.querySelectorAll('input[name="emp-perm"]:checked')
    ).map((el) => el.value);
    const ex = existingId ? getById(existingId) : null;
    return {
      id: existingId || "",
      name,
      phone,
      jobTitle,
      status,
      regionScope: scope,
      regionCities,
      permissions,
      lastLoginAt: ex?.lastLoginAt,
    };
  }

  function syncScopeUi() {
    const scope =
      document.querySelector('input[name="emp-region-scope"]:checked')?.value || "cities";
    const pick = document.getElementById("emp-city-pick");
    if (!pick) return;
    const all = scope === "all";
    pick.classList.toggle("disabled", all);
    pick.querySelectorAll('input[name="emp-city"]').forEach((inp) => {
      inp.disabled = all;
      if (all) inp.checked = false;
    });
  }

  global.OperatorAppEmployees = {
    bizCities,
    PERMISSIONS,
    STORE,
    defaultState,
    regionLabel,
    filterList,
    getById,
    saveRow,
    render,
    readFormFromDom,
    syncScopeUi,
  };
})(window);
