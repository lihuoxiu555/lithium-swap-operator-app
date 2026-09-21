/**
 * 运营商 APP 框架 · 可交互原型
 */
(function () {
  const { MODULE_REGISTRY, getModuleById, modulesForRole, groupModules } =
    window.OperatorAppModules;
  const { findAccount, SYSTEM_MESSAGES } = window.OperatorAppMock;
  const Lease = window.OperatorAppLease;
  const PackageOrders = window.OperatorAppPackageOrders;
  const Daypool = window.OperatorAppDaypool;
  const OpsStats = window.OperatorAppOpsStats;
  const Cabinets = window.OperatorAppCabinets;
  const Sites = window.OperatorAppSites;
  const AppUsers = window.OperatorAppUsers;
  const Finance = window.OperatorAppFinance;
  const Todos = window.OperatorAppTodos;
  const Alerts = window.OperatorAppAlerts;
  const Batteries = window.OperatorAppBatteries;

  const SCENARIOS = {
    admin: { label: "管理员已登录", forceEmptyGrid: false, unread: false, loadError: false },
    staff: { label: "员工已登录", forceEmptyGrid: false, unread: false, loadError: false },
    emptyGrid: { label: "空宫格", forceEmptyGrid: true, unread: false, loadError: false },
    unread: { label: "系统消息有未读", forceEmptyGrid: false, unread: true, loadError: false },
    loginFail: { label: "登录失败演示", forceEmptyGrid: false, unread: false, loadError: false },
    weakNet: { label: "弱网/失败", forceEmptyGrid: false, unread: false, loadError: true },
  };

  const state = {
    session: null, // { account, role, roleLabel, dataScope, dataScopeLabel, siteIds? }
    pendingAccount: null,
    screen: "login", // login | pickRole | dataStats | workbench | todosHub | ...
    tab: "dataStats",
    dataStats: {
      subTab: "biz", // biz | asset
    },
    activeScenario: "admin",
    forceEmptyGrid: false,
    loadError: false,
    messages: [],
    selectedMsgId: null,
    msgFrom: "hub", // hub | mine
    placeholderModule: null,
    loginError: "",
    loginPhone: "13800000005",
    loginPassword: "123456",
    agree: true,
    events: [],
    toastTimer: null,
    lease: {
      kind: "personal", // personal | daypool
      menuKey: null,
      tab: "all",
      searchType: "phone",
      keyword: "",
      siteId: "all",
      problemFilter: "all", // all | pending | problem
      searchOpen: false,
      sub: null, // { type, orderId } | null
      listScroll: 0,
      form: {},
      confirmDialog: null, // { orderId } | null
    },
    daypool: {
      tab: "all",
      searchType: "phone",
      keyword: "",
      siteId: "all",
      sub: null,
      listScroll: 0,
      form: {},
      confirmDialog: null,
    },
    sites: {
      status: "all",
      keyword: "",
      view: "list", // list | detail | form
      siteId: null,
      formId: null, // null | id | "new"
      form: {},
      listScroll: 0,
      mapQuery: "",
      mapZoom: 2,
      previewIdx: 0,
      locating: false,
    },
    todos: {
      view: "list", // list | detail
      type: null, // refund | recharge | overdue
      itemId: null,
      rejectOpen: false,
      rejectReason: "",
      refundMode: "manual",
      form: {},
    },
    alerts: {
      view: "list",
      group: "all",
      type: "all",
      itemId: null,
      fromCab: false,
    },
    ops: {
      bizChartMode: "7d",
      bizYear: 2026,
      bizMonth: 9,
      bizTab: "charts",
      cabTab: "all",
      cabKeyword: "",
      cabFilterSite: "all",
      cabView: "list",
      cabId: null,
      cabSite: "",
      cabPortOpen: 0,
      cabDetailTab: "cabinet",
      cabSnapType: "cabinet",
      cabReturn: "detail",
      cabDialog: null,
      cabSwapTab: "all",
      cabSwapKw: "",
      cabSwapId: null,
      listScroll: 0,
    },
    users: {
      kw: "",
      smsKw: "",
      payKw: "",
      payTab: "success",
    },
    packageOrders: {
      tab: "all",
      kw: "",
    },
    battery: {
      sn: null,
      fromScreen: "leaseOrders",
      mapZoom: 2,
    },
    finance: {
      view: "home",
      wdTab: "all",
      wdId: null,
      applyAmount: "",
      settleForm: null,
      settleReturn: "home",
    },
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function track(name, props = {}) {
    const row = {
      time: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
      name,
      props: JSON.stringify(props),
    };
    state.events.unshift(row);
    if (state.events.length > 40) state.events.pop();
    renderEventLog();
  }

  function toast(text) {
    const el = els.toast;
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function copyText(text, okMsg) {
    const val = String(text || "");
    if (!val || val === "—") {
      toast("无可复制内容");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).catch(() => {});
    }
    toast(okMsg || "已复制");
  }

  function unreadCount() {
    return state.messages.filter((m) => !m.read).length;
  }

  function resetMessages(forceUnread) {
    state.messages = SYSTEM_MESSAGES.map((m, i) => ({
      ...m,
      read: forceUnread ? i > 0 : m.read,
    }));
    if (forceUnread && state.messages[0]) state.messages[0].read = false;
  }

  function currentIdentity() {
    return state.session;
  }

  /** 已迁入「数据统计」Tab 的模块，工作台宫格不重复展示 */
  const WORKBENCH_GRID_EXCLUDE = new Set(["biz.stats", "ops.deviceStats"]);

  function visibleModules() {
    if (!state.session) return [];
    return modulesForRole(state.session.role, { forceEmpty: state.forceEmptyGrid }).filter(
      (m) => !WORKBENCH_GRID_EXCLUDE.has(m.id)
    );
  }

  function setHash(hash) {
    if (location.hash === hash) return;
    try {
      history.replaceState(null, "", hash);
    } catch (err) {
      location.hash = hash;
    }
  }

  function parseRoute() {
    const h = location.hash || "#/login";
    const moduleMatch = h.match(/^#\/module\/(.+)$/);
    if (moduleMatch) return { type: "module", id: moduleMatch[1] };
    if (h === "#/login") return { type: "login" };
    if (h === "#/pick-role") return { type: "pickRole" };
    if (h === "#/messages" || h === "#/todos") return { type: "tab", tab: "todos" };
    if (h === "#/mine") return { type: "tab", tab: "mine" };
    if (h === "#/dataStats") return { type: "tab", tab: "dataStats" };
    if (h === "#/workbench") return { type: "tab", tab: "workbench" };
    if (h === "#/") return { type: "tab", tab: "dataStats" };
    if (h === "#/about") return { type: "about" };
    if (h === "#/account") return { type: "account" };
    if (h.startsWith("#/msg/")) return { type: "msg", id: h.slice(6) };
    const todoMatch = h.match(/^#\/todos\/([^/]+)(?:\/([^/]+))?$/);
    if (todoMatch) {
      return { type: "todoList", todoType: todoMatch[1], itemId: todoMatch[2] || null };
    }
    const alertMatch = h.match(/^#\/alerts(?:\/([^/]+))?(?:\/([^/]+))?$/);
    if (alertMatch) {
      return { type: "alertList", group: alertMatch[1] || "all", itemId: alertMatch[2] || null };
    }
    return { type: "unknown" };
  }

  function applyRoute() {
    const route = parseRoute();

    if (!state.session && route.type !== "login" && route.type !== "pickRole") {
      state.screen = "login";
      setHash("#/login");
      render();
      return;
    }

    if (route.type === "login") {
      state.screen = "login";
      render();
      return;
    }

    if (route.type === "unknown") {
      state.tab = "dataStats";
      state.screen = "dataStats";
      setHash("#/dataStats");
      render();
      return;
    }

    if (route.type === "todoList") {
      const role = state.session && state.session.role;
      if (!Todos.canSeeType(role, route.todoType)) {
        state.tab = "todos";
        state.screen = "todosHub";
        setHash("#/todos");
        toast("无待办权限");
        render();
        return;
      }
      state.tab = "todos";
      state.todos.type = route.todoType;
      state.todos.itemId = route.itemId;
      state.todos.view = route.itemId ? "detail" : "list";
      state.screen = "todos";
      render();
      return;
    }

    if (route.type === "alertList") {
      state.tab = "todos";
      state.alerts.group = route.group || "all";
      state.alerts.itemId = route.itemId;
      state.alerts.view = route.itemId ? "detail" : "list";
      state.screen = "alerts";
      render();
      return;
    }

    if (route.type === "pickRole") {
      state.screen = state.pendingAccount ? "pickRole" : "login";
      render();
      return;
    }

    if (route.type === "module") {
      openModule(route.id, false);
      return;
    }

    if (route.type === "msg") {
      state.selectedMsgId = route.id;
      state.screen = "msgDetail";
      state.tab = state.msgFrom === "mine" ? "mine" : "todos";
      render();
      return;
    }

    if (route.type === "about") {
      state.screen = "about";
      state.tab = "mine";
      render();
      return;
    }

    if (route.type === "account") {
      state.screen = "account";
      state.tab = "mine";
      render();
      return;
    }

    if (route.type === "tab") {
      if (route.tab === "todos") {
        state.tab = "todos";
        state.screen = "todosHub";
      } else {
        state.tab = route.tab;
        state.screen = route.tab;
      }
      render();
    }
  }

  function openModule(id, trackClick) {
    if (id === "daypool.orders") {
      const leaseMod = getModuleById("lease.orders");
      if (!leaseMod) {
        toast("模块不存在");
        goTab("workbench");
        return;
      }
      if (!state.session || !leaseMod.roles.includes(state.session.role)) {
        toast("无权限");
        goTab("workbench");
        return;
      }
      if (trackClick) {
        track("module_click", {
          module_id: "lease.orders",
          status: leaseMod.status,
          role: state.session.role,
        });
      }
      state.placeholderModule = leaseMod;
      state.lease.menuKey = null;
      state.daypool.sub = null;
      state.screen = "leaseOrders";
      setHash("#/module/lease.orders");
      track("swap_orders_open", { kind: "unified" });
      render();
      return;
    }
    const mod = getModuleById(id);
    if (!mod) {
      toast("模块不存在");
      goTab("workbench");
      return;
    }
    if (!state.session || !mod.roles.includes(state.session.role)) {
      toast("无权限");
      track("module_click_denied", { module_id: id, role: state.session && state.session.role });
      goTab("workbench");
      return;
    }
    if (trackClick) {
      track("module_click", {
        module_id: id,
        status: mod.status,
        role: state.session.role,
      });
    }
    if (mod.status === "ready" && mod.id === "lease.orders") {
      state.placeholderModule = mod;
      if (trackClick) state.lease.kind = "personal";
      state.lease.menuKey = null;
      state.lease.sub = null;
      state.lease.keyword = "";
      state.lease.siteId = "all";
      state.lease.problemFilter = "all";
      state.daypool.sub = null;
      state.screen = "leaseOrders";
      setHash("#/module/lease.orders");
      track("swap_orders_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "ops.sites") {
      state.placeholderModule = mod;
      state.sites.view = "list";
      state.sites.siteId = null;
      state.sites.formId = null;
      state.screen = "sites";
      setHash(mod.route);
      track("sites_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "biz.stats") {
      state.placeholderModule = mod;
      state.screen = "bizStats";
      setHash(mod.route);
      track("biz_stats_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "ops.deviceStats") {
      state.dataStats.subTab = "asset";
      goTab("dataStats");
      track("device_stats_open", { via: "module_redirect" });
      return;
    }
    if (mod.status === "ready" && mod.id === "biz.packageOrders") {
      state.placeholderModule = mod;
      state.screen = "packageOrders";
      setHash(mod.route);
      track("package_orders_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "ops.cabinets") {
      state.placeholderModule = mod;
      state.ops.cabView = "list";
      state.ops.cabId = null;
      state.screen = "cabinets";
      setHash(mod.route);
      track("cabinets_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "users.list") {
      state.placeholderModule = mod;
      state.screen = "userList";
      setHash(mod.route);
      track("users_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "users.sms") {
      state.placeholderModule = mod;
      state.screen = "userSms";
      setHash(mod.route);
      track("sms_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "users.payments") {
      state.placeholderModule = mod;
      state.screen = "userPay";
      setHash(mod.route);
      track("user_pay_open", {});
      render();
      return;
    }
    if (mod.status === "ready" && mod.id === "finance.account") {
      state.placeholderModule = mod;
      state.finance.view = "home";
      state.finance.wdId = null;
      state.screen = "financeAccount";
      setHash(mod.route);
      track("finance_account_open", {});
      render();
      return;
    }
    state.placeholderModule = mod;
    state.screen = "placeholder";
    setHash(mod.route);
    render();
  }

  function goTab(tab) {
    if (tab === "messages") tab = "todos";
    const from = state.tab;
    state.tab = tab;
    if (tab === "todos") {
      state.screen = "todosHub";
      state.todos.view = "list";
      state.todos.type = null;
      state.todos.itemId = null;
      state.todos.rejectOpen = false;
      state.alerts.view = "list";
      state.alerts.itemId = null;
    } else {
      state.screen = tab;
    }
    setHash("#/" + tab);
    if (from !== tab) track("tab_switch", { from, to: tab });
    render();
  }

  function loginSubmit() {
    const phone = state.loginPhone.trim();
    const password = state.loginPassword;

    if (state.activeScenario === "loginFail") {
      state.loginError = "账号或密码错误（场景台：登录失败演示）";
      render();
      return;
    }

    if (!phone) {
      state.loginError = "请输入手机号";
      render();
      return;
    }
    if (!/^\d{11}$/.test(phone)) {
      state.loginError = "请输入 11 位手机号";
      render();
      return;
    }
    if (!password) {
      state.loginError = "请输入密码";
      render();
      return;
    }
    if (!state.agree) {
      state.loginError = "请先勾选服务协议";
      render();
      return;
    }

    const account = findAccount(phone, password);
    if (!account) {
      state.loginError = "账号或密码错误";
      render();
      return;
    }

    state.loginError = "";
    track("app_login_success", {
      phone,
      identity_count: account.identities.length,
    });

    if (account.identities.length > 1) {
      state.pendingAccount = account;
      state.screen = "pickRole";
      setHash("#/pick-role");
      render();
      return;
    }

    enterWithIdentity(account, account.identities[0]);
  }

  function enterWithIdentity(account, identity) {
    state.session = {
      account,
      role: identity.role,
      roleLabel: identity.roleLabel,
      dataScope: identity.dataScope,
      dataScopeLabel: identity.dataScopeLabel,
      siteIds: identity.siteIds || null,
    };
    state.pendingAccount = null;
    track("role_selected", { role: identity.role });
    goTab("dataStats");
  }

  function logout() {
    track("logout", { role: state.session && state.session.role });
    state.session = null;
    state.pendingAccount = null;
    state.screen = "login";
    state.tab = "dataStats";
    state.dataStats.subTab = "biz";
    setHash("#/login");
    render();
  }

  function applyScenario(key) {
    state.activeScenario = key;
    const sc = SCENARIOS[key] || SCENARIOS.admin;
    state.forceEmptyGrid = sc.forceEmptyGrid;
    state.loadError = sc.loadError;

    if (key === "loginFail") {
      state.session = null;
      state.pendingAccount = null;
      state.screen = "login";
      state.loginError = "";
      setHash("#/login");
      document.querySelectorAll(".scenario-button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.scenario === key);
      });
      render();
      return;
    }

    resetMessages(sc.unread || key === "unread");

    const account = findAccount("13800000005", "123456");
    const wantStaff = key === "staff";
    const identity = account.identities.find((i) =>
      wantStaff ? i.role === "staff" : i.role === "admin"
    );
    state.session = {
      account,
      role: identity.role,
      roleLabel: identity.roleLabel,
      dataScope: identity.dataScope,
      dataScopeLabel: identity.dataScopeLabel,
      siteIds: identity.siteIds || null,
    };
    state.pendingAccount = null;
    state.screen = "dataStats";
    state.tab = "dataStats";
    state.dataStats.subTab = "biz";
    state.finance.view = "home";
    state.finance.wdTab = "all";
    state.finance.wdId = null;
    state.finance.applyAmount = "";
    state.finance.settleForm = null;
    state.finance.settleReturn = "home";
    setHash("#/dataStats");

    document.querySelectorAll(".scenario-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scenario === key);
    });
    render();
  }

  /* ——— render ——— */

  function renderLogin() {
    return `
      <div class="login-hero">
        <div class="login-logo">锂</div>
        <h2>锂电快换</h2>
        <p>运营商工作台 · 手机端日常入口</p>
      </div>
      <div class="form-error ${state.loginError ? "show" : ""}" role="alert">${escapeHtml(
        state.loginError
      )}</div>
      <div class="form-block">
        <div class="form-row">
          <label for="login-phone">手机号</label>
          <input id="login-phone" type="tel" inputmode="numeric" maxlength="11"
            value="${escapeAttr(state.loginPhone)}" placeholder="11 位手机号" />
        </div>
        <div class="form-row">
          <label for="login-password">密码</label>
          <input id="login-password" type="password"
            value="${escapeAttr(state.loginPassword)}" placeholder="默认 123456" />
        </div>
      </div>
      <label class="agree-row">
        <input type="checkbox" id="login-agree" ${state.agree ? "checked" : ""} />
        <span>我已阅读并同意《服务协议》与《隐私政策》（演示）</span>
      </label>
      <button type="button" class="btn-primary" data-action="login">登录</button>
      <div class="demo-hint">
        演示账号<br>
        管理员+员工：<code>13800000005</code> / <code>123456</code><br>
        仅员工：<code>13900000001</code> / <code>123456</code>
      </div>
    `;
  }

  function renderPickRole() {
    const account = state.pendingAccount;
    if (!account) return renderLogin();
    const cards = account.identities
      .map(
        (id) => `
      <button type="button" class="identity-card" data-action="pick-role" data-role="${id.role}">
        <strong>${escapeHtml(id.roleLabel)}</strong>
        <small>${escapeHtml(account.operatorName)} · ${escapeHtml(id.dataScopeLabel)}</small>
      </button>`
      )
      .join("");
    return `
      <div class="page-header">
        <button type="button" class="icon-back" data-action="back-login" aria-label="返回">‹</button>
        <h1>选择身份</h1>
        <div class="header-spacer"></div>
      </div>
      <div class="screen-pad">
        <p class="empty-inline" style="text-align:left;padding:8px 0 4px">账号 ${escapeHtml(
          account.phone
        )} 绑定了多个身份，请选择本次登录身份。</p>
        <div class="identity-list">${cards}</div>
      </div>
    `;
  }

  function renderHomeStatCard(c, blue) {
    const cls = blue ? "summary-card stat-blue" : "summary-card";
    const sub = c.sub
      ? `<div class="sub">${escapeHtml(c.sub)}</div>`
      : "";
    const inner = `
          <div class="${cls}">
            <div class="val">${Number(c.val).toLocaleString("zh-CN")}</div>
            <div class="lab">${escapeHtml(c.lab)}</div>
            ${sub}
          </div>`;
    if (!c.link) return inner;
    if (c.link.action === "open-todo") {
      return `<button type="button" class="home-stat-btn" data-action="open-todo" data-type="${escapeAttr(
        c.link.type
      )}">${inner}</button>`;
    }
    if (c.link.action === "open-module") {
      return `<button type="button" class="home-stat-btn" data-action="open-module" data-id="${escapeAttr(
        c.link.id
      )}">${inner}</button>`;
    }
    return inner;
  }

  function renderHomeStatSection(section, blue) {
    const cards = section.cards
      .map((c) => renderHomeStatCard(c, blue))
      .join("");
    return `
      <div class="home-stats-block">
        <div class="home-stats-title">${escapeHtml(section.title)}</div>
        <div class="summary-row home-stats-row">${cards}</div>
      </div>`;
  }

  function renderHomeBizSnapshot() {
    const home = OpsStats.homeSummary();
    const bizCards = (home.bizCards || home.cards || [])
      .map(
        (c) => `
          <div class="summary-card">
            <div class="val">${Number(c.val).toLocaleString("zh-CN")}</div>
            <div class="lab">${escapeHtml(c.lab)}</div>
          </div>`
      )
      .join("");
    const summary = `
      <button type="button" class="summary-wrap" data-action="open-module" data-id="biz.stats" aria-label="进入经营统计详情">
        <div class="summary-row">${bizCards}</div>
      </button>`;
    const userStats = home.userSection ? renderHomeStatSection(home.userSection, true) : "";
    return `${summary}${userStats}`;
  }

  function renderHomeBatterySnapshot() {
    const home = OpsStats.homeSummary();
    const bat = home.batterySection;
    if (!bat) return "";
    const batCards = bat.cards.map((c) => renderHomeStatCard(c, true)).join("");
    return `
      <div class="home-stats-block">
        <div class="home-stats-title">${escapeHtml(bat.title)}</div>
        <div class="summary-row home-stats-row home-stats-row-4">${batCards}</div>
      </div>`;
  }

  function renderDataStatsSubTabs() {
    const sub = state.dataStats.subTab || "biz";
    return ["biz", "asset"]
      .map((id) => {
        const label = id === "biz" ? "经营统计" : "资产统计";
        const on = sub === id ? " active" : "";
        return `<button type="button" class="ops-subtab${on}" data-action="data-stats-tab" data-tab="${id}" role="tab" aria-selected="${
          sub === id ? "true" : "false"
        }">${label}</button>`;
      })
      .join("");
  }

  function renderDataStats() {
    const s = state.session;
    const sub = state.dataStats.subTab || "biz";
    const body =
      sub === "asset"
        ? `<div class="data-stats-body">${renderHomeBatterySnapshot()}${renderDeviceStatsBody()}</div>`
        : `<div class="data-stats-body">${renderHomeBizSnapshot()}</div>`;
    return `
      <div class="data-stats-page">
        <div class="wb-top">
          <div class="tenant">${escapeHtml(s.account.operatorName)}</div>
        </div>
        <div class="ops-subtabs data-stats-subtabs" role="tablist">${renderDataStatsSubTabs()}</div>
        ${body}
        <div style="height:12px"></div>
      </div>`;
  }

  function renderWorkbench() {
    const s = state.session;
    const modules = visibleModules();
    const groups = groupModules(modules);

    let gridHtml = "";
    if (state.loadError) {
      gridHtml = `
        <div class="error-bar">
          <span>应用列表加载失败</span>
          <button type="button" data-action="retry-load">重试</button>
        </div>`;
    } else if (modules.length === 0) {
      gridHtml = `<div class="empty-full"><div class="icon">▦</div>暂无可用应用，请联系管理员开通</div>`;
    } else {
      gridHtml = groups
        .map((block) => {
          const tiles = block.items
            .map(
              (m) => `
              <button type="button" class="app-tile" data-action="open-module" data-id="${escapeAttr(
                m.id
              )}">
                <div class="ai">${m.icon}</div>
                <div class="an">${escapeHtml(m.name)}</div>
              </button>`
            )
            .join("");
          return `<div class="group-title">${escapeHtml(block.group)}</div>
            <div class="grid-apps">${tiles}</div>`;
        })
        .join("");
    }

    return `
      <div class="wb-top">
        <div class="tenant">${escapeHtml(s.account.operatorName)}</div>
      </div>
      ${gridHtml}
      <div style="height:12px"></div>
    `;
  }

  function inboxOpts() {
    return { forceEmpty: state.forceEmptyGrid };
  }

  function pendingInboxCount() {
    if (!state.session) return 0;
    return (
      Todos.totalCount(state.session.role, inboxOpts()) +
      Alerts.totalCount(inboxOpts())
    );
  }

  function renderTodoAlertSplit() {
    const s = state.session;
    const todoOpts = inboxOpts();
    const todoGroups = Todos.summaries(s.role, todoOpts);
    const todoCount = Todos.totalCount(s.role, todoOpts);
    const todoHtml = todoGroups.length
      ? todoGroups
          .map(
            (g) => `
        <button type="button" class="split-row" data-action="open-todo" data-type="${escapeAttr(
          g.id
        )}">
          <span>${escapeHtml(g.title)}</span>
          <em>${g.count}</em>
        </button>`
          )
          .join("")
      : `<div class="empty-inline compact">${
          s.role === "staff" ? "暂无逾期持电" : "暂无待办"
        }</div>`;

    const alertOpts = inboxOpts();
    const alertGroups = Alerts.summaries(alertOpts);
    const alertCount = Alerts.totalCount(alertOpts);
    const alertHtml = alertGroups.length
      ? alertGroups
          .map(
            (g) => `
        <button type="button" class="split-row warn" data-action="open-alert" data-group="${escapeAttr(
          g.id
        )}">
          <span>${escapeHtml(g.title)}</span>
          <em>${g.count}</em>
        </button>`
          )
          .join("")
      : `<div class="empty-inline compact">暂无警告</div>`;

    return `
      <div class="home-split inbox-split">
        <div class="card-block">
          <button type="button" class="card-hd as-btn" data-action="open-todo" data-type="${
            todoGroups[0]
              ? escapeAttr(todoGroups[0].id)
              : s.role === "staff"
                ? "overdue"
                : "refund"
          }">待办 <span>${todoCount}</span></button>
          ${todoHtml}
        </div>
        <div class="card-block warn-card">
          <button type="button" class="card-hd as-btn" data-action="open-alert" data-group="all">警告 <span>${alertCount}</span></button>
          ${alertHtml}
        </div>
      </div>`;
  }

  function renderMessageItems() {
    if (state.loadError) {
      return `<div class="error-bar"><span>消息加载失败</span><button type="button" data-action="retry-load">重试</button></div>`;
    }
    if (!state.messages.length) {
      return `<div class="empty-inline compact">暂无消息</div>`;
    }
    return state.messages
      .map((m) => {
        const typeLabel =
          m.type === "system" ? "系统" : m.type === "todo" ? "待办" : "业务";
        return `
        <button type="button" class="msg-item ${m.read ? "" : "unread"}" data-action="open-msg" data-id="${escapeAttr(
          m.id
        )}">
          <span class="msg-dot"></span>
          <div class="msg-body">
            <div class="msg-title"><span class="type-tag">${typeLabel}</span>${escapeHtml(
          m.title
        )}</div>
            <div class="msg-sum">${escapeHtml(m.summary)}</div>
            <div class="msg-time">${escapeHtml(m.time)}</div>
          </div>
        </button>`;
      })
      .join("");
  }

  function renderInboxMessages() {
    const n = unreadCount();
    return `
      <div class="card-block inbox-msg">
        <div class="card-hd">消息${n ? ` <span>${n} 未读</span>` : ""}</div>
        <div class="inbox-msg-list">${renderMessageItems()}</div>
      </div>`;
  }

  function renderTodosHub() {
    return `
      <div class="inbox-page">
        <div class="page-header">
          <div class="header-spacer"></div>
          <h1>待办</h1>
          <div class="header-spacer"></div>
        </div>
        ${renderTodoAlertSplit()}
        ${renderInboxMessages()}
      </div>`;
  }

  function renderMessages() {
    return `
      <div class="page-header">
        <button type="button" class="icon-back" data-action="back-mine" aria-label="返回">‹</button>
        <h1>系统消息</h1>
        <div class="header-spacer"></div>
      </div>
      <div class="msg-list">${renderMessageItems()}</div>`;
  }

  function renderMsgDetail() {
    const m = state.messages.find((x) => x.id === state.selectedMsgId);
    if (!m) {
      return `<div class="empty-full">消息不存在</div>`;
    }
    m.read = true;
    return `
      <div class="page-header">
        <button type="button" class="icon-back" data-action="back-messages" aria-label="返回">‹</button>
        <h1>消息详情</h1>
        <div class="header-spacer"></div>
      </div>
      <div class="detail-body">
        <h3>${escapeHtml(m.title)}</h3>
        <p style="font-size:11px;color:var(--muted);margin:0 0 12px">${escapeHtml(m.time)}</p>
        <p style="margin:0">${escapeHtml(m.body)}</p>
      </div>`;
  }

  function renderMine() {
    const s = state.session;
    const isAdmin = s.role === "admin";
    return `
      <div class="mine-head">
        <div class="avatar">${escapeHtml(s.account.name.slice(0, 1))}</div>
        <div>
          <div class="name">${escapeHtml(s.account.name)}</div>
          <div class="sub">${escapeHtml(s.account.phone)}</div>
        </div>
      </div>
      <div class="info-list">
        <div class="info-row"><span class="k">所属运营商</span><span class="v">${escapeHtml(
          s.account.operatorName
        )}</span></div>
        <div class="info-row"><span class="k">角色</span><span class="v">${escapeHtml(
          s.roleLabel
        )}</span></div>
        <div class="info-row"><span class="k">数据范围</span><span class="v">${escapeHtml(
          s.dataScopeLabel
        )}</span></div>
      </div>
      <div class="menu-list">
        ${
          isAdmin
            ? `<button type="button" class="menu-item" disabled data-action="noop">
                切换主体 <span class="hint">单主体演示 · 已禁用</span><span class="chev">›</span>
              </button>`
            : ""
        }
        <button type="button" class="menu-item" data-action="open-messages">
          系统消息 ${
            unreadCount()
              ? `<span class="hint">${unreadCount()} 未读</span>`
              : ""
          }<span class="chev">›</span>
        </button>
        <button type="button" class="menu-item" data-action="open-account">
          账号与安全 <span class="chev">›</span>
        </button>
        <button type="button" class="menu-item" data-action="open-about">
          关于 <span class="chev">›</span>
        </button>
        <button type="button" class="menu-item" data-action="logout" style="color:var(--danger)">
          退出登录
        </button>
      </div>`;
  }

  function renderAbout() {
    return `
      <div class="page-header">
        <button type="button" class="icon-back" data-action="back-mine" aria-label="返回">‹</button>
        <h1>关于</h1>
        <div class="header-spacer"></div>
      </div>
      <div class="detail-body">
        <h3>锂电快换 · 运营商工作台</h3>
        <p>独立手机工作台壳：登录、工作台宫格、待办、我的。业务模块通过注册表插拔。</p>
        <p><strong>本期不做：</strong>不移植 PC 菜单、不实现真实业务、不接真实 API。</p>
      </div>`;
  }

  function renderAccount() {
    return `
      <div class="page-header">
        <button type="button" class="icon-back" data-action="back-mine" aria-label="返回">‹</button>
        <h1>账号与安全</h1>
        <div class="header-spacer"></div>
      </div>
      <div class="detail-body">
        <p>框架期仅展示入口。修改密码、设备管理等能力待账号体系对齐后接入。</p>
        <p style="margin-top:12px;color:var(--muted);font-size:12px">当前演示密码：123456</p>
      </div>`;
  }

  function renderPlaceholder() {
    const m = state.placeholderModule;
    if (!m) return `<div class="empty-full">未知模块</div>`;
    return `
      <div class="page-header">
        <button type="button" class="icon-back" data-action="back-workbench" aria-label="返回">‹</button>
        <h1>${escapeHtml(m.name)}</h1>
        <div class="header-spacer"></div>
      </div>
      <div class="placeholder-screen">
        <div class="big">⋯</div>
        <h2>${escapeHtml(m.name)}</h2>
        <p>本模块暂未开放。<br>请返回工作台使用已上线功能。</p>
        <button type="button" class="btn-secondary" style="width:auto;margin:0 auto;padding:0 24px" data-action="back-workbench">返回工作台</button>
      </div>`;
  }

  function leaseSiteLabel() {
    const s = allSwapSites().find((x) => x.id === state.lease.siteId);
    return s ? s.label : "全部";
  }

  function leaseSearchMeta() {
    return (
      Lease.SEARCH_TYPES.find((x) => x.id === state.lease.searchType) ||
      Lease.SEARCH_TYPES[0]
    );
  }

  function allSwapSites() {
    const out = [{ id: "all", label: "全部" }];
    const seen = new Set(["全部"]);
    Lease.SITES.concat(Daypool.SITES).forEach((s) => {
      if (seen.has(s.label)) return;
      seen.add(s.label);
      out.push(s);
    });
    return out;
  }

  function swapOrderTime(order) {
    return order.createdAt || order.openedAt || order.endedAt || "";
  }

  function swapRowKey(row) {
    return row.kind + ":" + row.order.id;
  }

  /** 全部换电记录（个人 + 人天），有问题单靠前 */
  function allSwapRows() {
    const rows = [];
    Lease.LEASE_ORDERS.forEach((o) => rows.push({ kind: "personal", order: o }));
    Daypool.DAYPOOL_ORDERS.forEach((o) => rows.push({ kind: "daypool", order: o }));
    const rank = { arrears: 0, return_due: 1, pending: 2, parked: 3 };
    return rows.sort((a, b) => {
      const ra = rank[a.order.status] != null ? rank[a.order.status] : 8;
      const rb = rank[b.order.status] != null ? rank[b.order.status] : 8;
      if (ra !== rb) return ra - rb;
      return swapOrderTime(b.order).localeCompare(swapOrderTime(a.order));
    });
  }

  /** 同一用户仅最新一条展示用户信息（在可见列表内按时间判定） */
  function attachUserHeaders(rows) {
    const latestByPhone = new Map();
    rows.forEach((row) => {
      const phone = row.order.phone;
      const t = swapOrderTime(row.order);
      const hit = latestByPhone.get(phone);
      if (!hit || t > hit.t) {
        latestByPhone.set(phone, { key: swapRowKey(row), t });
      }
    });
    const headerKeys = new Set(
      Array.from(latestByPhone.values()).map((x) => x.key)
    );
    return rows.map((row) => ({
      ...row,
      showUserHeader: headerKeys.has(swapRowKey(row)),
    }));
  }

  function swapPendingCount(rows) {
    return rows.filter(({ kind, order }) => kind === "personal" && order.status === "pending")
      .length;
  }

  function filterSwapRows(rows) {
    const siteLabel = leaseSiteLabel();
    const type = state.lease.searchType;
    const kw = String(state.lease.keyword || "").trim().toLowerCase();
    const pf = state.lease.problemFilter || "all";
    const filtered = rows.filter(({ kind, order }) => {
      if (siteLabel && siteLabel !== "全部" && order.store !== siteLabel) return false;
      if (pf === "pending" && !(kind === "personal" && order.status === "pending")) {
        return false;
      }
      if (pf === "problem" && !swapProblemBadge(kind, order)) return false;
      if (!kw) return true;
      if (type === "battery") return String(order.batteryNo || "").toLowerCase().includes(kw);
      return (
        String(order.phone || "").includes(kw) ||
        String(order.userName || "").toLowerCase().includes(kw) ||
        String(order.orderNo || "").toLowerCase().includes(kw)
      );
    });
    return attachUserHeaders(filtered);
  }

  function swapProblemBadge(kind, order) {
    if (kind === "personal") {
      if (order.status === "arrears" || order.status === "pending" || order.status === "parked") {
        return Lease.LEASE_STATUS[order.status].label;
      }
      return "";
    }
    if (order.status === "return_due") return "待还电";
    return "";
  }

  function renderOrderOpBar(kind, orderId, actions) {
    const key = kind + ":" + orderId;
    const open = state.lease.menuKey === key;
    const items = actions
      .map(
        (a) =>
          `<button type="button" class="lease-op-item" data-action="${
            kind === "daypool" ? "daypool-act" : "lease-act"
          }" data-act="${a.id}" data-order="${escapeAttr(orderId)}">${escapeHtml(
            a.label
          )}</button>`
      )
      .join("");
    return `<div class="lease-op-bar">
      ${open ? `<div class="lease-op-sheet" role="menu">${items}</div>` : ""}
      <button type="button" class="lease-op-btn" data-action="order-menu" data-kind="${escapeAttr(
        kind
      )}" data-id="${escapeAttr(orderId)}" aria-expanded="${open ? "true" : "false"}">操作</button>
    </div>`;
  }

  function renderLeaseOrders() {
    const L = state.lease;
    const searchMeta = leaseSearchMeta();
    const allRows = allSwapRows();
    const pendingN = swapPendingCount(allRows);
    const list = filterSwapRows(allRows);
    const pf = L.problemFilter || "all";
    const quickFilters = [
      { id: "all", label: "全部" },
      { id: "pending", label: pendingN ? `待确认 ${pendingN}` : "待确认" },
      { id: "problem", label: "有问题" },
    ]
      .map((f) => {
        const on = pf === f.id ? " active" : "";
        return `<button type="button" class="sites-tab${on}" data-action="lease-problem-filter" data-filter="${escapeAttr(
          f.id
        )}">${escapeHtml(f.label)}</button>`;
      })
      .join("");

    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">📋</div>暂无换电订单</div>`
        : list
            .map((row) => renderSwapUserCard(row.kind, row.order, row.showUserHeader))
            .join("");

    const siteOptions = allSwapSites()
      .map(
        (s) =>
          `<option value="${s.id}" ${s.id === L.siteId ? "selected" : ""}>${escapeHtml(
            s.label
          )}</option>`
      )
      .join("");

    const typeOptions = Lease.SEARCH_TYPES.map(
      (s) =>
        `<option value="${s.id}" ${s.id === L.searchType ? "selected" : ""}>${escapeHtml(
          s.label
        )}</option>`
    ).join("");

    return `
      <div class="lease-page">
        <div class="lease-header">
          <button type="button" class="lease-back" data-action="back-workbench" aria-label="返回">‹</button>
          <h1>换电订单</h1>
          <div class="lease-header-actions" aria-hidden="true">•••</div>
        </div>
        <div class="lease-filters">
          <div class="lease-search-row">
            <select id="lease-search-type" class="lease-select" aria-label="搜索类型">${typeOptions}</select>
            <div class="lease-input-wrap">
              <input id="lease-keyword" type="search" value="${escapeAttr(
                L.keyword
              )}" placeholder="${escapeAttr(searchMeta.placeholder)}" />
              <button type="button" class="lease-scan" data-action="lease-scan" title="扫码" aria-label="扫码">▦</button>
            </div>
            <button type="button" class="lease-confirm" data-action="lease-search">确定</button>
          </div>
          <div class="lease-store-row">
            <label class="lease-store-label">站点
              <select id="lease-site" class="lease-select store" aria-label="站点">${siteOptions}</select>
            </label>
          </div>
          <div class="sites-tabs lease-quick-tabs">${quickFilters}</div>
        </div>
        <div class="lease-list">${cards}</div>
        ${renderConfirmDialog()}
        ${renderDaypoolConfirmDialog()}
      </div>`;
  }

  function renderPackageOrders() {
    const po = state.packageOrders;
    const list = PackageOrders.filterOrders(po.tab, po.kw);
    const tabs = PackageOrders.TABS.map((t) => {
      const on = po.tab === t.id ? " active" : "";
      return `<button type="button" class="sites-tab${on}" data-action="pkg-tab" data-tab="${escapeAttr(
        t.id
      )}">${escapeHtml(t.label)}</button>`;
    }).join("");
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">🧾</div>暂无套餐订单</div>`
        : list
            .map((o) => {
              const paid = o.status === "paid";
              return `<article class="user-card">
          <div class="user-id">
            <strong>${escapeHtml(o.userName)} ${escapeHtml(o.phone)}</strong>
            <span class="user-tag ${paid ? "ok" : "refund"}">${escapeHtml(
                PackageOrders.statusLabel(o.status)
              )}</span>
          </div>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">套餐单号</span><span class="lv">${escapeHtml(o.orderNo)}</span></div>
            <div class="lease-row"><span class="lk">套餐</span><span class="lv">${escapeHtml(o.packageName)}</span></div>
            <div class="lease-row"><span class="lk">金额</span><span class="lv">¥${Number(o.amount).toLocaleString(
                "zh-CN"
              )}</span></div>
            <div class="lease-row"><span class="lk">站点</span><span class="lv">${escapeHtml(o.site)}</span></div>
            <div class="lease-row"><span class="lk">关联换电单</span><span class="lv">${escapeHtml(
              o.swapOrderNo || "—"
            )}</span></div>
            <div class="lease-row"><span class="lk">支付通道</span><span class="lv">${escapeHtml(o.channel)}</span></div>
            <div class="lease-row"><span class="lk">下单时间</span><span class="lv">${escapeHtml(o.createdAt)}</span></div>
            ${
              paid
                ? `<div class="lease-row"><span class="lk">支付时间</span><span class="lv">${escapeHtml(
                    o.paidAt
                  )}</span></div>`
                : `<div class="lease-row"><span class="lk">待支付</span><span class="lv warn">用户端待完成支付</span></div>`
            }
          </div>
        </article>`;
            })
            .join("");
    return `
      <div class="sites-page">
        ${opsHeader("套餐订单")}
        <p class="ops-hint" style="margin:0 14px 8px">个人套餐<strong>购买</strong>订单，与换电订单分离。已支付 / 待支付 Tab 筛选。</p>
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="pkg-kw" type="search" value="${escapeAttr(
              po.kw
            )}" placeholder="套餐单号 / 换电单号 / 姓名 / 手机号" />
            <button type="button" class="sites-confirm" data-action="pkg-search">确定</button>
          </div>
        </div>
        <div class="sites-tabs">${tabs}</div>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function batterySnButton(sn) {
    const code = String(sn || "").trim();
    if (!code || code === "—") return "—";
    return `<button type="button" class="lease-bat-link" data-action="battery-open" data-sn="${escapeAttr(
      code
    )}">${escapeHtml(code)}</button>`;
  }

  function renderLeaseFieldRow(r) {
    const valClass = r.warn ? " warn" : r.link ? " link" : "";
    const copyBtn = r.copy
      ? `<button type="button" class="lease-copy" data-action="copy-text" data-text="${escapeAttr(
          r.value
        )}" aria-label="复制">⧉</button>`
      : "";
    const tag = r.tag
      ? `<span class="lease-pay-tag">${escapeHtml(r.tag)}</span>`
      : "";
    const valueHtml =
      r.link && r.value && r.value !== "—"
        ? batterySnButton(r.value)
        : escapeHtml(r.value);
    return `<div class="lease-row">
          <span class="lk">${escapeHtml(r.label)}</span>
          <span class="lv${valClass}">${valueHtml}${tag}${copyBtn}</span>
        </div>`;
  }

  function openBatteryDetail(sn) {
    const code = String(sn || "").trim();
    if (!code || code === "—") {
      toast("无电池编号");
      return;
    }
    if (els.screenRoot && state.screen === "leaseOrders") {
      state.lease.listScroll = els.screenRoot.scrollTop || 0;
    }
    state.battery.sn = code;
    state.battery.fromScreen = state.screen;
    state.battery.mapZoom = 2;
    state.screen = "batteryDetail";
    track("battery_open", { sn: code, from: state.battery.fromScreen });
    render();
  }

  function closeBatteryDetail() {
    const from = state.battery.fromScreen || "leaseOrders";
    state.screen = from;
    state.battery.sn = null;
    render();
    if (from === "leaseOrders") {
      requestAnimationFrame(() => {
        if (els.screenRoot) els.screenRoot.scrollTop = state.lease.listScroll || 0;
      });
    }
  }

  function renderBatteryDetail() {
    const b = Batteries.view(state.battery.sn);
    if (!b) {
      return `
      <div class="lease-page bat-page">
        <div class="lease-header">
          <button type="button" class="lease-back" data-action="battery-back" aria-label="返回">‹</button>
          <h1>电池详情</h1>
          <div class="lease-header-actions" aria-hidden="true">•••</div>
        </div>
        <div class="empty-full"><div class="icon">🔋</div>未找到该电池</div>
      </div>`;
    }
    const zoom = Math.max(1, Math.min(4, state.battery.mapZoom || 2));
    const socWarn = b.soc < 20;
    const onlineCls = b.online ? "ok" : "off";
    const pois = (b.pois || [])
      .map(
        (p) =>
          `<span class="bat-poi" style="left:${p.x}%;top:${p.y}%">${escapeHtml(p.t)}</span>`
      )
      .join("");
    const locActs = [
      { id: "lbs", label: "LBS定位" },
      { id: "addr", label: "详细地址" },
      { id: "nav", label: "导航" },
      { id: "track", label: "轨迹" },
    ]
      .map(
        (a) =>
          `<button type="button" class="bat-loc-btn" data-action="battery-loc" data-cmd="${a.id}">${escapeHtml(
            a.label
          )}</button>`
      )
      .join("");
    const buzzBtns = [
      { id: "buzz", label: "鸣叫", hot: true, on: b.buzzerOn },
      { id: "stop", label: "停止", on: false },
    ]
      .map((a) => {
        const cls = [
          "bat-buzz-btn",
          a.hot ? "hot" : "",
          a.on ? "active" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<button type="button" class="${cls}" data-action="battery-buzzer" data-cmd="${a.id}">${escapeHtml(
          a.label
        )}</button>`;
      })
      .join("");

    return `
      <div class="lease-page bat-page">
        <div class="lease-header">
          <button type="button" class="lease-back" data-action="battery-back" aria-label="返回">‹</button>
          <h1>电池详情</h1>
          <div class="lease-header-actions" aria-hidden="true">•••</div>
        </div>
        <div class="bat-body">
          <section class="bat-card bat-id">
            <div class="bat-id-row">
              <span class="bat-id-mark" aria-hidden="true"></span>
              <div>
                <div class="bat-id-sn">
                  <strong>${escapeHtml(b.sn)}</strong>
                  <button type="button" class="lease-copy" data-action="copy-text" data-text="${escapeAttr(
                    b.sn
                  )}" aria-label="复制编号">⧉</button>
                </div>
                <p>${escapeHtml(b.model)} · ${escapeHtml(b.belong)} · ${escapeHtml(b.site)}</p>
              </div>
            </div>
            <div class="bat-metrics">
              <div>
                <small>剩余电量</small>
                <em class="${socWarn ? "warn" : ""}">${b.soc}%</em>
              </div>
              <div>
                <small>网络状态</small>
                <em class="${onlineCls}">${b.online ? "在线" : "离线"}</em>
              </div>
            </div>
            <p class="bat-report">位置上报 ${escapeHtml(b.reportedAt)} · ${escapeHtml(
      b.locateBy
    )} · 星数 ${b.sats}</p>
          </section>

          <section class="bat-card">
            <div class="bat-sec-hd"><i></i>远程操作</div>
            ${
              b.online
                ? ""
                : `<p class="bat-offline-hint">设备离线，指令将缓存待上线（Mock）</p>`
            }
            <button type="button" class="bat-switch-row" data-action="battery-discharge" aria-pressed="${
              b.dischargeOn ? "true" : "false"
            }">
              <span>放电开关</span>
              <span class="bat-sw-tag ${b.dischargeOn ? "on" : "off"}">${
      b.dischargeOn ? "开启" : "关闭"
    }</span>
              <span class="lease-switch${b.dischargeOn ? " is-on" : ""}"></span>
            </button>
            <button type="button" class="bat-switch-row" data-action="battery-charge" aria-pressed="${
              b.chargeOn ? "true" : "false"
            }">
              <span>充电开关</span>
              <span class="bat-sw-tag ${b.chargeOn ? "on" : "off"}">${
      b.chargeOn ? "开启" : "关闭"
    }</span>
              <span class="lease-switch${b.chargeOn ? " is-on" : ""}"></span>
            </button>
            <div class="bat-buzz-hd">蜂鸣器</div>
            <div class="bat-buzz">${buzzBtns}</div>
          </section>

          <section class="bat-card bat-map-card">
            <div class="bat-sec-hd"><i></i>定位</div>
            <div class="bat-loc-acts">${locActs}</div>
            <div class="bat-map" role="img" aria-label="电池位置示意">
              <div class="sites-map-tiles zoom-${zoom}" aria-hidden="true">
                <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice">
                  <rect fill="#e8eee4" width="400" height="280"/>
                  <rect fill="#cfd8c6" x="18" y="28" width="90" height="52" rx="3"/>
                  <rect fill="#cfd8c6" x="260" y="150" width="110" height="50" rx="3"/>
                  <path fill="#c3d2db" d="M0 188 Q90 168 180 198 T400 182 L400 280 L0 280Z"/>
                  <path stroke="#f7f7f3" stroke-width="16" fill="none" d="M0 92 H400"/>
                  <path stroke="#f7f7f3" stroke-width="12" fill="none" d="M126 0 V280"/>
                  <path stroke="#f4f4f0" stroke-width="10" fill="none" d="M0 196 H400"/>
                  <path stroke="#f4f4f0" stroke-width="8" fill="none" d="M248 0 V280"/>
                  <rect fill="#d9ddd4" x="140" y="108" width="108" height="58" rx="2"/>
                </svg>
              </div>
              ${pois}
              <div class="bat-pin" style="left:${b.pinX}%;top:${b.pinY}%"><span>⚡</span></div>
              <div class="bat-gps">${escapeHtml(b.gpsText)}</div>
              <div class="sites-map-tools">
                <div class="sites-map-zoom">
                  <button type="button" data-action="battery-zoom" data-dir="in" aria-label="放大">+</button>
                  <button type="button" data-action="battery-zoom" data-dir="out" aria-label="缩小">−</button>
                </div>
              </div>
              <div class="sites-map-copy">腾讯地图 · 原型示意</div>
            </div>
          </section>

          <section class="bat-card">
            <div class="bat-sec-hd"><i></i>资产</div>
            <div class="lease-fields">
              <div class="lease-row"><span class="lk">健康度</span><span class="lv">${b.soh}%</span></div>
              <div class="lease-row"><span class="lk">所在站点</span><span class="lv">${escapeHtml(
                b.site
              )}</span></div>
              <div class="lease-row"><span class="lk">位置</span><span class="lv">${escapeHtml(
                b.belong
              )}${b.cabinetSn && b.cabinetSn !== "—" ? " · " + escapeHtml(b.cabinetSn) : ""}</span></div>
              <div class="lease-row"><span class="lk">持有人</span><span class="lv">${escapeHtml(
                b.holder
              )}</span></div>
              <div class="lease-row"><span class="lk">详细地址</span><span class="lv">${escapeHtml(
                b.address
              )}</span></div>
            </div>
          </section>
        </div>
      </div>`;
  }

  function renderLeaseCard(order) {
    return renderSwapUserCard("personal", order);
  }

  function renderSwapUserCard(kind, order, showUserHeader) {
    const withUser = showUserHeader !== false;
    const badge = swapProblemBadge(kind, order);
    const problem = kind === "personal" ? order.status === "arrears" : order.status === "return_due";
    const profile =
      withUser && kind === "daypool"
        ? Daypool.profileRows(order)
        : withUser
          ? Lease.profileRows(order)
          : [];
    const orderFields =
      kind === "daypool" ? Daypool.orderRows(order) : Lease.orderRows(order);
    const actions =
      kind === "daypool"
        ? Daypool.actionsForStatus(order.status)
        : Lease.actionsForStatus(order.status);
    const callAction = kind === "daypool" ? "daypool-call" : "lease-call";
    const recordClass = withUser ? "" : " lease-card-record";
    const userBlock = withUser
      ? `<div class="lease-card-hd">
          <div class="lease-user">
            <strong>${escapeHtml(order.userName)}</strong>
            <span>${escapeHtml(order.phone)}</span>
            <button type="button" class="lease-icon-btn" data-action="copy-text" data-text="${escapeAttr(
              order.userName + " " + order.phone
            )}" aria-label="复制用户">⧉</button>
          </div>
          <div class="lease-card-tools">
            ${
              badge
                ? `<span class="lease-status-badge">${escapeHtml(badge)}</span>`
                : ""
            }
            <button type="button" class="lease-icon-btn call" data-action="${callAction}" data-phone="${escapeAttr(
              order.phone
            )}" aria-label="拨打">☎</button>
          </div>
        </div>`
      : "";
    const profileBlock =
      profile.length
        ? `<h2 class="lease-card-sec">用户信息</h2>
        <div class="lease-fields">${profile.map(renderLeaseFieldRow).join("")}</div>`
        : "";
    return `
      <article class="lease-card${problem ? " arrears" : ""}${recordClass}">
        ${userBlock}
        ${profileBlock}
        <h2 class="lease-card-sec">换电订单</h2>
        <div class="lease-fields">${orderFields.map(renderLeaseFieldRow).join("")}</div>
        ${renderOrderOpBar(kind, order.id, actions)}
      </article>`;
  }

  function defaultLeaseForm(type, order) {
    const code = Lease.deviceDisplayCode(order);
    switch (type) {
      case "end":
        return {
          batStatus: "recovered",
          overdueFeeMode: "normal",
          overdueFeeCustom: "",
          depositMode: "full",
          depositRefund: "",
          remark: "",
        };
      case "abnormal_end":
        return {
          depositMode: "full",
          depositRefund: "",
          remark: "",
        };
      case "gift_days":
        return { op: "add", days: "", remark: "" };
      case "park":
        return {};
      default:
        return {};
    }
  }

  function openLeaseSub(type, orderId) {
    const order = Lease.getOrderById(orderId);
    if (!order) {
      toast("订单不存在");
      return;
    }
    if (type === "confirm") {
      state.lease.confirmDialog = { orderId };
      track("lease_sub_open", { act: type, order_id: orderId });
      render();
      return;
    }
    if (!Lease.SUBPAGE_META[type]) {
      toast("未知操作");
      return;
    }
    const root = els.screenRoot;
    if (root) state.lease.listScroll = root.scrollTop;
    state.lease.sub = { type, orderId };
    state.lease.form = defaultLeaseForm(type, order);
    state.screen = "leaseSub";
    track("lease_sub_open", { act: type, order_id: orderId });
    render();
  }

  function closeLeaseSub(opts = {}) {
    const sub = state.lease.sub;
    if (opts.trackCancel && sub) {
      track("lease_sub_cancel", { act: sub.type, order_id: sub.orderId });
    }
    state.lease.sub = null;
    state.lease.form = {};
    state.screen = "leaseOrders";
    render();
    requestAnimationFrame(() => {
      if (els.screenRoot) els.screenRoot.scrollTop = state.lease.listScroll || 0;
    });
  }

  function submitLeaseSub() {
    const sub = state.lease.sub;
    if (!sub) return;
    const order = Lease.getOrderById(sub.orderId);
    const f = state.lease.form;
    const type = sub.type;

    if (type === "end") {
      if (f.depositMode === "refund" && !String(f.depositRefund || "").trim()) {
        toast("请输入实退押金金额");
        return;
      }
      if (f.overdueFeeMode === "custom" && !String(f.overdueFeeCustom || "").trim()) {
        toast("请输入逾期费用金额");
        return;
      }
    }
    if (type === "abnormal_end") {
      if (f.depositMode === "refund" && !String(f.depositRefund || "").trim()) {
        toast("请输入实退押金金额");
        return;
      }
    }
    if (type === "gift_days") {
      const days = String(f.days || "").trim();
      if (!/^[1-9]\d*$/.test(days)) {
        toast("请输入正整数天数");
        return;
      }
    }

    track("lease_sub_submit", { act: type, order_id: sub.orderId });
    const titles = {
      end: "结束订单已提交（原型示意）",
      abnormal_end: "异常结束已提交（原型示意）",
      park: "冻结记录已生效（原型示意）",
      gift_days: "赠送天数已提交（原型示意）",
    };
    let msg = titles[type] || "已提交（原型示意）";
    if (type === "park") {
      const fr = Lease.applyFreezeRecord(sub.orderId);
      if (fr.error) {
        toast(fr.error);
        return;
      }
      msg = `冻结记录已生效（${fr.appliedAt}）`;
    }
    if (type === "end") {
      const endData = Lease.getSubpageData(order, "end");
      const normalFee = parseFloat((endData && endData.overdueFeeNormal) || "0") || 0;
      const fee =
        f.overdueFeeMode === "custom"
          ? parseFloat(String(f.overdueFeeCustom || "").trim()) || 0
          : normalFee;
      if (fee > 0) {
        msg += `。骑手端仍有 ¥${fee} 逾期费用待支付（无需归还电池）`;
      }
    }
    toast(msg);
    closeLeaseSub({});
  }

  function leaseSubHeader(title) {
    return `
      <div class="lease-header">
        <button type="button" class="lease-back" data-action="lease-sub-back" aria-label="返回">‹</button>
        <h1>${escapeHtml(title)}</h1>
        <div class="lease-header-actions" aria-hidden="true">•••</div>
      </div>`;
  }

  function leaseEmptyState(text) {
    return `
      <div class="lease-empty">
        <div class="lease-empty-art" aria-hidden="true">
          <div class="lease-empty-monitor"></div>
        </div>
        <p>${escapeHtml(text)}</p>
      </div>`;
  }

  function renderLeaseSub() {
    const sub = state.lease.sub;
    if (!sub) return renderLeaseOrders();
    const data = Lease.getSubpageData(Lease.getOrderById(sub.orderId), sub.type);
    if (!data) {
      toast("页面不存在");
      closeLeaseSub({});
      return renderLeaseOrders();
    }
    switch (sub.type) {
      case "overdue_log":
        return renderSubOverdueLog(data);
      case "extend_log":
        return renderSubExtendLog(data);
      case "end":
        return renderSubEnd(data);
      case "abnormal_end":
        return renderSubAbnormal(data);
      case "park":
        return renderSubPark(data);
      case "gift_days":
        return renderSubGiftDays(data);
      default:
        return renderLeaseOrders();
    }
  }

  function renderSubOverdueLog(data) {
    const { order, overdueLogs } = data;
    if (order.status !== "arrears") {
      return `<div class="lease-page">${leaseSubHeader("逾期记录")}<div class="empty-full"><div class="icon">⏱</div>仅已欠费订单可查看逾期记录</div></div>`;
    }
    const list =
      overdueLogs.length === 0
        ? leaseEmptyState("暂无逾期记录~")
        : overdueLogs
            .map(
              (row) => `
              <article class="lease-card">
                <div class="lease-card-hd">
                  <div class="lease-user"><strong>第 ${row.dayIndex} 天</strong><span>${escapeHtml(
                row.date
              )}</span></div>
                  <span class="lease-ok-badge">¥${Number(row.amount).toFixed(1)}</span>
                </div>
                <div class="lease-fields">
                  <div class="lease-row"><span class="lk">日费率</span><span class="lv">¥${escapeHtml(
                    String(row.dailyFee)
                  )}/天</span></div>
                  <div class="lease-row"><span class="lk">当日计费</span><span class="lv warn">¥${Number(
                    row.amount
                  ).toFixed(1)}</span></div>
                  <div class="lease-row"><span class="lk">说明</span><span class="lv">${escapeHtml(
                    row.note
                  )}</span></div>
                </div>
              </article>`
            )
            .join("");
    const total = overdueLogs.reduce((s, r) => s + Number(r.amount), 0);
    return `<div class="lease-page">${leaseSubHeader(
      "逾期记录"
    )}<p class="ops-hint">逾期后<strong>按自然日</strong>逐条计费（电池占用费）。合计 <strong>¥${total.toFixed(
      1
    )}</strong>，与换电订单欠费金额对齐。</p><div class="lease-list">${list}</div></div>`;
  }

  function renderSubPay(data) {
    const { order, payments } = data;
    const list =
      payments.length === 0
        ? leaseEmptyState("查询结果为空~")
        : payments
            .map(
              (p) => `
        <article class="lease-card">
          <div class="lease-card-hd">
            <div class="lease-user"><strong>${escapeHtml(order.userName)}-${escapeHtml(
                order.phone
              )}</strong></div>
            <span class="lease-ok-badge">${escapeHtml(p.status)}</span>
          </div>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">金额</span><span class="lv">${escapeHtml(
              p.amount
            )} 元</span></div>
            <div class="lease-row"><span class="lk">渠道</span><span class="lv">${escapeHtml(
              p.channel
            )}</span></div>
            <div class="lease-row"><span class="lk">支付时间</span><span class="lv">${escapeHtml(
              p.paidAt
            )}</span></div>
            <div class="lease-row"><span class="lk">流水号</span><span class="lv">${escapeHtml(
              p.tradeNo
            )}</span></div>
          </div>
        </article>`
            )
            .join("");
    return `<div class="lease-page">${leaseSubHeader(
      "订单支付记录"
    )}<div class="lease-list">${list}</div></div>`;
  }

  function renderSubReplaceLog(data) {
    const { replaces } = data;
    const list =
      replaces.length === 0
        ? leaseEmptyState("没有产生更换记录~")
        : replaces
            .map(
              (r) => `
        <article class="lease-card">
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">旧设备编码</span><span class="lv">${batterySnButton(
              r.oldCode
            )}</span></div>
            <div class="lease-row"><span class="lk">新设备编码</span><span class="lv">${batterySnButton(
              r.newCode
            )}</span></div>
            <div class="lease-row"><span class="lk">更换原因</span><span class="lv">${escapeHtml(
              r.reason
            )}</span></div>
            <div class="lease-row"><span class="lk">更换时间</span><span class="lv">${escapeHtml(
              r.at
            )}</span></div>
            <div class="lease-row"><span class="lk">操作人</span><span class="lv">${escapeHtml(
              r.operator
            )}</span></div>
          </div>
        </article>`
            )
            .join("");
    return `<div class="lease-page">${leaseSubHeader(
      "更换记录"
    )}<div class="lease-list">${list}</div></div>`;
  }

  function renderSubExtendLog(data) {
    const { order, extends: rows } = data;
    const list =
      rows.length === 0
        ? leaseEmptyState("查询结果为空~")
        : rows
            .map(
              (r) => `
        <article class="lease-card">
          <div class="lease-card-hd">
            <div class="lease-user"><strong>${escapeHtml(order.userName)} - ${escapeHtml(
                order.phone
              )}</strong></div>
          </div>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">订单编号</span><span class="lv">${escapeHtml(
              order.orderNo
            )}</span></div>
            <div class="lease-row"><span class="lk">开始时间</span><span class="lv">${escapeHtml(
              r.startAt
            )}</span></div>
            <div class="lease-row"><span class="lk">初始结束时间</span><span class="lv">${escapeHtml(
              r.initialEndAt
            )}</span></div>
            <div class="lease-row"><span class="lk">修改后到期时间</span><span class="lv">${escapeHtml(
              r.modifiedExpireAt
            )}</span></div>
            <div class="lease-row"><span class="lk">修改时间</span><span class="lv">${escapeHtml(
              r.modifiedAt
            )}</span></div>
            <div class="lease-row"><span class="lk">备注</span><span class="lv">${escapeHtml(
              r.remark
            )}</span></div>
            <div class="lease-row"><span class="lk">归属站点</span><span class="lv">${escapeHtml(
              r.store
            )}</span></div>
            <div class="lease-row"><span class="lk">操作人</span><span class="lv">${escapeHtml(
              r.operator
            )}</span></div>
          </div>
        </article>`
            )
            .join("");
    return `<div class="lease-page">${leaseSubHeader(
      "订单延期记录"
    )}<div class="lease-list">${list}</div></div>`;
  }

  function renderSubContract(data) {
    const { order, partyA } = data;
    return `
      <div class="lease-page">
        ${leaseSubHeader("订单合同")}
        <div class="lease-contract">
          <p class="lease-contract-id">${escapeHtml(
            "d9319297d0683dff4f072bacf0a2aee2" + order.id
          )}</p>
          <div class="lease-contract-paper">
            <div class="lease-watermark" aria-hidden="true"></div>
            <h2>锂电池租赁合同</h2>
            <p><strong>甲方：</strong>${escapeHtml(partyA)}</p>
            <p><strong>乙方：</strong>${escapeHtml(order.userName)}</p>
            <div class="lease-id-photos">
              <div class="lease-id-slot"><span>身份证正面照</span><em>占位</em></div>
              <div class="lease-id-slot"><span>身份证反面照</span><em>占位</em></div>
              <div class="lease-id-slot"><span>手持照片</span><em>占位</em></div>
            </div>
            <h3>一、总则</h3>
            <p>甲方拥有电池所有权，乙方为使用人。双方确认本合同仅限平台租赁使用。</p>
            <h3>二、租赁方式</h3>
            <div class="lease-fields">
              <div class="lease-row"><span class="lk">租赁型号</span><span class="lv">${escapeHtml(
                order.model
              )}</span></div>
              <div class="lease-row"><span class="lk">电池编号</span><span class="lv">${batterySnButton(
                data.deviceCode
              )}</span></div>
              <div class="lease-row"><span class="lk">押金</span><span class="lv">${escapeHtml(
                order.deposit || "0.00"
              )}</span></div>
              <div class="lease-row"><span class="lk">租金</span><span class="lv">${escapeHtml(
                order.rent || "0.00/月"
              )}</span></div>
              <div class="lease-row"><span class="lk">起始时间</span><span class="lv">${escapeHtml(
                order.createdAt
              )}</span></div>
            </div>
            <p>到期后按规则自动续费，具体以平台规则为准。</p>
            <h3>三、双方的责任与义务</h3>
            <p><strong>甲方：</strong></p>
            <ol>
              <li>保证设备可正常使用并提供必要技术支持。</li>
              <li>对因乙方违规使用导致的损失不承担责任。</li>
              <li>按约定办理退租与结算。</li>
              <li>保护乙方个人信息，仅用于租赁服务。</li>
              <li>因不可抗力导致的服务中断，双方协商处理。</li>
            </ol>
            <p><strong>乙方：</strong></p>
            <ol>
              <li>按约定支付租金与押金。</li>
              <li>正确使用电池，不得拆解、改装或转售。</li>
              <li>发现故障及时报修。</li>
              <li>不得将设备用于违法用途。</li>
              <li>到期前 3 日可申请续租或退租。</li>
              <li>丢失或损坏按规则赔偿。</li>
              <li>配合平台完成实名与风控核验。</li>
              <li>遵守换电站点使用规范。</li>
              <li>合同终止后及时归还设备。</li>
            </ol>
          </div>
        </div>
      </div>`;
  }

  function radioRow(name, value, checked, label, hint) {
    return `
      <label class="lease-radio">
        <input type="radio" name="${name}" value="${value}" data-form-key="${name}" ${
      checked ? "checked" : ""
    } />
        <span class="lease-radio-ui"></span>
        <span class="lease-radio-body">
          <strong>${escapeHtml(label)}</strong>
          ${hint ? `<small class="lease-hint">${hint}</small>` : ""}
        </span>
      </label>`;
  }

  function renderSubEnd(data) {
    const f = state.lease.form;
    const code = data.deviceCode;
    const overdueNormal = data.overdueFeeNormal || "0";
    return `
      <div class="lease-page lease-page-form">
        ${leaseSubHeader("结束订单")}
        <div class="lease-form-body">
          <div class="lease-info-card">
            <div class="lease-dev-icon" aria-hidden="true">🔋</div>
            <div>
              <div class="lease-info-line"><span>设备编号</span><em>${batterySnButton(
                code
              )}</em></div>
            </div>
          </div>
          <section class="lease-form-section">
            <h3><i></i>电池状态</h3>
            ${radioRow("batStatus", "recovered", f.batStatus === "recovered", "已回收电池")}
            ${radioRow("batStatus", "lost", f.batStatus === "lost", "电池丢失")}
          </section>
          <section class="lease-form-section">
            <h3><i></i>逾期费用</h3>
            ${radioRow(
              "overdueFeeMode",
              "normal",
              f.overdueFeeMode === "normal",
              "正常计费：" + overdueNormal + "元"
            )}
            ${radioRow("overdueFeeMode", "custom", f.overdueFeeMode === "custom", "自定义")}
            <div class="lease-inline-input ${
              f.overdueFeeMode === "custom" ? "" : "is-dim"
            }">
              <input type="text" id="lease-overdue-fee" data-form-key="overdueFeeCustom"
                value="${escapeAttr(f.overdueFeeCustom || "")}" placeholder="请输入" inputmode="decimal" />
              <p class="lease-hint">单位：元</p>
            </div>
            <p class="lease-hint">若存在逾期费用，结束订单后骑手仍须在用户端完成支付，无需归还电池。</p>
          </section>
          <section class="lease-form-section">
            <h3><i></i>押金</h3>
            ${radioRow(
              "depositMode",
              "full",
              f.depositMode === "full",
              "押金全扣",
              "发生此电池丢失或某些恶意行为时，不退还此电池的押金"
            )}
            ${radioRow(
              "depositMode",
              "refund",
              f.depositMode === "refund",
              "实退押金(元)"
            )}
            <div class="lease-inline-input ${
              f.depositMode === "refund" ? "" : "is-dim"
            }">
              <input type="text" id="lease-deposit-refund" data-form-key="depositRefund"
                value="${escapeAttr(f.depositRefund || "")}" placeholder="请输入" inputmode="decimal" />
              <p class="lease-hint">可退押金总额: ${escapeHtml(
                data.refundableDeposit
              )} 元,不填则按正常订单扣费</p>
            </div>
          </section>
          <section class="lease-form-section">
            <h3><i></i>备注</h3>
            <input class="lease-text-input" type="text" id="lease-remark" data-form-key="remark"
              value="${escapeAttr(f.remark || "")}" placeholder="请输入" />
          </section>
        </div>
        <div class="lease-footer-bar">
          <button type="button" class="lease-footer-primary" data-action="lease-sub-submit">结束订单</button>
        </div>
      </div>`;
  }

  function renderSubAbnormal(data) {
    const f = state.lease.form;
    return `
      <div class="lease-page lease-page-form">
        ${leaseSubHeader("异常结束")}
        <div class="lease-form-body">
          <div class="lease-info-card">
            <div class="lease-dev-icon" aria-hidden="true">🔋</div>
            <div class="lease-info-line"><span>设备编号</span><em>${batterySnButton(
              data.deviceCode
            )}</em></div>
          </div>
          <p class="lease-hint warn-block">异常结束的订单,不退还租金和保障金</p>
          <section class="lease-form-section">
            <h3><i></i>押金</h3>
            ${radioRow(
              "depositMode",
              "full",
              f.depositMode === "full",
              "押金全扣",
              "发生此电池丢失或某些恶意行为时，不退还此电池的押金"
            )}
            ${radioRow(
              "depositMode",
              "refund",
              f.depositMode === "refund",
              "实退押金(元)"
            )}
            <div class="lease-inline-input ${
              f.depositMode === "refund" ? "" : "is-dim"
            }">
              <input type="text" id="lease-deposit-refund" data-form-key="depositRefund"
                value="${escapeAttr(f.depositRefund || "")}" placeholder="请输入" inputmode="decimal" />
              <p class="lease-hint">可退押金总额: ${escapeHtml(
                data.refundableDeposit
              )} 元,不填则按正常订单扣费</p>
            </div>
          </section>
          <section class="lease-form-section">
            <h3><i></i>备注</h3>
            <input class="lease-text-input" type="text" data-form-key="remark"
              value="${escapeAttr(f.remark || "")}" placeholder="请输入" />
          </section>
        </div>
        <div class="lease-footer-bar">
          <button type="button" class="lease-footer-primary" data-action="lease-sub-submit">结束订单</button>
        </div>
      </div>`;
  }

  function renderSubReplaceBattery(data) {
    const f = state.lease.form;
    const { order } = data;
    return `
      <div class="lease-page lease-page-form">
        ${leaseSubHeader("电池更换")}
        <div class="lease-form-body">
          <div class="lease-info-card">
            <div class="lease-dev-icon" aria-hidden="true">🔋</div>
            <div>
              <div class="lease-info-line">
                <span>旧设备编号</span>
                <em class="lease-pill">${batterySnButton(data.deviceCode)}</em>
              </div>
              <p class="lease-meta">站点：${escapeHtml(order.store)}</p>
              <p class="lease-meta">型号：${escapeHtml(data.modelLabel)}</p>
            </div>
          </div>
          <div class="lease-input-card">
            <input type="text" data-form-key="newCode" value="${escapeAttr(
              f.newCode || ""
            )}" placeholder="请输入新设备编码" />
            <button type="button" class="lease-scan-in" data-action="lease-scan" aria-label="扫码">▦</button>
          </div>
          <div class="lease-input-card tall">
            <textarea data-form-key="reason" maxlength="100" placeholder="请输入更换原因（最多输入 100 字）">${escapeHtml(
              f.reason || ""
            )}</textarea>
          </div>
        </div>
        <div class="lease-footer-bar">
          <button type="button" class="lease-footer-primary" data-action="lease-sub-submit">立即更换</button>
        </div>
      </div>`;
  }

  function renderSubPark(data) {
    return `
      <div class="lease-page lease-page-form">
        ${leaseSubHeader("冻结记录")}
        <div class="lease-form-body">
          <div class="lease-info-card">
            <div class="lease-dev-icon" aria-hidden="true">▣</div>
            <div class="lease-pill">${batterySnButton(data.deviceCode)}</div>
          </div>
          <section class="lease-form-section">
            <h3><i></i>冻结使用说明：</h3>
            <div class="lease-step">
              <span class="lease-step-no">01</span>
              <p>冻结记录实时生效，生效后不消耗订单剩余天数。</p>
            </div>
          </section>
        </div>
        <div class="lease-footer-bar dual">
          <button type="button" class="lease-footer-ghost" data-action="lease-sub-back">取消</button>
          <button type="button" class="lease-footer-primary" data-action="lease-sub-submit">确定</button>
        </div>
      </div>`;
  }

  function renderSubGiftDays(data) {
    const f = state.lease.form;
    const { order } = data;
    return `
      <div class="lease-page lease-page-form">
        ${leaseSubHeader("赠送天数")}
        <div class="lease-form-body">
          <div class="lease-info-card compact">
            <div class="lease-dev-icon" aria-hidden="true">▣</div>
            <div>订单编号 ${escapeHtml(order.orderNo)}</div>
          </div>
          <section class="lease-form-section">
            <h3><i></i>选择操作</h3>
            <div class="lease-op-row">
              <label class="lease-check">
                <input type="radio" name="op" data-form-key="op" value="add" ${
                  f.op === "add" ? "checked" : ""
                } />
                <span>增加</span>
              </label>
              <label class="lease-check">
                <input type="radio" name="op" data-form-key="op" value="sub" ${
                  f.op === "sub" ? "checked" : ""
                } />
                <span>减少</span>
              </label>
            </div>
          </section>
          <div class="lease-input-card">
            <span class="lease-input-icon" aria-hidden="true">⏱</span>
            <input type="text" data-form-key="days" inputmode="numeric" value="${escapeAttr(
              f.days || ""
            )}" placeholder="请输入天数" />
          </div>
          <div class="lease-input-card">
            <span class="lease-input-icon" aria-hidden="true">▣</span>
            <input type="text" data-form-key="remark" value="${escapeAttr(
              f.remark || ""
            )}" placeholder="请输入备注" />
          </div>
          <section class="lease-form-section">
            <h3><i></i>赠送天数说明:</h3>
            <div class="lease-step">
              <span class="lease-step-no">01</span>
              <p>减少的天数如果导致订单的到期时间小于订单最新计费的起始时间则会失败。</p>
            </div>
          </section>
        </div>
        <div class="lease-footer-bar dual">
          <button type="button" class="lease-footer-ghost" data-action="lease-sub-back">取消</button>
          <button type="button" class="lease-footer-primary" data-action="lease-sub-submit">确定</button>
        </div>
      </div>`;
  }

  function renderConfirmDialog() {
    const dlg = state.lease.confirmDialog;
    if (!dlg) return "";
    const order = Lease.getOrderById(dlg.orderId);
    if (!order) return "";
    return `
      <div class="lease-dialog-mask" data-action="lease-dialog-mask">
        <div class="lease-dialog" role="dialog" aria-modal="true">
          <h3>确认订单</h3>
          <p>确认开通订单 <strong>${escapeHtml(order.orderNo)}</strong>？</p>
          <p class="lease-meta">${escapeHtml(order.userName)} ${escapeHtml(
      order.phone
    )} · ${escapeHtml(order.store)}</p>
          <div class="lease-dialog-actions">
            <button type="button" class="lease-footer-ghost" data-action="lease-dialog-cancel">取消</button>
            <button type="button" class="lease-footer-primary" data-action="lease-dialog-ok">确定</button>
          </div>
        </div>
      </div>`;
  }

  function daypoolSiteLabel() {
    const s = Daypool.SITES.find((x) => x.id === state.daypool.siteId);
    return s ? s.label : "全部";
  }

  function daypoolSearchMeta() {
    return (
      Daypool.SEARCH_TYPES.find((x) => x.id === state.daypool.searchType) ||
      Daypool.SEARCH_TYPES[0]
    );
  }

  function renderDaypoolOrders() {
    return renderLeaseOrders();
  }

  function renderDaypoolCard(order) {
    return renderSwapUserCard("daypool", order);
  }

  function defaultDaypoolForm(type) {
    if (type === "replace_battery") return { newCode: "", reason: "" };
    return {};
  }

  function openDaypoolSub(type, orderId) {
    const order = Daypool.getOrderById(orderId);
    if (!order) {
      toast("订单不存在");
      return;
    }
    if (type === "urge") {
      track("daypool_sub_open", { act: type, order_id: orderId });
      toast("已发送催还（原型示意）");
      return;
    }
    if (type === "mock_return") {
      state.daypool.confirmDialog = { orderId, act: "mock_return" };
      track("daypool_sub_open", { act: type, order_id: orderId });
      render();
      return;
    }
    if (!Daypool.SUBPAGE_META[type] || Daypool.SUBPAGE_META[type].kind === "toast") {
      toast("未知操作");
      return;
    }
    const root = els.screenRoot;
    if (root) state.daypool.listScroll = root.scrollTop;
    state.daypool.sub = { type, orderId };
    state.daypool.form = defaultDaypoolForm(type);
    state.screen = "daypoolSub";
    track("daypool_sub_open", { act: type, order_id: orderId });
    render();
  }

  function closeDaypoolSub(opts = {}) {
    const sub = state.daypool.sub;
    if (opts.trackCancel && sub) {
      track("daypool_sub_cancel", { act: sub.type, order_id: sub.orderId });
    }
    state.daypool.sub = null;
    state.daypool.form = {};
    state.screen = "leaseOrders";
    render();
    requestAnimationFrame(() => {
      if (els.screenRoot) els.screenRoot.scrollTop = state.daypool.listScroll || 0;
    });
  }

  function submitDaypoolSub() {
    const sub = state.daypool.sub;
    if (!sub) return;
    const f = state.daypool.form;
    if (sub.type === "replace_battery") {
      if (!String(f.newCode || "").trim()) {
        toast("请输入新设备编码");
        return;
      }
      if (!String(f.reason || "").trim()) {
        toast("请输入更换原因");
        return;
      }
      if (String(f.reason).length > 100) {
        toast("更换原因最多 100 字");
        return;
      }
      track("daypool_sub_submit", { act: sub.type, order_id: sub.orderId });
      const added = Daypool.addReplace(sub.orderId, f);
      if (added.error) {
        toast(added.error);
        return;
      }
      toast("更换已提交（原型示意）");
      state.daypool.form = { newCode: "", reason: "" };
      render();
    }
  }

  function daypoolSubHeader(title) {
    return `
      <div class="lease-header">
        <button type="button" class="lease-back" data-action="daypool-sub-back" aria-label="返回">‹</button>
        <h1>${escapeHtml(title)}</h1>
        <div class="lease-header-actions" aria-hidden="true">•••</div>
      </div>`;
  }

  function renderDaypoolSub() {
    const sub = state.daypool.sub;
    if (!sub) return renderDaypoolOrders();
    const data = Daypool.getSubpageData(Daypool.getOrderById(sub.orderId), sub.type);
    if (!data) {
      toast("页面不存在");
      closeDaypoolSub({});
      return renderDaypoolOrders();
    }
    switch (sub.type) {
      case "consume":
        return renderDaypoolConsume(data);
      case "swap":
        return renderDaypoolSwap(data);
      case "replace_log":
        return renderDaypoolReplaceLog(data);
      case "replace_battery":
        return renderDaypoolReplaceBattery(data);
      default:
        return renderDaypoolOrders();
    }
  }

  function renderDaypoolConsume(data) {
    const { order, consumes } = data;
    const list =
      consumes.length === 0
        ? leaseEmptyState("暂无消耗记录")
        : consumes
            .map(
              (c) => `
              <article class="lease-card">
                <div class="lease-card-hd">
                  <div class="lease-user"><strong>${escapeHtml(c.date)}</strong></div>
                  <span class="lease-ok-badge">${escapeHtml(c.status)}</span>
                </div>
                <div class="lease-fields">
                  <div class="lease-row"><span class="lk">确认口径</span><span class="lv">${escapeHtml(
                    c.reason
                  )}</span></div>
                  <div class="lease-row"><span class="lk">确认人天</span><span class="lv">${escapeHtml(
                    c.days
                  )}</span></div>
                  <div class="lease-row"><span class="lk">当日换电次数</span><span class="lv">${escapeHtml(
                    c.swaps
                  )}</span></div>
                  <div class="lease-row"><span class="lk">日终持电</span><span class="lv">${escapeHtml(
                    c.held
                  )}</span></div>
                  <div class="lease-row"><span class="lk">订单编号</span><span class="lv">${escapeHtml(
                    order.orderNo
                  )}</span></div>
                </div>
              </article>`
            )
            .join("");
    return `
      <div class="lease-page">
        ${daypoolSubHeader("消耗记录")}
        <div class="lease-list">${list}</div>
      </div>`;
  }

  function renderDaypoolSwap(data) {
    const { order, swaps } = data;
    const list =
      swaps.length === 0
        ? leaseEmptyState("暂无换电记录")
        : swaps
            .map((s) => {
              const batIn = s.batIn
                ? `${batterySnButton(s.batIn.sn)}${s.batIn.soc ? ` · SOC ${escapeHtml(s.batIn.soc)}` : ""}`
                : "—";
              const batOut = s.batOut
                ? `${batterySnButton(s.batOut.sn)}${s.batOut.soc ? ` · SOC ${escapeHtml(s.batOut.soc)}` : ""}`
                : "—";
              return `
              <article class="lease-card">
                <div class="lease-card-hd">
                  <div class="lease-user"><strong>${escapeHtml(s.swapId)}</strong></div>
                  <span class="lease-ok-badge">${escapeHtml(s.result || "成功")}</span>
                </div>
                <div class="lease-fields">
                  <div class="lease-row"><span class="lk">时间</span><span class="lv">${escapeHtml(
                    s.at
                  )}</span></div>
                  <div class="lease-row"><span class="lk">站点</span><span class="lv">${escapeHtml(
                    s.site || "—"
                  )}</span></div>
                  <div class="lease-row"><span class="lk">电柜</span><span class="lv">${escapeHtml(
                    s.cabinetSn || "—"
                  )}</span></div>
                  <div class="lease-row"><span class="lk">还电格口</span><span class="lv">${escapeHtml(
                    s.slotIn != null ? String(s.slotIn) : "—"
                  )}</span></div>
                  <div class="lease-row"><span class="lk">取电格口</span><span class="lv">${escapeHtml(
                    s.slotOut != null ? String(s.slotOut) : "—"
                  )}</span></div>
                  <div class="lease-row"><span class="lk">换入电池</span><span class="lv">${batIn}</span></div>
                  <div class="lease-row"><span class="lk">换出电池</span><span class="lv">${batOut}</span></div>
                  <div class="lease-row"><span class="lk">骑手</span><span class="lv">${escapeHtml(
                    s.userName || order.userName
                  )} ${escapeHtml(s.phone || order.phone)}</span></div>
                </div>
              </article>`;
            })
            .join("");
    return `
      <div class="lease-page">
        ${daypoolSubHeader("换电记录")}
        <p class="lease-sub-hint">该用户全部换电记录（跨站点）。数字为 Mock。</p>
        <div class="lease-list">${list}</div>
      </div>`;
  }

  function renderDaypoolReplaceItems(replaces) {
    if (!replaces || replaces.length === 0) {
      return leaseEmptyState("没有产生更换记录~");
    }
    return replaces
      .map(
        (r) => `
              <article class="lease-card">
                <div class="lease-fields">
                  <div class="lease-row"><span class="lk">原电池编号</span><span class="lv">${batterySnButton(
                    r.oldCode
                  )}</span></div>
                  <div class="lease-row"><span class="lk">新电池编号</span><span class="lv">${batterySnButton(
                    r.newCode
                  )}</span></div>
                  <div class="lease-row"><span class="lk">更换原因</span><span class="lv">${escapeHtml(
                    r.reason
                  )}</span></div>
                  <div class="lease-row"><span class="lk">操作时间</span><span class="lv">${escapeHtml(
                    r.at
                  )}</span></div>
                  <div class="lease-row"><span class="lk">操作人</span><span class="lv">${escapeHtml(
                    r.operator
                  )}</span></div>
                </div>
              </article>`
      )
      .join("");
  }

  function renderDaypoolReplaceLog(data) {
    return `
      <div class="lease-page">
        ${daypoolSubHeader("更换记录")}
        <div class="lease-list">${renderDaypoolReplaceItems(data.replaces)}</div>
      </div>`;
  }

  function renderDaypoolReplaceBattery(data) {
    const f = state.daypool.form;
    const { order } = data;
    return `
      <div class="lease-page lease-page-form">
        ${daypoolSubHeader("电池更换")}
        <div class="lease-form-body">
          <div class="lease-info-card">
            <div class="lease-dev-icon" aria-hidden="true">🔋</div>
            <div>
              <div class="lease-info-line">
                <span>旧设备编号</span>
                <em class="lease-pill">${batterySnButton(data.deviceCode)}</em>
              </div>
              <p class="lease-meta">站点：${escapeHtml(order.store)}</p>
              <p class="lease-meta">型号：${escapeHtml(data.modelLabel)}</p>
              <p class="lease-meta">额度池：${escapeHtml(order.poolId)}</p>
            </div>
          </div>
          <div class="lease-input-card">
            <input type="text" data-form-key="newCode" data-form-scope="daypool" value="${escapeAttr(
              f.newCode || ""
            )}" placeholder="请输入新设备编码" />
            <button type="button" class="lease-scan-in" data-action="daypool-scan" aria-label="扫码">▦</button>
          </div>
          <div class="lease-input-card tall">
            <textarea data-form-key="reason" data-form-scope="daypool" maxlength="100" placeholder="请输入更换原因（最多输入 100 字）">${escapeHtml(
              f.reason || ""
            )}</textarea>
          </div>
          <h2 class="lease-sec-title">更换记录</h2>
          <div class="lease-list lease-list-embed">${renderDaypoolReplaceItems(
            data.replaces
          )}</div>
        </div>
        <div class="lease-footer-bar">
          <button type="button" class="lease-footer-primary" data-action="daypool-sub-submit">立即更换</button>
        </div>
      </div>`;
  }

  function renderDaypoolConfirmDialog() {
    const dlg = state.daypool.confirmDialog;
    if (!dlg) return "";
    const order = Daypool.getOrderById(dlg.orderId);
    if (!order) return "";
    return `
      <div class="lease-dialog-mask" data-action="daypool-dialog-mask">
        <div class="lease-dialog" role="dialog" aria-modal="true">
          <h3>模拟还电</h3>
          <p>确认模拟归还电池并完结占用？</p>
          <p class="lease-meta">${escapeHtml(order.userName)} ${escapeHtml(
      order.phone
    )} · ${escapeHtml(order.batteryNo || "无编号")}</p>
          <p class="lease-meta">闸门：${escapeHtml(order.gateReason || "个人无额度")}（原型不改列表状态）</p>
          <div class="lease-dialog-actions">
            <button type="button" class="lease-footer-ghost" data-action="daypool-dialog-cancel">取消</button>
            <button type="button" class="lease-footer-primary" data-action="daypool-dialog-ok">确定</button>
          </div>
        </div>
      </div>`;
  }

  function canEditSites() {
    return !!(state.session && state.session.role === "admin");
  }

  function statusClass(status) {
    if (status === "在营") return "ok";
    if (status === "建设中") return "warn";
    return "off";
  }

  function openSitesList() {
    state.sites.view = "list";
    state.sites.siteId = null;
    state.sites.formId = null;
    state.sites.form = {};
    state.screen = "sites";
    render();
    requestAnimationFrame(() => {
      if (els.screenRoot) els.screenRoot.scrollTop = state.sites.listScroll || 0;
    });
  }

  function openSiteDetail(siteId) {
    const site = Sites.getSiteById(siteId);
    if (!site) {
      toast("站点不存在");
      return;
    }
    if (els.screenRoot && state.sites.view === "list") {
      state.sites.listScroll = els.screenRoot.scrollTop;
    }
    state.sites.view = "detail";
    state.sites.siteId = siteId;
    state.sites.formId = null;
    state.sites.previewIdx = 0;
    state.screen = "sites";
    track("sites_detail", { site_id: siteId });
    render();
  }

  function openSiteForm(siteId) {
    if (!canEditSites()) {
      toast("员工仅可查看站点（原型）");
      return;
    }
    const isNew = !siteId || siteId === "new";
    const site = isNew ? null : Sites.getSiteById(siteId);
    if (!isNew && !site) {
      toast("站点不存在");
      return;
    }
    if (els.screenRoot && state.sites.view === "list") {
      state.sites.listScroll = els.screenRoot.scrollTop;
    }
    state.sites.view = "form";
    state.sites.formId = isNew ? "new" : siteId;
    state.sites.siteId = isNew ? null : siteId;
    state.sites.form = isNew
      ? {
          name: "",
          city: "上海",
          address: "",
          lng: "",
          lat: "",
          type: "配送站",
          status: "在营",
          photos: [],
        }
      : {
          name: site.name,
          city: site.city,
          address: site.address,
          lng: site.lng == null ? "" : String(site.lng),
          lat: site.lat == null ? "" : String(site.lat),
          type: site.type,
          status: site.status,
          photos: Sites.clonePhotos(Sites.photoList(site)),
        };
    track("sites_form_open", { site_id: isNew ? "new" : siteId });
    state.sites.mapQuery = isNew ? "" : site.address || "";
    state.sites.mapZoom = 2;
    state.sites.previewIdx = 0;
    state.sites.locating = false;
    state.screen = "sites";
    render();
  }

  function applySiteMapPick(hit, source) {
    if (!hit || hit.error) {
      toast((hit && hit.error) || "未找到位置");
      return;
    }
    state.sites.form.lng = String(hit.lng);
    state.sites.form.lat = String(hit.lat);
    if (hit.address) state.sites.form.address = hit.address;
    if (hit.address && (source === "device" || source === "device-demo")) {
      state.sites.mapQuery = hit.address;
    }
    if (hit.city && state.sites.formId === "new") {
      state.sites.form.city = hit.city;
    }
    track("sites_map_pick", {
      source,
      lng: hit.lng,
      lat: hit.lat,
    });
    render();
    const msg =
      source === "search"
        ? "已定位到搜索结果"
        : source === "device"
          ? "已使用设备定位"
          : source === "device-demo"
            ? "当前环境无定位，已填入演示坐标"
            : "已在地图选点";
    toast(msg);
  }

  function stillOnSiteForm() {
    return state.screen === "sites" && state.sites.view === "form";
  }

  function finishSiteLocate(hit, source) {
    state.sites.locating = false;
    if (!stillOnSiteForm()) return;
    applySiteMapPick(hit, source);
  }

  function failSiteLocate(msg) {
    state.sites.locating = false;
    if (!stillOnSiteForm()) return;
    render();
    toast(msg);
    track("sites_locate_fail", { msg });
  }

  function pickSiteDeviceLocation() {
    if (!canEditSites()) {
      toast("无编辑权限");
      return;
    }
    if (state.sites.locating) return;
    state.sites.locating = true;
    render();
    toast("正在获取定位…");
    track("sites_locate", {});

    const geo = navigator.geolocation;
    if (!geo) {
      const demo = Sites.DEMO_DEVICE;
      finishSiteLocate(
        Sites.fromDeviceCoords(demo.lng, demo.lat, state.sites.form.city),
        "device-demo"
      );
      return;
    }

    geo.getCurrentPosition(
      (pos) => {
        const gcj = Sites.wgs84ToGcj02(
          pos.coords.longitude,
          pos.coords.latitude
        );
        const hit = Sites.fromDeviceCoords(
          gcj.lng,
          gcj.lat,
          state.sites.form && state.sites.form.city
        );
        if (hit.error) {
          failSiteLocate(hit.error);
          return;
        }
        finishSiteLocate(hit, "device");
      },
      (err) => {
        if (err && err.code === 1) {
          failSiteLocate("未获得定位权限");
          return;
        }
        if (err && err.code === 3) {
          failSiteLocate("定位超时，请重试或搜索地址");
          return;
        }
        failSiteLocate("定位失败，请搜索地址或点地图选点");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
    );
  }

  function submitSiteMapSearch() {
    const input = $("sites-map-query");
    if (input) state.sites.mapQuery = input.value;
    const hit = Sites.searchMap(state.sites.mapQuery, state.sites.form.city);
    applySiteMapPick(hit, "search");
  }

  function submitSiteForm() {
    if (!canEditSites()) {
      toast("无编辑权限");
      return;
    }
    const formId = state.sites.formId;
    const result = Sites.saveSite(state.sites.form, formId);
    if (result.error) {
      toast(result.error);
      return;
    }
    track("sites_save", {
      site_id: result.site.id,
      created: !!result.created,
    });
    toast(result.created ? "站点已新增（原型示意）" : "站点已保存（原型示意）");
    openSiteDetail(result.site.id);
  }

  function renderSites() {
    const view = state.sites.view || "list";
    if (view === "detail") return renderSiteDetail();
    if (view === "form") return renderSiteForm();
    return renderSitesList();
  }

  function renderSitesList() {
    const S = state.sites;
    const counts = Sites.statusCounts();
    const list = Sites.filterSites({ status: S.status, keyword: S.keyword });
    const editable = canEditSites();

    const tabsHtml = Sites.SITE_STATUS.map((t) => {
      const active = S.status === t.id ? " active" : "";
      const n = counts[t.id] != null ? counts[t.id] : 0;
      return `<button type="button" class="sites-tab${active}" data-action="sites-tab" data-status="${escapeAttr(
        t.id
      )}">${escapeHtml(t.label)}<span class="sites-tab-count">${n}</span></button>`;
    }).join("");

    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">📍</div>暂无站点</div>`
        : list
            .map((site) => {
              const range = Sites.openRangeLabel(site);
              const coord = Sites.formatCoord(site);
              const cover = Sites.photoCover(site);
              const photoN = Sites.photoList(site).length;
              const photoCell = cover
                ? `<div class="sites-cover"><img src="${escapeAttr(
                    cover.url
                  )}" alt=""><span>${photoN} 张</span></div>`
                : `<div class="sites-cover empty">未上传</div>`;
              return `<article class="sites-card" data-action="sites-open" data-id="${escapeAttr(
                site.id
              )}">
          <div class="sites-card-hd">
            <div>
              <strong>${escapeHtml(site.name)}</strong>
              <div class="sites-meta">${escapeHtml(site.id)}${
                coord ? " · " + escapeHtml(coord) : ""
              }</div>
            </div>
            <span class="sites-status ${statusClass(site.status)}">${escapeHtml(
              site.status
            )}</span>
          </div>
          <div class="sites-card-rows">
            <div><span>城市</span><em>${escapeHtml(site.city)}</em></div>
            <div><span>类型</span><em>${escapeHtml(site.type)}</em></div>
            <div><span>开放</span><em class="${
              site.channelDedicated ? "brand" : ""
            }">${escapeHtml(range.short)}</em></div>
            <div><span>柜/电</span><em>${site.cabinets} / ${site.batteries}</em></div>
          </div>
          ${photoCell}
          <div class="sites-card-addr">${escapeHtml(site.address)}</div>
        </article>`;
            })
            .join("");

    return `
      <div class="sites-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="back-workbench" aria-label="返回">‹</button>
          <h1>站点</h1>
          ${
            editable
              ? `<button type="button" class="sites-header-btn" data-action="sites-add">新增</button>`
              : `<span class="sites-header-spacer"></span>`
          }
        </div>
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="sites-keyword" type="search" value="${escapeAttr(
              S.keyword
            )}" placeholder="搜索名称 / 编号 / 地址" />
            <button type="button" class="sites-confirm" data-action="sites-search">确定</button>
          </div>
        </div>
        <div class="sites-tabs" role="tablist">${tabsHtml}</div>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function formPhotos() {
    if (!state.sites.form) state.sites.form = {};
    if (!Array.isArray(state.sites.form.photos)) state.sites.form.photos = [];
    return state.sites.form.photos;
  }

  function addSitePhotoFiles(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    const photos = formPhotos();
    const room = Sites.PHOTO_MAX - photos.length;
    if (room <= 0) {
      toast("最多上传 " + Sites.PHOTO_MAX + " 张");
      return;
    }
    let added = 0;
    for (const file of files.slice(0, room)) {
      const okType =
        Sites.PHOTO_ACCEPT.includes(file.type) ||
        /\.(jpe?g|png|webp)$/i.test(file.name || "");
      if (!okType) {
        toast("仅支持 jpg / png / webp");
        continue;
      }
      if (file.size > Sites.PHOTO_MAX_BYTES) {
        toast("单张不超过 5MB");
        continue;
      }
      photos.push({
        id: "ph-" + Date.now() + "-" + photos.length,
        url: URL.createObjectURL(file),
        name: file.name || "实景.jpg",
      });
      added += 1;
    }
    if (added) {
      state.sites.form.photos = photos.slice(0, Sites.PHOTO_MAX);
      state.sites.previewIdx = 0;
      track("sites_photo_add", { count: added });
      render();
    }
  }

  function renderSitePhotoHero(photos, opts) {
    const list = photos || [];
    const idx = Math.min(state.sites.previewIdx || 0, Math.max(list.length - 1, 0));
    const tap = (opts && opts.tapAction) || "sites-photo-hero";
    if (!list.length) {
      return `<div class="sites-hero default" style="background-image:url('${Sites.DEFAULT_BG}')">
        <span>系统默认背景 · 未上传实景</span>
      </div>`;
    }
    const imgs = list
      .map(
        (p, i) =>
          `<img class="${i === idx ? "on" : ""}" src="${escapeAttr(p.url)}" alt="${escapeAttr(
            p.name || "实景"
          )}">`
      )
      .join("");
    const dots =
      list.length > 1
        ? `<div class="sites-hero-dots">${list
            .map(
              (_, i) =>
                `<i class="${i === idx ? "on" : ""}" data-action="sites-photo-dot" data-idx="${i}"></i>`
            )
            .join("")}</div>`
        : "";
    return `<div class="sites-hero" data-action="${tap}">${imgs}${dots}</div>`;
  }

  function renderSitePhotoEditor() {
    const photos = Sites.clonePhotos(state.sites.form && state.sites.form.photos);
    const atMax = photos.length >= Sites.PHOTO_MAX;
    const thumbs = photos
      .map(
        (p, i) => `<div class="sites-photo-thumb">
          <img src="${escapeAttr(p.url)}" alt="">
          ${i === 0 ? `<span class="cover">封面</span>` : ""}
          <button type="button" class="sites-photo-del" data-action="sites-photo-remove" data-idx="${i}" aria-label="删除">×</button>
        </div>`
      )
      .join("");
    return `<div class="sites-photo-editor">
      <div class="sites-photo-hd">
        <strong>实景照片</strong>
        <span>非必填 · ${photos.length}/${Sites.PHOTO_MAX}</span>
      </div>
      <div class="sites-photo-grid">
        ${thumbs}
        <button type="button" class="sites-photo-add" data-action="sites-photo-add" ${
          atMax ? "disabled" : ""
        }>${atMax ? "已达上限" : "+ 添加"}</button>
        <input id="sites-photo-file" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" hidden />
      </div>
      <p class="sites-hint">jpg / png / webp，单张 ≤ 5MB。第一张为封面，骑手端按此顺序轮播。不上传则显示系统默认背景。</p>
      ${
        photos.length
          ? ""
          : `<button type="button" class="sites-photo-sample" data-action="sites-photo-sample">填入示例实景（演示）</button>`
      }
      <div class="sites-photo-preview-label">骑手端站点详情 · 头图预览</div>
      ${renderSitePhotoHero(photos, { tapAction: "sites-photo-hero" })}
    </div>`;
  }

  function renderSiteDetail() {
    const site = Sites.getSiteById(state.sites.siteId);
    if (!site) {
      return `<div class="sites-page"><div class="empty-full">站点不存在<button type="button" class="btn-secondary" data-action="sites-back-list">返回列表</button></div></div>`;
    }
    const range = Sites.openRangeLabel(site);
    const coord = Sites.formatCoord(site) || "未填写";
    const editable = canEditSites();
    const dedicatedNote = site.channelDedicated
      ? `<div class="sites-banner">渠道专属站点由渠道合同创建；编辑时仅可改地址、坐标、实景照片与营业状态。</div>`
      : "";

    const rows = [
      ["站点编号", site.id],
      ["城市", site.city],
      ["类型", site.type],
      ["开放范围", range.detail],
      ["详细地址", site.address],
      ["定位坐标", coord],
      ["换电柜", String(site.cabinets)],
      ["电池", String(site.batteries)],
      ["等待中", String(site.waitingCount || 0)],
      ["营业状态", site.status],
    ]
      .map(
        ([k, v]) =>
          `<div class="sites-kv"><span>${escapeHtml(k)}</span><em>${escapeHtml(
            v
          )}</em></div>`
      )
      .join("");

    return `
      <div class="sites-page sites-page-detail">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="sites-back-list" aria-label="返回">‹</button>
          <h1>站点详情</h1>
          ${
            editable
              ? `<button type="button" class="sites-header-btn" data-action="sites-edit" data-id="${escapeAttr(
                  site.id
                )}">编辑</button>`
              : `<span class="sites-header-spacer"></span>`
          }
        </div>
        <div class="sites-detail-body">
          <div class="sites-detail-title">
            <strong>${escapeHtml(site.name)}</strong>
            <span class="sites-status ${statusClass(site.status)}">${escapeHtml(
              site.status
            )}</span>
          </div>
          ${dedicatedNote}
          ${renderSitePhotoHero(Sites.photoList(site), {
            tapAction: "sites-photo-hero-detail",
          })}
          <div class="sites-kv-block">${rows}</div>
        </div>
      </div>`;
  }

  function renderSiteForm() {
    const formId = state.sites.formId;
    const isNew = formId === "new";
    const site = isNew ? null : Sites.getSiteById(formId);
    const dedicated = !!(site && site.channelDedicated);
    const f = state.sites.form || {};
    const title = isNew ? "新增站点" : "编辑站点";

    const cityOpts = Sites.SITE_CITIES.map(
      (c) =>
        `<option value="${escapeAttr(c)}" ${f.city === c ? "selected" : ""}>${escapeHtml(
          c
        )}</option>`
    ).join("");

    const typeOpts = (dedicated ? ["渠道专属"] : Sites.SITE_TYPES)
      .map(
        (t) =>
          `<option value="${escapeAttr(t)}" ${f.type === t ? "selected" : ""}>${escapeHtml(
            t
          )}</option>`
      )
      .join("");

    const statusOpts = ["在营", "建设中", "已停用"]
      .map(
        (s) =>
          `<option value="${escapeAttr(s)}" ${f.status === s ? "selected" : ""}>${escapeHtml(
            s
          )}</option>`
      )
      .join("");

    const dedicatedNote = dedicated
      ? `<div class="sites-banner">渠道专属站点由<strong>渠道合同</strong>创建；此处仅可修改地址、定位坐标、实景照片与营业状态。</div>`
      : "";

    const view = Sites.mapView(f, state.sites.mapZoom);
    const scale = Sites.MAP_SCALE[view.zoom] || Sites.MAP_SCALE[2];
    const coordText = view.hasPin
      ? `${Number(view.center.lng).toFixed(4)}, ${Number(view.center.lat).toFixed(4)}`
      : "未选点（可选）";

    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="sites-form-back" aria-label="返回">‹</button>
          <h1>${escapeHtml(title)}</h1>
          <span class="sites-header-spacer"></span>
        </div>
        <div class="sites-form-body">
          ${dedicatedNote}
          <label class="sites-field">站点名称
            <input data-sites-key="name" type="text" value="${escapeAttr(
              f.name
            )}" placeholder="如：浦东骑手驿站" ${dedicated ? "readonly" : ""} />
          </label>
          <label class="sites-field">城市
            <select data-sites-key="city" ${dedicated ? "disabled" : ""}>${cityOpts}</select>
          </label>
          <div class="sites-map-block">
            <div class="sites-map-label">组织地址</div>
            <div class="sites-map-search">
              <input id="sites-map-query" type="search" value="${escapeAttr(
                state.sites.mapQuery
              )}" placeholder="请输入地址或经纬度" />
              <button type="button" data-action="sites-map-search">搜索</button>
            </div>
            <button type="button" class="sites-locate" data-action="sites-locate"${
              state.sites.locating ? " disabled" : ""
            }>${state.sites.locating ? "定位中…" : "选择当前位置"}</button>
            <div class="sites-map-canvas" id="sites-map-canvas" role="application" aria-label="地图选点">
              <div class="sites-map-tiles zoom-${view.zoom}" aria-hidden="true">
                <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
                  <rect fill="#e6e7e1" width="400" height="220"/>
                  <rect fill="#cfd8c6" x="28" y="22" width="86" height="46" rx="3"/>
                  <rect fill="#cfd8c6" x="268" y="128" width="92" height="42" rx="3"/>
                  <path fill="#c3d2db" d="M0 158 Q90 138 170 168 T400 152 L400 220 L0 220Z"/>
                  <path stroke="#f5f5f2" stroke-width="16" fill="none" d="M0 78 H400"/>
                  <path stroke="#f5f5f2" stroke-width="12" fill="none" d="M118 0 V220"/>
                  <path stroke="#f5f5f2" stroke-width="10" fill="none" d="M0 168 H400"/>
                  <path stroke="#f5f5f2" stroke-width="8" fill="none" d="M248 0 V220"/>
                  <path stroke="#ecece8" stroke-width="5" fill="none" d="M0 48 H400"/>
                  <path stroke="#ecece8" stroke-width="5" fill="none" d="M70 0 V220"/>
                  <rect fill="#d9ddd4" x="132" y="88" width="96" height="54" rx="2"/>
                  <rect fill="#d4d8cf" x="300" y="36" width="70" height="38" rx="2"/>
                </svg>
              </div>
              <div class="sites-map-pin ${view.hasPin ? "on" : "ghost"}" aria-hidden="true">
                <svg width="28" height="36" viewBox="0 0 28 36">
                  <path d="M14 1c7 0 13 5.6 13 12.6 0 9.2-13 21.4-13 21.4S1 22.8 1 13.6C1 6.6 7 1 14 1z" fill="${
                    view.hasPin ? "#e53935" : "#9aa3b2"
                  }"/>
                  <circle cx="14" cy="13" r="5" fill="#fff"/>
                </svg>
              </div>
              <div class="sites-map-tools">
                <button type="button" class="sites-map-compass" data-action="noop" aria-label="指南针"></button>
                <div class="sites-map-zoom">
                  <button type="button" data-action="sites-map-zoom" data-dir="in" aria-label="放大">+</button>
                  <button type="button" data-action="sites-map-zoom" data-dir="out" aria-label="缩小">−</button>
                </div>
              </div>
              <div class="sites-map-scale">
                <span>${escapeHtml(scale.metric)}</span>
                <span>${escapeHtml(scale.imperial)}</span>
              </div>
              <div class="sites-map-copy">腾讯地图 · 原型示意</div>
            </div>
            <div class="sites-map-coord">${escapeHtml(coordText)} · GCJ-02 · 点地图选点或使用当前位置</div>
          </div>
          <label class="sites-field">详细地址
            <input data-sites-key="address" type="text" value="${escapeAttr(
              f.address
            )}" placeholder="省市区 + 门牌号" />
          </label>
          <label class="sites-field">站点类型
            <select data-sites-key="type" ${dedicated ? "disabled" : ""}>${typeOpts}</select>
          </label>
          ${
            f.type === "渠道专属"
              ? `<p class="sites-hint">渠道专属站仅白名单可见，不对公众开放。正式环境一般由渠道合同创建。</p>`
              : ""
          }
          <label class="sites-field">营业状态
            <select data-sites-key="status">${statusOpts}</select>
          </label>
          ${
            site
              ? `<label class="sites-field">站点编号
            <input type="text" value="${escapeAttr(site.id)}" readonly />
          </label>`
              : ""
          }
          ${renderSitePhotoEditor()}
        </div>
        <div class="sites-footer-bar">
          <button type="button" class="sites-footer-ghost" data-action="sites-form-back">取消</button>
          <button type="button" class="sites-footer-primary" data-action="sites-save">保存</button>
        </div>
      </div>`;
  }

  function openTodoType(typeId) {
    const role = state.session && state.session.role;
    if (!Todos.canSeeType(role, typeId)) {
      toast("无待办权限");
      return;
    }
    const meta = Todos.getTypeMeta(typeId);
    if (!meta) {
      toast("未知待办类型");
      return;
    }
    state.todos.view = "list";
    state.todos.type = typeId;
    state.todos.itemId = null;
    state.todos.rejectOpen = false;
    state.todos.rejectReason = "";
    state.todos.refundMode = "manual";
    state.todos.form = {};
    state.tab = "todos";
    state.screen = "todos";
    setHash("#/todos/" + typeId);
    track("todo_open", { type: typeId });
    render();
  }

  function openTodoDetail(itemId) {
    const item = Todos.getItemById(itemId);
    if (!item) {
      toast("待办不存在");
      return;
    }
    state.todos.view = "detail";
    state.todos.type = item.type;
    state.todos.itemId = itemId;
    state.todos.rejectOpen = false;
    state.todos.rejectReason = "";
    if (item.type === "refund") {
      state.todos.refundMode = "manual";
      state.todos.form = Object.assign(
        { rejectReason: "" },
        Todos.applyPreset(item, "manual")
      );
    } else {
      state.todos.form = {};
    }
    state.tab = "todos";
    state.screen = "todos";
    track("todo_detail", { id: itemId, type: item.type });
    setHash("#/todos/" + item.type + "/" + encodeURIComponent(itemId));
    render();
  }

  function closeTodos() {
    state.todos.view = "list";
    state.todos.type = null;
    state.todos.itemId = null;
    state.todos.rejectOpen = false;
    goTab("todos");
  }

  function setRefundPreset(mode) {
    const item = Todos.getItemById(state.todos.itemId);
    if (!item) return;
    state.todos.refundMode = mode;
    state.todos.form = Object.assign({}, state.todos.form, Todos.applyPreset(item, mode));
    render();
  }

  function submitRefundProcess() {
    const form = Object.assign({}, state.todos.form, {
      rejectReason: state.todos.form.rejectReason || state.todos.rejectReason,
    });
    const result = Todos.processRefund(state.todos.itemId, state.todos.refundMode, form);
    if (result.error) {
      toast(result.error);
      return;
    }
    track("todo_refund_process", {
      id: result.item.id,
      mode: state.todos.refundMode,
    });
    toast(
      result.rejected
        ? "已拒绝退款（原型示意）"
        : result.item.processMode === "全额退款"
          ? "已全额退款 ¥" + result.item.totalRefund + "（原型示意）"
          : "已确认退款 ¥" + result.item.totalRefund + "（原型示意）"
    );
    state.todos.view = "list";
    state.todos.itemId = null;
    render();
  }

  function approveTodo() {
    const result = Todos.approveItem(state.todos.itemId);
    if (result.error) {
      toast(result.error);
      return;
    }
    track("todo_approve", { id: result.item.id, type: result.item.type });
    toast("已确认到账（原型示意）");
    state.todos.view = "list";
    state.todos.itemId = null;
    render();
  }

  function submitTodoReject() {
    const result = Todos.rejectItem(state.todos.itemId, state.todos.rejectReason);
    if (result.error) {
      toast(result.error);
      return;
    }
    track("todo_reject", { id: result.item.id, type: result.item.type });
    toast("已驳回（原型示意）");
    state.todos.rejectOpen = false;
    state.todos.rejectReason = "";
    state.todos.view = "list";
    state.todos.itemId = null;
    render();
  }

  function renderTodos() {
    if (!state.todos.type) return renderTodosHub();
    if (state.todos.view === "detail") return renderTodoDetail();
    return renderTodoList();
  }

  function renderTodoList() {
    const meta = Todos.getTypeMeta(state.todos.type);
    if (!meta) {
      return `<div class="todo-page"><div class="empty-full">待办类型不存在<button type="button" class="btn-secondary" data-action="todos-back-wb">返回待办</button></div></div>`;
    }
    const list = Todos.pendingOf(meta.id);
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">✓</div>${escapeHtml(meta.empty)}</div>`
        : list
            .map(
              (item) => `
        <article class="todo-card" data-action="todo-open-item" data-id="${escapeAttr(
          item.id
        )}">
          <div class="todo-card-hd">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="todo-tag${item.type === "overdue" ? " hot" : ""}">${escapeHtml(item.subtype)}</span>
          </div>
          <div class="todo-card-sum">${escapeHtml(item.summary)}</div>
          <div class="todo-card-meta">${escapeHtml(item.applyTime)}</div>
        </article>`
            )
            .join("");

    return `
      <div class="todo-page">
        <div class="todo-header">
          <button type="button" class="todo-back" data-action="todos-back-wb" aria-label="返回">‹</button>
          <h1>${escapeHtml(meta.title)}</h1>
          <span class="todo-header-count">${list.length}</span>
        </div>
        <p class="todo-source">${escapeHtml(meta.source)}</p>
        <div class="todo-list">${cards}</div>
      </div>`;
  }

  function renderTodoDetail() {
    const item = Todos.getItemById(state.todos.itemId);
    if (!item) {
      return `<div class="todo-page"><div class="empty-full">待办不存在<button type="button" class="btn-secondary" data-action="todos-back-list">返回列表</button></div></div>`;
    }
    if (item.type === "refund") return renderRefundDetail(item);
    if (item.type === "overdue") return renderOverdueDetail(item);
    return renderRechargeDetail(item);
  }

  function renderKv(rows) {
    return rows
      .map((row) => {
        const k = row[0];
        const v = row[1];
        const opts = row[2] || {};
        const valHtml =
          opts.link && v && v !== "—" ? batterySnButton(v) : escapeHtml(v);
        const emAttr = opts.link ? ' class="link"' : "";
        return `<div class="todo-kv"><span>${escapeHtml(k)}</span><em${emAttr}>${valHtml}</em></div>`;
      })
      .join("");
  }

  function renderRefundDetail(item) {
    const pending = item.status === "待审核";
    const caps = Todos.refundCaps(item);
    const f = state.todos.form || {};
    const mode = state.todos.refundMode || "manual";
    const fmtDay = (n) => (n == null ? "—" : n + " 天");
    const rows = [
      ["退款单", item.id],
      ["类型", item.subtype],
      ["用户", item.user + " · " + item.phone],
      ["站点", item.site],
      ["套餐单", item.orderId],
      ["套餐", item.pkgName],
      ["购买时长", fmtDay(caps.purchaseDays)],
      ["可退时长", fmtDay(caps.refundableDays)],
      ["紧急快换", (caps.emergencySwaps || 0) + " 次"],
      ["可退订单金额", "¥" + caps.maxPkg.toFixed(2)],
      ["可退押金金额", "¥" + caps.maxDep.toFixed(2)],
      ["垫付", item.needAdvance ? "须垫付" : "否"],
      ["申请时间", item.applyTime],
    ];
    if (item.note) rows.push(["备注", item.note]);

    const presets = caps.presets
      .map(
        (p) =>
          `<button type="button" class="refund-preset${
            mode === p.id ? " active" : ""
          }" data-action="todo-refund-preset" data-mode="${p.id}">${escapeHtml(
            p.label
          )}</button>`
      )
      .join("");

    const hint = caps.depositOnly
      ? "押金退还不完结套餐；实退订单金额固定为 0。须电池已还且服务/订单已完结。"
      : caps.earlyEndNoDeposit
        ? "中途完结仅退套餐费；押金不在本单退还。用户可在电池已还且订单完结后另行申请退押。"
        : "部分退款可改实退金额，不得超过上方可退口径；全额退款自动带入可退上限。";

    const amountBlock =
      mode === "reject"
        ? `<label class="sites-field">拒绝原因
            <textarea data-todo-key="rejectReason" rows="3" placeholder="请填写拒绝原因">${escapeHtml(
              f.rejectReason || ""
            )}</textarea>
          </label>`
        : `<div class="refund-amounts">
            <label class="sites-field">实退押金金额
              <input data-todo-key="depositRefund" type="text" inputmode="decimal" value="${escapeAttr(
                f.depositRefund
              )}" ${caps.earlyEndNoDeposit || mode === "full" ? "readonly" : ""} />
            </label>
            <label class="sites-field">实退订单金额
              <input data-todo-key="pkgRefund" type="text" inputmode="decimal" value="${escapeAttr(
                f.pkgRefund
              )}" ${caps.depositOnly || mode === "full" ? "readonly" : ""} />
            </label>
          </div>`;

    return `
      <div class="todo-page todo-page-detail">
        <div class="todo-header">
          <button type="button" class="todo-back" data-action="todos-back-list" aria-label="返回">‹</button>
          <h1>处理退款</h1>
          <span class="todo-header-count"></span>
        </div>
        <div class="todo-detail-body">
          <div class="todo-detail-title">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="todo-tag">${escapeHtml(item.subtype)}</span>
          </div>
          <div class="todo-kv-block">${renderKv(rows)}</div>
          ${
            pending
              ? `<div class="refund-process">
            <div class="refund-process-label">退款策略</div>
            <div class="refund-presets">${presets}</div>
            ${amountBlock}
            <p class="sites-hint">${escapeHtml(hint)}</p>
          </div>`
              : ""
          }
        </div>
        ${
          pending
            ? `<div class="todo-footer-bar">
          <button type="button" class="todo-footer-ghost" data-action="todos-back-list">取消</button>
          <button type="button" class="todo-footer-primary" data-action="todo-refund-submit">${
            mode === "reject" ? "确认拒绝" : "确认退款"
          }</button>
        </div>`
            : ""
        }
      </div>`;
  }

  function renderOverdueDetail(item) {
    const open = item.status === "open";
    const isDay = item.subtype === "人天池占用";
    const rows = isDay
      ? [
          ["逾期单", item.id],
          ["类型", item.subtype],
          ["骑手", item.user + " · " + item.phone],
          ["渠道 / 团队", item.channel + " / " + item.team],
          ["占用时间", item.days + " 天（不足一天按 1 人天）"],
          ["已扣人天", item.quota + " 人天"],
          ["池可用（扣后）", String(item.poolAfter) + (item.poolAfter < 0 ? " 欠人天" : "")],
          ["电池编码", item.batCode || "—"],
          ["电池编号", item.batSn || "—", { link: true }],
          ["型号", item.model || "—"],
          ["最后换电", item.lastSwap],
          ["站点", item.site],
        ]
      : [
          ["逾期单", item.id],
          ["类型", item.subtype],
          ["用户", item.user + " · " + item.phone],
          ["套餐", item.sku],
          ["套餐单", item.orderId],
          ["结束原因", item.reason],
          ["已逾期", item.days + " 天（不足一天按一天）"],
          ["占用费", "¥" + item.due + "（日费 ¥" + item.dayFee + "/天）"],
          ["电池编码", item.batCode || "—"],
          ["电池编号", item.batSn || "—", { link: true }],
          ["型号", item.model || "—"],
          ["最后换电", item.lastSwap],
          ["站点", item.site],
        ];

    return `
      <div class="todo-page todo-page-detail">
        <div class="todo-header">
          <button type="button" class="todo-back" data-action="todos-back-list" aria-label="返回">‹</button>
          <h1>逾期详情</h1>
          <span class="todo-header-count"></span>
        </div>
        <div class="todo-detail-body">
          <div class="todo-detail-title">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="todo-tag hot">${escapeHtml(item.subtype)}</span>
          </div>
          <div class="todo-kv-block">${renderKv(rows)}</div>
          <p class="sites-hint">${
            isDay
              ? "个人剩余人天 = 0 仍持有电池：从渠道额度池扣人天，不向骑手收现金。"
              : "个人套餐结束仍持有电池：按日收取占用费。催还后仍须还电完结。"
          }</p>
          ${item.reminded ? `<p class="sites-hint">已发送催还（原型示意）</p>` : ""}
        </div>
        ${
          open
            ? `<div class="todo-footer-bar wrap">
          <button type="button" class="todo-footer-ghost" data-action="todo-overdue-remind">催还</button>
          ${
            isDay
              ? `<button type="button" class="todo-footer-ghost" data-action="todo-overdue-alloc">模拟续配</button>`
              : ""
          }
          <button type="button" class="todo-footer-primary" data-action="todo-overdue-return">模拟还电</button>
        </div>`
            : ""
        }
      </div>`;
  }

  function renderRechargeDetail(item) {
    const pending = item.status === "待确认";
    const rows = [
      ["申请单", item.id],
      ["类型", item.subtype],
      ["渠道商", item.channel],
      ["金额", "¥" + Number(item.amount).toLocaleString("zh-CN")],
      ["支付方式", item.payMethod],
      ["凭证/流水", item.voucher],
      ["说明", item.extra],
      ["申请时间", item.applyTime],
    ];
    const rejectDlg = state.todos.rejectOpen
      ? `<div class="lease-dialog-mask" data-action="todo-reject-mask">
        <div class="lease-dialog">
          <h3>驳回原因</h3>
          <p>请填写原因，渠道商可见。</p>
          <textarea id="todo-reject-reason" rows="3" placeholder="请输入驳回原因">${escapeHtml(
            state.todos.rejectReason
          )}</textarea>
          <div class="lease-dialog-actions">
            <button type="button" class="lease-footer-ghost" data-action="todo-reject-cancel">取消</button>
            <button type="button" class="lease-footer-primary" data-action="todo-reject-ok">确定驳回</button>
          </div>
        </div>
      </div>`
      : "";

    return `
      <div class="todo-page todo-page-detail">
        <div class="todo-header">
          <button type="button" class="todo-back" data-action="todos-back-list" aria-label="返回">‹</button>
          <h1>待办详情</h1>
          <span class="todo-header-count"></span>
        </div>
        <div class="todo-detail-body">
          <div class="todo-detail-title">
            <strong>${escapeHtml(item.title)}</strong>
            <span class="todo-tag">${escapeHtml(item.subtype)}</span>
          </div>
          <div class="todo-kv-block">${renderKv(rows)}</div>
        </div>
        ${
          pending
            ? `<div class="todo-footer-bar">
          <button type="button" class="todo-footer-ghost" data-action="todo-reject">驳回</button>
          <button type="button" class="todo-footer-primary" data-action="todo-approve">确认到账</button>
        </div>`
            : ""
        }
        ${rejectDlg}
      </div>`;
  }

  function openAlertGroup(groupId) {
    state.alerts.view = "list";
    state.alerts.group = groupId || "all";
    state.alerts.type = "all";
    state.alerts.itemId = null;
    state.tab = "todos";
    state.screen = "alerts";
    setHash("#/alerts/" + state.alerts.group);
    track("alert_open", { group: state.alerts.group });
    render();
  }

  function openAlertDetail(id) {
    const item = Alerts.getAlertById(id);
    if (!item) {
      toast("告警不存在");
      return;
    }
    state.alerts.view = "detail";
    state.alerts.group = item.group;
    state.alerts.itemId = id;
    state.screen = "alerts";
    setHash("#/alerts/" + (item.group || "all") + "/" + encodeURIComponent(id));
    track("alert_detail", { id });
    render();
  }

  function renderAlerts() {
    if (state.alerts.view === "detail") return renderAlertDetail();
    return renderAlertList();
  }

  function renderAlertList() {
    const group = state.alerts.group || "all";
    const typeId = state.alerts.type || "all";
    const meta = group === "all" ? { title: "警告" } : Alerts.getGroupMeta(group);
    const title = (meta && meta.title) || "警告";
    const typeMeta = typeId === "all" ? null : Alerts.getTypeMeta(typeId);
    const list = Alerts.pendingOf(group, typeId);
    const chips = Alerts.typeSummaries(group);
    const chipHtml = `
      <div class="alert-tabs" role="tablist" aria-label="换电柜异常类型">
        <button type="button" class="alert-tab${
          typeId === "all" ? " active" : ""
        }" data-action="alert-filter-type" data-type="all">全部 <em>${Alerts.pendingOf(
      group
    ).length}</em></button>
        ${chips
          .map(
            (t) => `
          <button type="button" class="alert-tab${
            typeId === t.id ? " active" : ""
          }" data-action="alert-filter-type" data-type="${escapeAttr(t.id)}">${escapeHtml(
              t.label
            )} <em>${t.count}</em></button>`
          )
          .join("")}
      </div>`;
    const emptyText = typeMeta
      ? `暂无「${typeMeta.label}」警告`
      : "暂无警告";
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">✓</div>${escapeHtml(emptyText)}</div>`
        : list
            .map(
              (a) => `
        <article class="todo-card" data-action="alert-open-item" data-id="${escapeAttr(
          a.id
        )}">
          <div class="todo-card-hd">
            <strong>${escapeHtml(a.subtype)} · ${escapeHtml(a.deviceSn)}</strong>
            <span class="todo-tag ${a.group === "overheat" ? "hot" : ""}">${escapeHtml(
              a.severity
            )}</span>
          </div>
          <div class="todo-card-sum">${escapeHtml(a.site)} · ${escapeHtml(a.message)}</div>
          <div class="todo-card-meta">${escapeHtml(a.status)} · ${escapeHtml(a.raisedAt)}</div>
        </article>`
            )
            .join("");

    return `
      <div class="todo-page">
        <div class="todo-header">
          <button type="button" class="todo-back" data-action="alerts-back-wb" aria-label="返回">‹</button>
          <h1>${escapeHtml(title)}</h1>
          <span class="todo-header-count">${list.length}</span>
        </div>
        <p class="todo-source">换电柜异常封闭枚举 · 对齐 PC 设备告警</p>
        ${chipHtml}
        <div class="todo-list">${cards}</div>
      </div>`;
  }

  function renderAlertDetail() {
    const a = Alerts.getAlertById(state.alerts.itemId);
    if (!a) {
      return `<div class="todo-page"><div class="empty-full">告警不存在<button type="button" class="btn-secondary" data-action="alerts-back-list">返回列表</button></div></div>`;
    }
    const open = a.status === "待处理" || a.status === "处理中";
    const typeMeta = Alerts.getTypeMeta(a.alertType);
    const rows = [
      ["告警单", a.id],
      ["类型", a.subtype],
      ["类型编码", a.alertType],
      ["来源", (typeMeta && typeMeta.source) || "IoT"],
      ["等级", a.severity],
      ["设备", a.deviceSn],
      ["站点", a.site],
      ["状态", a.status],
      ["说明", a.message],
      ["发生时间", a.raisedAt],
    ];
    if (a.swapOrderId) rows.push(["关联换电单", a.swapOrderId]);
    if (a.handledBy) rows.push(["处理人", a.handledBy]);
    const kv = rows
      .map(
        ([k, v]) =>
          `<div class="todo-kv"><span>${escapeHtml(k)}</span><em>${escapeHtml(
            v
          )}</em></div>`
      )
      .join("");

    return `
      <div class="todo-page todo-page-detail">
        <div class="todo-header">
          <button type="button" class="todo-back" data-action="alerts-back-list" aria-label="返回">‹</button>
          <h1>警告详情</h1>
          <span class="todo-header-count"></span>
        </div>
        <div class="todo-detail-body">
          <div class="todo-detail-title">
            <strong>${escapeHtml(a.subtype)}</strong>
            <span class="todo-tag ${a.group === "overheat" ? "hot" : ""}">${escapeHtml(
              a.severity
            )}</span>
          </div>
          <div class="todo-kv-block">${kv}</div>
        </div>
        ${
          open
            ? `<div class="todo-footer-bar">
          ${
            a.status === "待处理"
              ? `<button type="button" class="todo-footer-ghost" data-action="alert-claim">接单</button>`
              : ""
          }
          <button type="button" class="todo-footer-primary" data-action="alert-close">关闭告警</button>
        </div>`
            : ""
        }
      </div>`;
  }

  function canMoveCabinets() {
    return !!(state.session && state.session.role === "admin");
  }

  function canOperateCabinets() {
    return !!state.session;
  }

  function cabP2() {
    return `<span class="cab-p2">二期</span>`;
  }

  const CAB_DETAIL_TABS = [
    { id: "cabinet", label: "电柜信息" },
    { id: "slots", label: "格口信息" },
    { id: "basic", label: "基础信息" },
    { id: "more", label: "其他设置" },
  ];

  function cabSec(title, extra, body) {
    return `<section class="cab-sec">
      <div class="cab-sec-hd">
        <strong>${title}</strong>
        ${extra || ""}
      </div>
      ${body}
    </section>`;
  }

  function cabKvHtml(rows) {
    return `<div class="sites-kv-block cab-kv-block">${rows
      .map(
        (r) =>
          `<div class="sites-kv cab-kv"><span>${escapeHtml(r[0])}</span><em>${
            r[2] ? r[2] : escapeHtml(r[1] == null || r[1] === "" ? "—" : String(r[1]))
          }</em></div>`
      )
      .join("")}</div>`;
  }

  function opsHeader(title, extraHtml) {
    return `
      <div class="sites-header">
        <button type="button" class="sites-back" data-action="back-workbench" aria-label="返回">‹</button>
        <h1>${escapeHtml(title)}</h1>
        ${extraHtml || `<div class="sites-header-spacer"></div>`}
      </div>`;
  }

  function bizChartSeries(name, color, yoyColor, values, yoyValues) {
    return [
      { name: "本期", color, values },
      { name: "同比", color: yoyColor, values: yoyValues },
    ];
  }

  function renderBizBarPlot(labels, series, opts = {}) {
    const max = Math.max(1, ...series.flatMap((s) => s.values || []));
    const showVal =
      !opts.hideValue &&
      (series.length === 1 || (opts.showPrimaryValue && series[0]));
    const cols = labels
      .map((lb, i) => {
        const bars = series
          .map((s) => {
            const v = Number(s.values[i]) || 0;
            const h = Math.max(v ? 8 : 2, Math.round((v / max) * 100));
            return `<i style="height:${h}%;background:${s.color}" title="${escapeAttr(
              s.name + " " + v
            )}"></i>`;
          })
          .join("");
        const top =
          showVal && series[0] ? `<small>${series[0].values[i]}</small>` : "";
        return `<div class="biz-col">${top}<div class="biz-bars">${bars}</div><em>${escapeHtml(
          lb
        )}</em></div>`;
      })
      .join("");
    const legend =
      series.length > 1
        ? `<div class="biz-legend">${series
            .map(
              (s) =>
                `<span><i style="background:${s.color}"></i>${escapeHtml(s.name)}</span>`
            )
            .join("")}</div>`
        : "";
    return `<div class="biz-plot">${cols}</div>${legend}`;
  }

  function renderBizChartCard(title, sub, plotHtml) {
    return `<section class="biz-chart">
      <div class="biz-chart-hd">
        <strong>${escapeHtml(title)}</strong>
        <em>${escapeHtml(sub || "")}</em>
      </div>
      ${plotHtml}
    </section>`;
  }

  function renderBizChartPicker() {
    const mode = state.ops.bizChartMode || "7d";
    const chips = OpsStats.BIZ_CHART_MODES.map((m) => {
      const active = m.id === mode ? " active" : "";
      return `<button type="button" class="ops-chip${active}" data-action="biz-chart-mode" data-mode="${escapeAttr(
        m.id
      )}">${escapeHtml(m.label)}</button>`;
    }).join("");
    let monthPick = "";
    if (mode === "month") {
      const year = state.ops.bizYear || OpsStats.DEMO_TODAY.year;
      const month = state.ops.bizMonth || OpsStats.DEMO_TODAY.month;
      const atMin = year <= OpsStats.BIZ_YEAR_MIN;
      const atMax = year >= OpsStats.DEMO_TODAY.year;
      const months = OpsStats.bizMonthsForYear(year);
      const monthBar = months
        .map((mo) => {
          const active = mo === month ? " active" : "";
          return `<button type="button" class="ops-month-chip${active}" data-action="biz-month" data-month="${mo}">${mo}月</button>`;
        })
        .join("");
      monthPick = `<div class="ops-period">
          <div class="ops-year-bar">
            <button type="button" class="ops-year-nav" data-action="biz-year-prev" aria-label="上一年"${
              atMin ? " disabled" : ""
            }>‹</button>
            <span class="ops-year-label">${year}年</span>
            <button type="button" class="ops-year-nav" data-action="biz-year-next" aria-label="下一年"${
              atMax ? " disabled" : ""
            }>›</button>
          </div>
          <div class="ops-month-row">${monthBar}</div>
        </div>`;
    }
    return `<div class="ops-range">${chips}</div>${monthPick}`;
  }

  function sessionBusyScope() {
    const s = state.session;
    if (!s || s.role === "admin" || s.dataScope === "all") return { mode: "all" };
    return { mode: "sites", siteIds: s.siteIds || [] };
  }

  function renderBizStats() {
    const mode = state.ops.bizChartMode || "7d";
    const year = state.ops.bizYear || OpsStats.DEMO_TODAY.year;
    const month = state.ops.bizMonth || OpsStats.DEMO_TODAY.month;
    const tab = state.ops.bizTab || "charts";
    const kpi = OpsStats.bizKpi();
    const busyScope = sessionBusyScope();
    const busySites = OpsStats.busySitesForScope(busyScope);
    const chart = OpsStats.bizCharts(mode, year, month);
    const kpis = [
      { label: "在线站点", value: kpi.sitesOnline, unit: "个" },
      { label: "在线电柜", value: kpi.cabOnline, unit: "台" },
      { label: "在线电池", value: kpi.batOnline, unit: "块" },
      {
        label: "有效个人用户",
        value: kpi.personalUsers,
        unit: "人",
        hint: "（冻结中：" + kpi.personalFrozen + "人）",
      },
      { label: "有效渠道用户", value: kpi.channelUsers, unit: "人" },
    ]
      .map(
        (k) => `<div class="ops-kpi"><span>${escapeHtml(k.label)}</span><strong>${k.value}<small>${escapeHtml(
          k.unit
        )}</small></strong>${
          k.hint ? `<em>${escapeHtml(k.hint)}</em>` : ""
        }</div>`
      )
      .join("");
    const tabBar = OpsStats.BIZ_TABS.map((t) => {
      const on = tab === t.id ? " active" : "";
      return `<button type="button" class="ops-subtab${on}" data-action="biz-tab" data-tab="${t.id}">${escapeHtml(
        t.label
      )}</button>`;
    }).join("");
    let body = "";
    if (tab === "charts") {
      const C = {
        rent: "#3b82f6",
        swap: "#0ea5e9",
        newUser: "#22c55e",
        newRent: "#d946ef",
        payUser: "#eab308",
        orderValid: "#f59e0b",
        orderNew: "#fb923c",
        hour: "#38bdf8",
        dau: "#6366f1",
        yoy: "#cbd5e1",
      };
      body = `${renderBizChartPicker()}
        <p class="ops-hint">按<strong>${escapeHtml(
          chart.periodLabel || "近7日"
        )}</strong>展示。套餐购买金额 = C 端实付合计，<strong>不按站点拆</strong>。彩色柱=本期，灰柱=${escapeHtml(
          chart.yoyHint || "去年同期"
        )}（同比）。</p>
        ${renderBizChartCard(
          "套餐购买金额",
          "C 端实付 · 含同比",
          renderBizBarPlot(
            chart.labels,
            bizChartSeries("实付", C.rent, C.yoy, chart.rent, chart.rentYoy),
            { showPrimaryValue: true }
          )
        )}
        ${renderBizChartCard(
          "换电订单数",
          "成功 + 失败 · 含同比",
          renderBizBarPlot(
            chart.labels,
            bizChartSeries("换电订单", C.swap, C.yoy, chart.swaps, chart.swapsYoy),
            { showPrimaryValue: true }
          )
        )}
        ${renderBizChartCard(
          "活跃用户",
          "去重骑手 · 含同比",
          renderBizBarPlot(
            chart.labels,
            bizChartSeries("活跃用户", C.dau, C.yoy, chart.dau, chart.dauYoy),
            { showPrimaryValue: true }
          )
        )}
        ${renderBizChartCard(
          "套餐新购",
          "新购订单 · 含同比",
          renderBizBarPlot(
            chart.labels,
            bizChartSeries("新购订单", C.orderNew, C.yoy, chart.orderNew, chart.orderNewYoy),
            { showPrimaryValue: true }
          )
        )}
        ${renderBizChartCard(
          "新增用户",
          "去重新增 · 含同比",
          renderBizBarPlot(
            chart.labels,
            bizChartSeries("新增用户", C.newUser, C.yoy, chart.newUser, chart.newUserYoy),
            { showPrimaryValue: true }
          )
        )}`;
    } else {
      const scopeHint =
        busyScope.mode === "sites" && state.session
          ? `<p class="ops-hint scope">数据范围：${escapeHtml(
              state.session.dataScopeLabel
            )}。仅展示指定站点；页顶 KPI 仍为主体全量快照。</p>`
          : "";
      const rows = busySites
        .map((s) => {
        const level = OpsStats.busyLevel(s);
        const util = OpsStats.slotUtil(s);
        return `<article class="sites-card">
        <div class="sites-card-hd">
          <div>
            <strong>${escapeHtml(s.name)}</strong>
            <div class="sites-meta">${escapeHtml(s.address)}</div>
          </div>
          <span class="ops-busy ${level === "高" ? "high" : level === "中" ? "mid" : "low"}">${escapeHtml(
            level
          )}</span>
        </div>
        <div class="sites-card-rows">
          <div><span>柜机</span><em>${s.cabOnline}/${s.cabTotal}</em></div>
          <div><span>格口</span><em>${s.slotUsed}/${s.slotTotal} · ${util}%</em></div>
          <div><span>等待</span><em>${s.waiting}</em></div>
          <div><span>高峰</span><em>${escapeHtml(s.peak)}</em></div>
          <div><span>最忙时段</span><em>${escapeHtml(s.hotHour)}（${s.hotCount} 笔）</em></div>
        </div>
      </article>`;
        })
        .join("");
      const listHtml = busySites.length
        ? `<div class="sites-list">${rows}</div>`
        : `<div class="empty-inline compact">暂无指定站点的繁忙度数据</div>`;
      body = `${scopeHint}<p class="ops-hint">口径对齐 PC：等待人数 + 格口占用（≈柜内电池/仓口）。高：等待≥3 或占用≥85%；中：等待≥1 或≥60%。高峰=成功换电分时≥当日峰值 65% 的连续小时。<strong>不展示站点收入</strong>。</p>
        ${listHtml}`;
    }
    return `
      <div class="sites-page ops-page">
        ${opsHeader("经营统计")}
        <div class="ops-kpi-grid five">${kpis}</div>
        <div class="ops-subtabs" role="tablist">${tabBar}</div>
        ${body}
      </div>`;
  }

  function renderDeviceStatsBody() {
    const groups = OpsStats.DEVICE_OVERVIEW.map((g) => {
      const n = g.items.length;
      const gridCls =
        n === 6 ? " n-6" : n === 5 ? " n-5" : n === 3 ? " n-3" : n === 2 ? " n-2" : "";
      const cells = g.items
        .map((it) => {
          const zero = Number(it.value) === 0;
          const tone = it.tone === "warn" && !zero ? " warn" : zero ? " zero" : "";
          return `<div class="devstat-cell${tone}">
            <span>${escapeHtml(it.label)}</span>
            <strong>${it.value}</strong>
          </div>`;
        })
        .join("");
      return `<section class="devstat-sec">
        <div class="devstat-hd">
          <strong>${escapeHtml(g.title)}</strong>
        </div>
        <div class="devstat-grid${gridCls}">${cells}</div>
      </section>`;
    }).join("");
    const sites = OpsStats.DEVICE_BY_SITE.map(
      (s) => `<article class="sites-card">
        <div class="sites-card-hd">
          <strong>${escapeHtml(s.name)}</strong>
        </div>
        <div class="sites-card-rows">
          <div><span>电柜</span><em>${s.cabOnline}/${s.cab}</em></div>
          <div><span>电池在柜</span><em>${s.batInCab}/${s.bat}</em></div>
        </div>
      </article>`
    ).join("");
    return `
        <p class="ops-hint" style="margin:0 14px 10px">设备概况 · 实时快照 · 本主体</p>
        ${groups}
        <h2 class="ops-sec">按站点</h2>
        <div class="sites-list">${sites}</div>`;
  }

  function renderDeviceStats() {
    return `
      <div class="sites-page ops-page">
        ${opsHeader("设备统计")}
        ${renderDeviceStatsBody()}
      </div>`;
  }

  function renderUserList() {
    const list = AppUsers.filterUsers(state.users.kw);
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">👤</div>暂无用户</div>`
        : list
            .map((u) => {
              const realOk = u.realName === "已实名";
              const svcOk = u.serviceStatus === "服务中";
              const pkgHtml = u.pkg
                ? `${escapeHtml(u.pkg)}${
                    u.pkgOn ? `<em class="user-tag ok">生效</em>` : ""
                  }`
                : escapeHtml("—");
              const batHtml = u.batterySn
                ? `${batterySnButton(u.batterySn)} <button type="button" class="lease-copy" data-action="copy-text" data-text="${escapeAttr(
                    u.batterySn
                  )}">复制</button>`
                : escapeHtml("—");
              return `<article class="user-card">
          <div class="user-id">
            <strong>${escapeHtml(u.id)}</strong>
            <button type="button" class="lease-copy" data-action="copy-text" data-text="${escapeAttr(
              u.id
            )}">复制</button>
          </div>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">姓名</span><span class="lv">${escapeHtml(
              AppUsers.dash(u.name)
            )}</span></div>
            <div class="lease-row"><span class="lk">手机号</span><span class="lv">${escapeHtml(
              u.phone
              )} <button type="button" class="lease-copy" data-action="copy-text" data-text="${escapeAttr(
                u.phone
              )}">复制</button></span></div>
            <div class="lease-row"><span class="lk">身份证号</span><span class="lv">${escapeHtml(
              AppUsers.dash(u.idNo)
            )}${
                u.idNo
                  ? ` <button type="button" class="lease-copy" data-action="copy-text" data-text="${escapeAttr(
                      u.idNo
                    )}">复制</button>`
                  : ""
              }</span></div>
            <div class="lease-row"><span class="lk">实名认证</span><span class="lv"><em class="user-tag ${
              realOk ? "ok" : ""
            }">${escapeHtml(AppUsers.dash(u.realName))}</em></span></div>
            <div class="lease-row"><span class="lk">服务状态</span><span class="lv"><em class="user-tag ${
              svcOk ? "ok" : ""
            }">${escapeHtml(AppUsers.dash(u.serviceStatus))}</em></span></div>
            <div class="lease-row"><span class="lk">电池押金</span><span class="lv">${escapeHtml(
              AppUsers.dash(u.depositWay)
            )}</span></div>
            <div class="lease-row"><span class="lk">押金状态</span><span class="lv">${escapeHtml(
              AppUsers.dash(u.depositStatus)
            )}</span></div>
            <div class="user-sec-hd">权益信息</div>
            <div class="lease-row"><span class="lk">个人套餐</span><span class="lv user-pkg">${pkgHtml}</span></div>
            <div class="lease-row"><span class="lk">渠道额度</span><span class="lv">${escapeHtml(
              AppUsers.dash(u.quota)
            )}</span></div>
            <div class="user-sec-hd">当前持有电池</div>
            <div class="lease-row"><span class="lk">电池编号</span><span class="lv">${batHtml}</span></div>
          </div>
        </article>`;
            })
            .join("");
    return `
      <div class="sites-page">
        ${opsHeader("用户管理")}
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="user-kw" type="search" value="${escapeAttr(
              state.users.kw
            )}" placeholder="请输入用户名/手机号" />
            <button type="button" class="sites-confirm" data-action="user-search">确定</button>
          </div>
        </div>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function renderUserSms() {
    const list = AppUsers.filterSms(state.users.smsKw);
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">💬</div>暂无验证码记录</div>`
        : list
            .map(
              (s) => `<article class="sms-card">
          <div class="sms-hd">
            <strong>${escapeHtml(s.phone)}</strong>
            <span>${escapeHtml(s.status)}</span>
          </div>
          <button type="button" class="sms-code" data-action="copy-text" data-text="${escapeAttr(
            s.code
          )}" data-ok="验证码已复制">
            <small>验证码</small>
            <em>${escapeHtml(s.code)}</em>
          </button>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">用户</span><span class="lv">${escapeHtml(
              AppUsers.dash(s.userName)
            )} ${escapeHtml(s.phone)}</span></div>
            <div class="lease-row"><span class="lk">身份证号</span><span class="lv">${escapeHtml(
              AppUsers.dash(s.idNo)
            )}</span></div>
            <div class="lease-row"><span class="lk">公司名称</span><span class="lv">${escapeHtml(
              s.company
            )}</span></div>
            <div class="lease-row"><span class="lk">创建时间</span><span class="lv">${escapeHtml(
              s.createdAt
            )}</span></div>
          </div>
        </article>`
            )
            .join("");
    return `
      <div class="sites-page">
        ${opsHeader("短信验证码")}
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="sms-kw" type="search" value="${escapeAttr(
              state.users.smsKw
            )}" placeholder="请输入手机号/姓名" />
            <button type="button" class="sites-confirm" data-action="sms-search">确定</button>
          </div>
        </div>
        <div class="sms-meta">
          <span>共 ${list.length} 条记录</span>
          <em>点击验证码可复制</em>
        </div>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function renderUserPay() {
    const list = AppUsers.filterPay(state.users.payKw, state.users.payTab);
    const tabs = AppUsers.PAY_TABS.map((t) => {
      const on = state.users.payTab === t.id ? " active" : "";
      return `<button type="button" class="sites-tab${on}" data-action="pay-tab" data-tab="${escapeAttr(
        t.id
      )}">${escapeHtml(t.label)}</button>`;
    }).join("");
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">💳</div>暂无支付记录</div>`
        : list
            .map((p) => {
              const refund = p.tab === "refund";
              const chTag = p.channel === "微信支付" ? "微信" : p.channel === "支付宝" ? "支付宝" : p.channel;
              const extraRows =
                refund || p.note
                  ? `${
                      refund
                        ? `<div class="lease-row"><span class="lk">退款金额</span><span class="lv">${escapeHtml(
                            AppUsers.money(Math.abs(p.amount))
                          )}</span></div>`
                        : ""
                    }
            <div class="lease-row"><span class="lk">说明</span><span class="lv">${escapeHtml(
              AppUsers.dash(p.note)
            )}</span></div>`
                  : "";
              return `<article class="user-card">
          <div class="user-id">
            <strong>${escapeHtml(AppUsers.dash(p.userName))} ${escapeHtml(p.phone)}</strong>
            <span class="user-tag">${escapeHtml(chTag)}</span>
            <span class="user-tag ${refund ? "refund" : "ok"}">${escapeHtml(p.status)}</span>
          </div>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">流水号</span><span class="lv">${escapeHtml(p.id)}</span></div>
            <div class="lease-row"><span class="lk">类型</span><span class="lv">${escapeHtml(p.type)}</span></div>
            <div class="lease-row"><span class="lk">关联单</span><span class="lv">${escapeHtml(p.order)}</span></div>
            <div class="lease-row"><span class="lk">套餐</span><span class="lv">${escapeHtml(
              AppUsers.dash(p.pkg)
            )}</span></div>
            <div class="lease-row"><span class="lk">站点</span><span class="lv">${escapeHtml(p.site)}</span></div>
            <div class="lease-row"><span class="lk">收款主体</span><span class="lv">${escapeHtml(p.payee)}</span></div>
            <div class="lease-row"><span class="lk">商户号</span><span class="lv">${escapeHtml(p.mch)}</span></div>
            <div class="lease-row"><span class="lk">实收</span><span class="lv">${escapeHtml(
              AppUsers.money(p.amount)
            )}</span></div>
            <div class="lease-row"><span class="lk">手续费</span><span class="lv">${escapeHtml(
              AppUsers.money(p.fee)
            )}</span></div>
            <div class="lease-row"><span class="lk">入账</span><span class="lv">${escapeHtml(
              AppUsers.money(p.net)
            )}</span></div>
            ${extraRows}
            <div class="lease-row"><span class="lk">通道</span><span class="lv">${escapeHtml(p.channel)}</span></div>
            <div class="lease-row"><span class="lk">时间</span><span class="lv">${escapeHtml(
              AppUsers.dash(p.time)
            )}</span></div>
          </div>
        </article>`;
            })
            .join("");
    return `
      <div class="sites-page">
        ${opsHeader("用户支付记录")}
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="pay-kw" type="search" value="${escapeAttr(
              state.users.payKw
            )}" placeholder="流水号 / 关联单 / 姓名 / 手机号" />
            <button type="button" class="sites-confirm" data-action="pay-search">确定</button>
          </div>
        </div>
        <div class="sites-tabs">${tabs}</div>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function finWdTone(status) {
    if (status === "已提现") return "ok";
    if (status === "已驳回") return "refund";
    return "";
  }

  function renderFinanceApply() {
    const snap = Finance.snapshot();
    const col = snap.collect;
    const st = snap.settle;
    const blocked = snap.hasPending || snap.withdrawable <= 0 || !col.bound;
    const blockHint = snap.hasPending
      ? "当前有待审核提现，暂不可提交新申请"
      : snap.withdrawable <= 0
        ? "可提现余额不足，暂不可提交"
        : !col.bound
          ? "未绑定收款账户不可提现"
          : "";
    return `
      <div class="sites-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="fin-back" aria-label="返回">‹</button>
          <h1>发起提现</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <div class="fin-apply">
          <p class="fin-hint">可提现 ${Finance.yuan(snap.withdrawable)}。转出固定为收款账户；转入为<strong>提现账户</strong>，可在账户页变更。</p>
          ${blockHint ? `<p class="fin-hint warn">${escapeHtml(blockHint)}</p>` : ""}
          <label class="fin-field">
            <span>提现金额（元）</span>
            <input id="fin-apply-amount" type="number" min="0.01" step="0.01" inputmode="decimal"
              value="${escapeAttr(state.finance.applyAmount)}" placeholder="不得超过可提现余额"${
                blocked ? " disabled" : ""
              } />
          </label>
          <div class="user-card">
            <div class="user-sec-hd">转出账户（收款账户）</div>
            <div class="lease-row"><span class="lk">开户名称</span><span class="lv">${escapeHtml(
              col.bankAccountName
            )}</span></div>
            <div class="lease-row"><span class="lk">银行卡号</span><span class="lv">${escapeHtml(
              Finance.maskBank(col.bankAccount)
            )}</span></div>
            <div class="lease-row"><span class="lk">开户银行</span><span class="lv">${escapeHtml(
              col.bankName
            )}</span></div>
          </div>
          <div class="user-card" style="margin-top:10px">
            <div class="user-sec-hd">转入账户（提现账户） <button type="button" class="kyc-link" data-action="fin-settle-change">变更</button></div>
            <div class="lease-row"><span class="lk">开户名称</span><span class="lv">${escapeHtml(
              st.bankAccountName
            )}</span></div>
            <div class="lease-row"><span class="lk">银行卡号</span><span class="lv">${escapeHtml(
              Finance.maskBank(st.bankAccount)
            )}</span></div>
            <div class="lease-row"><span class="lk">开户银行</span><span class="lv">${escapeHtml(
              st.bankName
            )}</span></div>
            <div class="lease-row"><span class="lk">开户支行</span><span class="lv">${escapeHtml(
              Finance.dash(st.bankBranch)
            )}</span></div>
          </div>
        </div>
        <div class="sites-footer-bar">
          <button type="button" class="btn-secondary" data-action="fin-back">取消</button>
          <button type="button" class="sites-confirm" data-action="fin-apply-submit"${
            blocked ? " disabled" : ""
          }>提交申请</button>
        </div>
      </div>`;
  }

  function renderFinanceSettleEdit() {
    const col = Finance.snapshot().collect;
    const f = state.finance.settleForm || Finance.settleFormDefaults();
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="fin-settle-cancel" aria-label="返回">‹</button>
          <h1>变更提现账户</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <div class="sites-form-body fin-apply">
          <p class="fin-hint">对公结算账户，钱将打到此卡。收款账户（${escapeHtml(
            col.receiveBank
          )} · ${escapeHtml(Finance.maskMerchant(col.merchantNo))}）由平台进件维护，不在此变更。</p>
          <label class="sites-field">开户名称 <em class="req">*</em>
            <input id="fin-settle-name" type="text" value="${escapeAttr(
              f.bankAccountName
            )}" placeholder="须与营业执照一致" />
          </label>
          <label class="sites-field">银行卡号 <em class="req">*</em>
            <input id="fin-settle-account" type="tel" inputmode="numeric" value="${escapeAttr(
              f.bankAccount
            )}" placeholder="8～32 位数字" />
          </label>
          <label class="sites-field">开户银行 <em class="req">*</em>
            <input id="fin-settle-bank" type="text" value="${escapeAttr(
              f.bankName
            )}" placeholder="如招商银行" />
          </label>
          <label class="sites-field">开户支行 <em class="req">*</em>
            <input id="fin-settle-branch" type="text" value="${escapeAttr(
              f.bankBranch
            )}" placeholder="开户支行全称" />
          </label>
          <label class="sites-field">联行号（选填）
            <input id="fin-settle-code" type="tel" inputmode="numeric" value="${escapeAttr(
              f.bankCode
            )}" placeholder="12 位数字" />
          </label>
        </div>
        <div class="sites-footer-bar">
          <button type="button" class="btn-secondary" data-action="fin-settle-cancel">取消</button>
          <button type="button" class="sites-confirm" data-action="fin-settle-save">确认</button>
        </div>
      </div>`;
  }

  function renderFinanceDetail() {
    const w = Finance.get(state.finance.wdId);
    if (!w) {
      return `
        <div class="sites-page">
          <div class="sites-header">
            <button type="button" class="sites-back" data-action="fin-back" aria-label="返回">‹</button>
            <h1>提现明细</h1>
            <div class="sites-header-spacer"></div>
          </div>
          <div class="empty-full"><div class="icon">🏦</div>未找到该工单</div>
        </div>`;
    }
    return `
      <div class="sites-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="fin-back" aria-label="返回">‹</button>
          <h1>提现明细</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <div class="sites-list">
          <article class="user-card">
            <div class="user-id">
              <strong>${escapeHtml(w.id)}</strong>
              <span class="user-tag ${finWdTone(w.status)}">${escapeHtml(w.status)}</span>
            </div>
            <div class="lease-fields">
              <div class="lease-row"><span class="lk">提现金额</span><span class="lv">${escapeHtml(
                Finance.yuan(w.amount)
              )}</span></div>
              <div class="lease-row"><span class="lk">申请时间</span><span class="lv">${escapeHtml(
                Finance.dash(w.applyTime)
              )}</span></div>
              <div class="lease-row"><span class="lk">转出账户</span><span class="lv">${escapeHtml(
                Finance.dash(w.sourceLabel)
              )}</span></div>
              <div class="lease-row"><span class="lk">转入开户名称</span><span class="lv">${escapeHtml(
                Finance.dash(w.payeeName)
              )}</span></div>
              <div class="lease-row"><span class="lk">转账银行卡号</span><span class="lv">${escapeHtml(
                Finance.maskBank(w.payeeAccount)
              )}</span></div>
              <div class="lease-row"><span class="lk">转入开户银行</span><span class="lv">${escapeHtml(
                Finance.dash(w.payeeBank)
              )}</span></div>
              <div class="lease-row"><span class="lk">转入开户支行</span><span class="lv">${escapeHtml(
                Finance.dash(w.payeeBranch)
              )}</span></div>
              <div class="lease-row"><span class="lk">联行号</span><span class="lv">${escapeHtml(
                Finance.dash(w.payeeCode)
              )}</span></div>
              <div class="lease-row"><span class="lk">审核</span><span class="lv">${escapeHtml(
                w.reviewedBy ? w.reviewedBy + " · " + Finance.dash(w.reviewTime) : "—"
              )}</span></div>
              <div class="lease-row"><span class="lk">到账时间</span><span class="lv">${escapeHtml(
                Finance.dash(w.withdrawTime)
              )}</span></div>
              ${
                w.rejectReason
                  ? `<div class="lease-row"><span class="lk">驳回原因</span><span class="lv warn">${escapeHtml(
                      w.rejectReason
                    )}</span></div>`
                  : ""
              }
            </div>
          </article>
        </div>
      </div>`;
  }

  function renderFinanceAccount() {
    if (state.finance.view === "apply") return renderFinanceApply();
    if (state.finance.view === "settle-edit") return renderFinanceSettleEdit();
    if (state.finance.view === "detail") return renderFinanceDetail();
    const snap = Finance.snapshot();
    const col = snap.collect;
    const st = snap.settle;
    const tabs = Finance.WD_TABS.map((t) => {
      const on = state.finance.wdTab === t.id ? " active" : "";
      return `<button type="button" class="sites-tab${on}" data-action="fin-wd-tab" data-tab="${escapeAttr(
        t.id
      )}">${escapeHtml(t.label)}</button>`;
    }).join("");
    const rows = Finance.list(state.finance.wdTab);
    const listHtml =
      rows.length === 0
        ? `<div class="empty-full"><div class="icon">🏦</div>暂无提现明细</div>`
        : rows
            .map(
              (w) => `
          <button type="button" class="user-card fin-wd-card" data-action="fin-wd-open" data-id="${escapeAttr(
            w.id
          )}">
            <div class="user-id">
              <strong>${escapeHtml(Finance.yuan(w.amount))}</strong>
              <span class="user-tag ${finWdTone(w.status)}">${escapeHtml(w.status)}</span>
            </div>
            <div class="lease-fields">
              <div class="lease-row"><span class="lk">工单</span><span class="lv">${escapeHtml(w.id)}</span></div>
              <div class="lease-row"><span class="lk">申请时间</span><span class="lv">${escapeHtml(
                Finance.dash(w.applyTime)
              )}</span></div>
              <div class="lease-row"><span class="lk">转入卡</span><span class="lv">${escapeHtml(
                Finance.maskBank(w.payeeAccount)
              )} · ${escapeHtml(w.payeeBank)}</span></div>
            </div>
          </button>`
            )
            .join("");
    return `
      <div class="sites-page">
        ${opsHeader("账户")}
        <div class="fin-hero">
          <div class="fin-total-lab">账户总金额</div>
          <div class="fin-total-val">${Finance.yuan(snap.total)}</div>
          <div class="fin-hero-split">
            <div class="sub">
              <div class="lab">冻结中</div>
              <div class="val">${Finance.yuan(snap.frozen)}</div>
            </div>
            <div class="sub">
              <div class="lab">可提现</div>
              <div class="val">${Finance.yuan(snap.withdrawable)}</div>
            </div>
          </div>
        </div>
        <p class="fin-hint">总金额 = 可提现 + 冻结中。收款账户由平台进件维护；提现账户可单独变更。</p>
        <div class="fin-sec">收款账户</div>
        <div class="sites-list" style="padding-top:0">
          <article class="user-card">
            <div class="user-id">
              <strong>进件子商户 · 提现转出户</strong>
              <span class="user-tag ok">已绑定</span>
            </div>
            <div class="lease-fields">
              <div class="lease-row"><span class="lk">收款开户银行</span><span class="lv">${escapeHtml(
                col.receiveBank
              )}</span></div>
              <div class="lease-row"><span class="lk">收款户名</span><span class="lv">${escapeHtml(
                col.receiveName
              )}</span></div>
              <div class="lease-row"><span class="lk">商户号</span><span class="lv">${escapeHtml(
                Finance.maskMerchant(col.merchantNo)
              )}</span></div>
              <div class="lease-row"><span class="lk">门店号</span><span class="lv">${escapeHtml(
                Finance.maskMerchant(col.storeNo)
              )}</span></div>
              <div class="lease-row"><span class="lk">用途</span><span class="lv">${escapeHtml(
                col.purpose
              )}</span></div>
              <div class="user-sec-hd">转出银行卡</div>
              <div class="lease-row"><span class="lk">开户名称</span><span class="lv">${escapeHtml(
                col.bankAccountName
              )}</span></div>
              <div class="lease-row"><span class="lk">银行卡号</span><span class="lv">${escapeHtml(
                Finance.maskBank(col.bankAccount)
              )} <button type="button" class="lease-copy" data-action="fin-copy" data-text="${escapeAttr(
                col.bankAccount
              )}">复制</button></span></div>
              <div class="lease-row"><span class="lk">绑定时间</span><span class="lv">${escapeHtml(
                Finance.dash(col.corpBoundAt)
              )}</span></div>
              <div class="lease-row"><span class="lk">托管协议</span><span class="lv">${escapeHtml(
                col.custody
              )}</span></div>
            </div>
          </article>
        </div>
        <div class="fin-sec">提现账户</div>
        <div class="sites-list" style="padding-top:0">
          <article class="user-card">
            <div class="user-id">
              <strong>对公结算账户 · 提现转入户</strong>
              <span class="user-tag ok">已维护</span>
            </div>
            <div class="lease-fields">
              <div class="lease-row"><span class="lk">开户名称</span><span class="lv">${escapeHtml(
                st.bankAccountName
              )}</span></div>
              <div class="lease-row"><span class="lk">银行卡号</span><span class="lv">${escapeHtml(
                Finance.maskBank(st.bankAccount)
              )}</span></div>
              <div class="lease-row"><span class="lk">开户银行</span><span class="lv">${escapeHtml(
                st.bankName
              )}</span></div>
              <div class="lease-row"><span class="lk">开户支行</span><span class="lv">${escapeHtml(
                Finance.dash(st.bankBranch)
              )}</span></div>
              <div class="lease-row"><span class="lk">联行号</span><span class="lv">${escapeHtml(
                Finance.dash(st.bankCode)
              )}</span></div>
              <div class="lease-row"><span class="lk">更新时间</span><span class="lv">${escapeHtml(
                Finance.dash(st.updatedAt)
              )}</span></div>
            </div>
            <div class="user-card-act">
              <button type="button" class="user-phone-btn" data-action="fin-settle-change">变更对公</button>
            </div>
          </article>
        </div>
        <div class="fin-sec fin-sec-row">
          <span>提现明细</span>
          <button type="button" class="sites-header-btn" data-action="fin-apply-open">发起提现</button>
        </div>
        <div class="sites-tabs">${tabs}</div>
        <div class="sites-list">${listHtml}</div>
      </div>`;
  }

  function renderCabinets() {
    if (state.ops.cabView === "detail") return renderCabinetDetail();
    if (state.ops.cabView === "move") return renderCabinetMove();
    if (state.ops.cabView === "compose") return renderCabinetCompose();
    if (state.ops.cabView === "edit") return renderCabinetEdit();
    if (state.ops.cabView === "opslog") return renderCabinetOpsLog();
    if (state.ops.cabView === "swaplog") return renderCabinetSwapLog();
    if (state.ops.cabView === "swapDetail") return renderCabinetSwapDetail();
    if (state.ops.cabView === "qr") return renderCabinetQr();
    if (state.ops.cabView === "snapshot") return renderCabinetSnapshot();
    return renderCabinetList();
  }

  function goCabView(view) {
    state.ops.cabView = view;
    render();
  }

  function openCabSub(view, id) {
    const cabId = id || state.ops.cabId;
    const c = Cabinets.getById(cabId);
    if (!c) {
      toast("电柜不存在");
      return;
    }
    if (state.ops.cabView === "list") {
      const root = els.screenRoot;
      if (root) state.ops.listScroll = root.scrollTop;
      state.ops.cabReturn = "list";
    } else if (state.ops.cabView === "detail") {
      state.ops.cabReturn = "detail";
    }
    state.ops.cabId = c.id;
    state.ops.cabView = view;
    state.ops.cabDialog = null;
    if (view === "edit" || view === "move") {
      state.ops.cabSite = Cabinets.isUnassigned(c)
        ? (Cabinets.bindSiteOptions()[0] && Cabinets.bindSiteOptions()[0].id) || ""
        : "";
    }
    if (view === "swaplog") {
      state.ops.cabSwapTab = "all";
      state.ops.cabSwapKw = "";
      state.ops.cabSwapId = null;
    }
    track("cab_sub_open", { sn: c.sn, view });
    render();
  }

  function backCabSub() {
    const to = state.ops.cabReturn === "list" ? "list" : "detail";
    state.ops.cabView = to;
    state.ops.cabDialog = null;
    state.ops.cabSwapId = null;
    render();
    if (to === "list") {
      requestAnimationFrame(() => {
        if (els.screenRoot) els.screenRoot.scrollTop = state.ops.listScroll || 0;
      });
    }
  }

  function renderCabinetList() {
    const O = state.ops;
    const filterOpts = { tab: O.cabTab, keyword: O.cabKeyword, site: O.cabFilterSite || "all" };
    const counts = Cabinets.tabCounts(filterOpts);
    const list = Cabinets.filterCabinets(filterOpts);
    const tabs = Cabinets.CAB_TABS.map((t) => {
      const active = O.cabTab === t.id ? " active" : "";
      return `<button type="button" class="sites-tab${active}" data-action="cab-tab" data-tab="${t.id}">${escapeHtml(
        t.label
      )}<span class="sites-tab-count">${counts[t.id] || 0}</span></button>`;
    }).join("");
    const siteOptions = Cabinets.siteFilterOptions()
      .map((s) => {
        const n = s.count == null ? Cabinets.siteCabinetCount(s.id) : s.count;
        return `<option value="${escapeAttr(s.id)}" ${
          (O.cabFilterSite || "all") === s.id ? "selected" : ""
        }>${escapeHtml(s.label + "（" + n + "）")}</option>`;
      })
      .join("");
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">🔲</div>暂无电柜</div>`
        : list
            .map((c) => {
              const online = !!c.online;
              const powered = c.powerStatus === "已通电";
              const enabled = (c.deviceStatus || "启用") === "启用";
              const occ = Cabinets.occupiedCount(c);
              const onlineCls = online ? "ok" : "bad";
              const powerCls = powered ? "ok" : "bad";
              return `<article class="sites-card cab-list-card">
          <button type="button" class="cab-list-main" data-action="cab-open" data-id="${escapeAttr(
            c.id
          )}">
            <div class="sites-card-hd">
              <div>
                <strong>${escapeHtml(c.name || c.sn)}</strong>
                <div class="cab-list-tags">
                  <span class="cab-tag${enabled ? "" : " off"}">${escapeHtml(
                c.deviceStatus || "启用"
              )}</span>
                  <span class="cab-tag ${powerCls}">${escapeHtml(
                c.powerStatus || "未通电"
              )}</span>
                  <span class="sites-status ${onlineCls}">${
                online ? "在线" : "离线"
              }</span>
                  ${
                    Cabinets.isUnassigned(c)
                      ? `<span class="sites-status off">未分配</span>`
                      : ""
                  }
                </div>
              </div>
            </div>
            <div class="sites-card-rows">
              <div><span>电柜 SN</span><em>${escapeHtml(c.sn)}</em></div>
              <div><span>站点</span><em>${escapeHtml(c.site)}</em></div>
              <div><span>仓口</span><em>${c.slots}</em></div>
              <div><span>在柜电池</span><em>${occ}</em></div>
              <div><span>通电</span><em class="cab-state ${powerCls}">${escapeHtml(
                c.powerStatus
              )}</em></div>
              <div><span>上次换电</span><em>${escapeHtml(c.lastSwap)}</em></div>
            </div>
          </button>
          <div class="cab-list-ops">
            <button type="button" data-action="cab-history" data-id="${escapeAttr(
              c.id
            )}">历史记录</button>
            <button type="button" data-action="cab-swaps" data-id="${escapeAttr(
              c.id
            )}">换电记录</button>
            ${
              canMoveCabinets()
                ? `<button type="button" data-action="cab-edit" data-id="${escapeAttr(
                    c.id
                  )}">编辑</button>`
                : ""
            }
          </div>
        </article>`;
            })
            .join("");
    return `
      <div class="sites-page">
        ${opsHeader("电柜管理")}
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="cab-keyword" type="search" value="${escapeAttr(
              O.cabKeyword
            )}" placeholder="搜 SN / 站点名称" />
            <button type="button" class="sites-confirm" data-action="cab-scan">扫码</button>
            <button type="button" class="sites-confirm" data-action="cab-search">确定</button>
          </div>
          <label class="cab-site-filter">站点
            <select id="cab-filter-site" aria-label="按站点筛选">${siteOptions}</select>
          </label>
        </div>
        <div class="sites-tabs">${tabs}</div>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function currentCabinet() {
    const c = Cabinets.getById(state.ops.cabId);
    if (!c) {
      toast("电柜不存在");
      state.ops.cabView = "list";
      return null;
    }
    return c;
  }

  function cabSubHeader(title) {
    return `<div class="sites-header">
      <button type="button" class="sites-back" data-action="cab-sub-back" aria-label="返回">‹</button>
      <h1>${escapeHtml(title)}</h1>
      <div class="sites-header-spacer"></div>
    </div>`;
  }

  function renderCabinetDetail() {
    const c = currentCabinet();
    if (!c) return renderCabinetList();
    const st = Cabinets.isUnassigned(c) ? "未分配" : c.online ? "在线" : "离线";
    const admin = canMoveCabinets();
    const ops = canOperateCabinets();
    const iccidLine = c.iccid
      ? `${c.iccid}${c.carrier ? `<br><small>${escapeHtml(c.carrier)} · 到期 ${escapeHtml(c.expireDate || "—")}</small>` : ""}${
          c.iccidRefreshedAt ? `<br><small>已刷新 ${escapeHtml(c.iccidRefreshedAt)}</small>` : ""
        }`
      : "—";
    const qrCell = c.qrBound
      ? `${`<span class="cab-tag">已绑定</span>`}${
          ops
            ? `<div class="cab-link-row">
                <button type="button" data-action="cab-qr">查看二维码</button>
                <button type="button" data-action="cab-qr-replace">更换二维码</button>
              </div>`
            : ""
        }`
      : `<span class="cab-tag off">未绑定</span>${
          ops
            ? `<div class="cab-link-row"><button type="button" data-action="cab-qr-replace">绑定二维码</button></div>`
            : ""
        }`;
    const siteCell = `${escapeHtml(c.site)}${
      admin
        ? `<div class="cab-link-row"><button type="button" data-action="cab-move">移柜</button></div>`
        : ""
    }`;
    const swapCell = `<div class="cab-inline">
      <select id="cab-swap-mode"${ops ? "" : " disabled"}>
        ${Cabinets.SWAP_MODES.map(
          (m) =>
            `<option value="${escapeAttr(m)}" ${c.swapMode === m ? "selected" : ""}>${escapeHtml(m)}</option>`
        ).join("")}
      </select>
      ${ops ? `<button type="button" class="cab-mini" data-action="cab-swap-save">确认切换</button>` : ""}
    </div>`;
    const btCell = `<div class="cab-inline">
      <select id="cab-bt-type"${ops ? "" : " disabled"}>
        ${Cabinets.BT_TYPES.map(
          (m) =>
            `<option value="${escapeAttr(m)}" ${c.bluetoothType === m ? "selected" : ""}>${escapeHtml(m)}</option>`
        ).join("")}
      </select>
      ${ops ? `<button type="button" class="cab-mini" data-action="cab-bt-save">确认切换</button>` : ""}
    </div>`;
    const info = cabKvHtml([
      ["设备编号", c.deviceId],
      ["设备二维码", "", qrCell],
      ["通讯板编号", c.commBoardId || "—"],
      ["物联网卡编号", "", `${iccidLine}${
        ops && c.iccid
          ? `<div class="cab-link-row"><button type="button" data-action="cab-iccid-refresh">刷新</button></div>`
          : ""
      }`],
      ["设备名称", c.name],
      ["设备类型", c.deviceType || "换电柜"],
      ["设备通电状态", c.powerStatus],
      ["设备服务状态", c.serviceStatus || c.deviceStatus],
      ["硬件种类", c.hardwareType],
      ["硬件版本", c.hardwareVersion],
      ["软件版本", c.softwareVersion],
      ["BOOT版本", c.bootVersion],
      ["4G模组类型", c.module4gType],
      ["可换电池规格", c.exchangeableSpecs || "—"],
      ["已使用电量", c.usedPowerKwh != null ? String(c.usedPowerKwh) : "—"],
      ["投放地址", c.address || "—"],
      ["电柜 SN", c.sn],
      ["所属站点", "", siteCell],
      ["权属", Cabinets.ownershipLabel(c)],
      ["换电模式切换", "", swapCell],
      ["蓝牙类型", "", btCell],
      ["城市", c.city],
      ["仓口", String(c.slots)],
      ["在线", st],
      ["上次换电", c.lastSwap],
    ]);
    const alerts = Alerts.byDeviceSn(c.sn);
    const alertBody =
      alerts.length === 0
        ? `<p class="cab-empty">暂无本柜告警</p>`
        : alerts
            .map(
              (a) => `<button type="button" class="cab-alert" data-action="cab-alert-open" data-id="${escapeAttr(
                a.id
              )}">
          <div><strong>${escapeHtml(a.subtype)}</strong><span class="cab-tag ${
                a.severity === "高" ? "warn" : ""
              }">${escapeHtml(a.severity)}</span></div>
          <p>${escapeHtml(a.message)}</p>
          <small>${escapeHtml(a.raisedAt)} · ${escapeHtml(a.status)}</small>
        </button>`
            )
            .join("");
    const occ = Cabinets.occupiedCount(c);
    const enabled = (c.deviceStatus || "启用") === "启用";
    const ports = Cabinets.portRows(c);
    const openNo = Number(state.ops.cabPortOpen) || 0;
    const strip = ports
      .map((p) => {
        const on = openNo === p.portNo ? " on" : "";
        const busy = p.occupied ? " busy" : "";
        const lock = p.locked ? " lock" : "";
        return `<button type="button" class="cab-strip-btn${on}${busy}${lock}" data-action="cab-port-jump" data-port="${p.portNo}">${p.portNo}</button>`;
      })
      .join("");
    const doorCards = ports
      .map((p) => {
        const open = openNo === p.portNo;
        const soc = p.batSoc;
        const fill = soc == null ? 0 : Math.max(6, Math.min(100, soc));
        const empty = !p.occupied;
        const chargeTag = empty ? "空仓" : p.chargerOn ? "充电" : soc >= 95 ? "满电" : "在柜";
        const extraCmds = Cabinets.PORT_CMDS.filter((cmd) => cmd.extra)
          .map(
            (cmd) =>
              `<button type="button" class="cab-mini" data-action="cab-port-cmd" data-port="${p.portNo}" data-cmd="${cmd.id}">${escapeHtml(
                cmd.label
              )} ${cabP2()}</button>`
          )
          .join("");
        return `<article class="cab-door" id="cab-port-${p.portNo}">
          <div class="cab-door-top">
            <div class="cab-bat-visual ${empty ? "empty" : soc >= 95 ? "full" : p.chargerOn ? "chg" : ""}">
              <em>${empty ? "空" : soc + "%"}</em>
              <i style="height:${empty ? 8 : fill}%"></i>
            </div>
            <div class="cab-door-meta">
              <div class="cab-door-hd">
                <strong>${p.portNo} 仓</strong>
                <span class="cab-tag">${escapeHtml(chargeTag)}</span>
                <span class="cab-tag${p.doorOpen ? " warn" : ""}">${p.doorOpen ? "打开" : "关闭"}</span>
                <span class="cab-tag${p.locked ? " warn" : ""}">${p.locked ? "已锁" : "正常"}</span>
              </div>
              <p>电池 ${
                p.occupied ? batterySnButton(p.batSn) : "—"
              }</p>
              <p>服务 ${escapeHtml(p.portServiceStatus)} · ${escapeHtml(p.serviceType)}</p>
              ${p.locked && p.lockReason ? `<p class="cab-lock-why">锁因：${escapeHtml(p.lockReason)}</p>` : ""}
            </div>
          </div>
          ${
            ops
              ? `<div class="cab-door-ops">
            <button type="button" class="cab-door-open" data-action="cab-ask-open" data-port="${p.portNo}">开门</button>
            <button type="button" class="cab-door-lock" data-action="${
              p.locked ? "cab-unlock-port" : "cab-ask-lock"
            }" data-port="${p.portNo}">${p.locked ? "解锁" : "锁定"}</button>
          </div>`
              : ""
          }
          <button type="button" class="cab-door-more" data-action="cab-port-toggle-open" data-port="${p.portNo}">${
          open ? "收起字段 ▴" : "展开字段 ▾"
        }</button>
          ${
            open
              ? `<div class="cab-port-bd">
            ${cabKvHtml([
              ["端口状态", p.portStatus],
              ["服务类型", p.serviceType],
              ["端口电流/电压", `电流 ${p.current} / 电压 ${p.voltage}`],
              ["端口服务状态", p.portServiceStatus],
              ["已充电量/时长", `${p.chargedKwh} kWh / ${p.chargeMinutes} 分钟`],
              ["充电器开关", p.chargerOn ? "开" : "关"],
              ["充电器控制", `电流 ${p.chargerCurrent} / 电压 ${p.chargerVoltage}`],
              ["电池电流/电压/压差", `电流 ${p.batCurrent} / 电压 ${p.batVoltage} / 压差 ${p.batVoltageDiff}`],
              ["电池电量/健康", p.batSoc != null ? `${p.batSoc}% · ${p.batHealth}` : "—"],
              ["通讯板编号", p.batCommBoard],
              ["外壳码", p.batShellCode],
              ["电池温度最高/最低", p.batTempMax != null ? `${p.batTempMax}℃ / ${p.batTempMin}℃` : "—"],
            ])}
            ${
              ops
                ? `<div class="cab-port-ops">
              <button type="button" class="cab-mini" data-action="cab-port-toggle" data-port="${p.portNo}">切换服务状态 ${cabP2()}</button>
              ${extraCmds}
            </div>`
                : ""
            }
          </div>`
              : ""
          }
        </article>`;
      })
      .join("");
    const remoteBtns = Cabinets.REMOTE_CMDS.map((cmd) => {
      const danger = cmd.danger ? " danger" : "";
      return `<button type="button" class="cab-ops-btn${danger}" data-action="cab-remote" data-cmd="${escapeAttr(
        cmd.id
      )}">${escapeHtml(cmd.label)} ${cabP2()}</button>`;
    }).join("");
    const detailTab =
      state.ops.cabDetailTab === "charge" ? "cabinet" : state.ops.cabDetailTab || "cabinet";
    const tabBar = CAB_DETAIL_TABS.map((t) => {
      const on = detailTab === t.id ? " active" : "";
      return `<button type="button" class="cab-detail-tab${on}" data-action="cab-detail-tab" data-tab="${t.id}">${escapeHtml(
        t.label
      )}</button>`;
    }).join("");
    const hero = `<section class="cab-hero">
            <div class="cab-hero-hd">
              <div>
                <strong>${escapeHtml(c.name || c.sn)}</strong>
                <div class="cab-list-tags">
                  <span class="cab-tag${enabled ? "" : " off"}">${escapeHtml(
      c.deviceStatus || "启用"
    )}</span>
                  <span class="sites-status ${
                    Cabinets.isUnassigned(c) ? "off" : c.online ? "ok" : "warn"
                  }">${escapeHtml(st)}</span>
                </div>
              </div>
            </div>
            <div class="sites-card-rows cab-hero-rows">
              <div><span>电柜 SN</span><em>${escapeHtml(c.sn)}</em></div>
              <div><span>在柜电池</span><em>${occ} / ${c.slots}</em></div>
              <div><span>通电</span><em>${escapeHtml(c.powerStatus)}</em></div>
              <div><span>已用电量</span><em>${c.usedPowerKwh != null ? c.usedPowerKwh : "—"}</em></div>
              <div><span>站点</span><em>${escapeHtml(c.site)}</em></div>
              <div><span>地址</span><em>${escapeHtml(c.address || "—")}</em></div>
            </div>
            ${
              ops
                ? `<div class="cab-hero-ops">
              <button type="button" class="cab-hero-btn" data-action="cab-refresh">刷新</button>
              <button type="button" class="cab-hero-btn warn" data-action="cab-ask-open-all">一键开仓</button>
              <button type="button" class="cab-hero-btn danger" data-action="cab-ask-lock-all">锁定</button>
            </div>`
                : ""
            }
            ${c.lastRefreshAt ? `<p class="cab-empty">上次刷新 ${escapeHtml(c.lastRefreshAt)}</p>` : ""}
          </section>`;
    let tabBody = "";
    if (detailTab === "cabinet") {
      tabBody = hero;
    } else if (detailTab === "slots") {
      tabBody = `<section class="cab-hero cab-slot-hero">
            <div class="cab-strip" role="tablist">${strip}</div>
            <p class="cab-empty">共 ${ports.length} 仓 · 蓝=在柜 · 橙=已锁</p>
          </section>
          <div class="cab-door-list">${doorCards}</div>`;
    } else if (detailTab === "basic") {
      tabBody = cabSec("基础信息", `<span>${escapeHtml(c.deviceId || c.sn)} · ${escapeHtml(st)}</span>`, info);
    } else {
      tabBody = `${
        ops
          ? cabSec(
              "更多运维",
              cabP2(),
              `<p class="cab-empty">快照 / 风扇 / 通断电等仍标二期，可浏览。</p><div class="cab-ops-grid">${remoteBtns}</div>`
            )
          : ""
      }
          ${cabSec("设备告警", `<span>本柜 IoT</span>`, alertBody)}
          ${cabSec(
            "更多",
            "",
            `<button type="button" class="sites-phase2-item" data-action="cab-compose">电柜组成${cabP2()}</button>
             <button type="button" class="sites-phase2-item" data-action="cab-history">历史记录</button>
             <button type="button" class="sites-phase2-item" data-action="cab-swaps">换电记录</button>`
          )}`;
    }
    return `
      <div class="sites-page cab-detail-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="cab-back-list" aria-label="返回">‹</button>
          <h1>${escapeHtml(c.sn)}</h1>
          ${
            admin
              ? `<button type="button" class="sites-header-btn" data-action="cab-edit">编辑</button>`
              : `<div class="sites-header-spacer"></div>`
          }
        </div>
        <div class="cab-detail-tabs" role="tablist">${tabBar}</div>
        <div class="sites-detail-body">${tabBody}</div>
        ${renderCabDialog()}
      </div>`;
  }

  function renderCabDialog() {
    const dlg = state.ops.cabDialog;
    if (!dlg) return "";
    if (dlg.kind === "unbind") {
      const c = Cabinets.getById(state.ops.cabId);
      const siteName = c && !Cabinets.isUnassigned(c) ? c.site : "当前站点";
      const sn = (c && c.sn) || "";
      return `
      <div class="lease-dialog-mask" data-action="cab-dialog-mask">
        <div class="lease-dialog" role="dialog" aria-modal="true">
          <h3>确认解绑站点</h3>
          <p>确认将 <strong>${escapeHtml(sn)}</strong> 从「${escapeHtml(
            siteName
          )}」解绑？</p>
          <p>解绑后为未分配，才能绑定新站。电池不随站迁移。</p>
          <div class="lease-dialog-actions">
            <button type="button" class="sites-footer-ghost" data-action="cab-dialog-cancel">取消</button>
            <button type="button" class="sites-footer-primary" data-action="cab-dialog-ok">确认解绑</button>
          </div>
        </div>
      </div>`;
    }
    if (dlg.kind === "bind") {
      const siteName = dlg.site || "";
      const c = Cabinets.getById(state.ops.cabId);
      const sn = (c && c.sn) || "";
      return `
      <div class="lease-dialog-mask" data-action="cab-dialog-mask">
        <div class="lease-dialog" role="dialog" aria-modal="true">
          <h3>确认绑定站点</h3>
          <p>确认将 <strong>${escapeHtml(sn)}</strong> 绑定到「${escapeHtml(
            siteName
          )}」？</p>
          <p>须已解绑。电池不随站绑定。</p>
          <div class="lease-dialog-actions">
            <button type="button" class="sites-footer-ghost" data-action="cab-dialog-cancel">取消</button>
            <button type="button" class="sites-footer-primary" data-action="cab-dialog-ok">确认绑定</button>
          </div>
        </div>
      </div>`;
    }
    if (dlg.kind === "openPort" || dlg.kind === "openAll") {
      const title = dlg.kind === "openAll" ? "确定打开全部仓门？" : `确定打开 ${dlg.portNo} 号柜门？`;
      return `
      <div class="lease-dialog-mask" data-action="cab-dialog-mask">
        <div class="lease-dialog" role="dialog" aria-modal="true">
          <h3>信息</h3>
          <p>${escapeHtml(title)}</p>
          <div class="lease-dialog-actions">
            <button type="button" class="lease-footer-ghost" data-action="cab-dialog-cancel">取消</button>
            <button type="button" class="lease-footer-primary" data-action="cab-dialog-ok">确定</button>
          </div>
        </div>
      </div>`;
    }
    const who = dlg.kind === "lockAll" ? "全部仓门" : `${dlg.portNo} 号仓`;
    return `
      <div class="lease-dialog-mask" data-action="cab-dialog-mask">
        <div class="lease-dialog" role="dialog" aria-modal="true">
          <h3>锁仓原因</h3>
          <p>锁定${escapeHtml(who)}</p>
          <input id="cab-lock-reason" type="text" class="cab-lock-input" value="${escapeAttr(
            dlg.reason || ""
          )}" placeholder="请输入锁仓原因" />
          <div class="lease-dialog-actions">
            <button type="button" class="lease-footer-ghost" data-action="cab-dialog-cancel">取消</button>
            <button type="button" class="lease-footer-primary" data-action="cab-dialog-ok">确定</button>
          </div>
        </div>
      </div>`;
  }

  function renderCabinetSwapLog() {
    const c = currentCabinet();
    if (!c) return renderCabinetList();
    const tab = state.ops.cabSwapTab || "all";
    const kw = state.ops.cabSwapKw || "";
    const list = Cabinets.filterSwapLogs(c.sn, { tab, keyword: kw });
    const tabs = Cabinets.SWAP_TABS.map((t) => {
      const active = tab === t.id ? " active" : "";
      return `<button type="button" class="sites-tab${active}" data-action="cab-swap-tab" data-tab="${t.id}">${escapeHtml(
        t.label
      )}</button>`;
    }).join("");
    const cards =
      list.length === 0
        ? `<div class="empty-full"><div class="icon">🔁</div>暂无换电记录</div>`
        : list
            .map((r) => {
              const st = Cabinets.SWAP_STATUS[r.status] || Cabinets.SWAP_STATUS.success;
              const cls = r.status === "fail" ? "off" : r.status === "doing" ? "warn" : "ok";
              const batIn = r.batIn
                ? `${batterySnButton(r.batIn.sn)}${r.batIn.soc != null ? ` · ${r.batIn.soc}%` : ""}`
                : "—";
              const batOut = r.batOut
                ? `${batterySnButton(r.batOut.sn)}${r.batOut.soc != null ? ` · ${r.batOut.soc}%` : ""}`
                : "—";
              return `<article class="lease-card">
          <div class="lease-card-hd">
            <div class="lease-user"><strong>${escapeHtml(r.userName)}</strong><span>${escapeHtml(
                r.phone
              )}</span></div>
            <span class="sites-status ${cls}">${escapeHtml(st.label)}</span>
          </div>
          <div class="lease-fields">
            <div class="lease-row"><span class="lk">电柜 SN</span><span class="lv">${escapeHtml(r.cabinetSn)}</span></div>
            <div class="lease-row"><span class="lk">业务</span><span class="lv">${escapeHtml(r.biz)}</span></div>
            <div class="lease-row"><span class="lk">能耗</span><span class="lv">${escapeHtml(r.kwh)} 度</span></div>
            <div class="lease-row"><span class="lk">业务流程码</span><span class="lv">${escapeHtml(r.flowNo)}</span></div>
            <div class="lease-row"><span class="lk">换入电池</span><span class="lv">${batIn}</span></div>
            <div class="lease-row"><span class="lk">换出电池</span><span class="lv">${batOut}</span></div>
            <div class="lease-row"><span class="lk">还电格口</span><span class="lv">${
              r.batIn && r.batIn.slot != null ? r.batIn.slot : "—"
            }</span></div>
            <div class="lease-row"><span class="lk">取电格口</span><span class="lv">${
              r.batOut && r.batOut.slot != null ? r.batOut.slot : "—"
            }</span></div>
            <div class="lease-row"><span class="lk">用时</span><span class="lv">${
              r.durationSec == null ? "—" : r.durationSec + "秒"
            }</span></div>
            <div class="lease-row"><span class="lk">开始时间</span><span class="lv">${escapeHtml(
              r.startAt || "—"
            )}</span></div>
            <div class="lease-row"><span class="lk">结束时间</span><span class="lv">${escapeHtml(
              r.endAt || "—"
            )}</span></div>
            <div class="lease-row"><span class="lk">换电结果</span><span class="lv">${escapeHtml(
              Cabinets.swapResultText(r)
            )}</span></div>
          </div>
          <div class="cab-list-ops">
            <button type="button" data-action="cab-swap-detail" data-id="${escapeAttr(
              r.id
            )}">查看详情</button>
          </div>
        </article>`;
            })
            .join("");
    return `
      <div class="sites-page">
        ${cabSubHeader("机柜换电记录")}
        <div class="sites-filters">
          <div class="sites-search-row">
            <input id="cab-swap-kw" type="search" value="${escapeAttr(
              kw
            )}" placeholder="用户名 / 手机号 / 电池编号" />
            <button type="button" class="sites-confirm" data-action="cab-swap-search">确定</button>
          </div>
        </div>
        <div class="sites-tabs">${tabs}</div>
        <div class="sites-list">${cards}</div>
      </div>`;
  }

  function renderCabinetSwapDetail() {
    const c = currentCabinet();
    const r = Cabinets.getSwapById(state.ops.cabSwapId);
    if (!c || !r) {
      state.ops.cabView = "swaplog";
      return renderCabinetSwapLog();
    }
    const st = Cabinets.SWAP_STATUS[r.status] || Cabinets.SWAP_STATUS.success;
    const batIn = r.batIn
      ? `${batterySnButton(r.batIn.sn)}${r.batIn.soc != null ? ` · SOC ${r.batIn.soc}%` : ""}`
      : "—";
    const batOut = r.batOut
      ? `${batterySnButton(r.batOut.sn)}${r.batOut.soc != null ? ` · SOC ${r.batOut.soc}%` : ""}`
      : "—";
    return `
      <div class="sites-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="cab-swap-back" aria-label="返回">‹</button>
          <h1>换电记录详情</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <div class="sites-detail-body">
          <article class="lease-card">
            <div class="lease-card-hd">
              <div class="lease-user"><strong>${escapeHtml(r.userName)}</strong><span>${escapeHtml(
      r.phone
    )}</span></div>
              <span class="sites-status ${
                r.status === "fail" ? "off" : r.status === "doing" ? "warn" : "ok"
              }">${escapeHtml(st.label)}</span>
            </div>
            <div class="lease-fields">
              <div class="lease-row"><span class="lk">电柜 SN</span><span class="lv">${escapeHtml(
                r.cabinetSn
              )}</span></div>
              <div class="lease-row"><span class="lk">业务</span><span class="lv">${escapeHtml(r.biz)}</span></div>
              <div class="lease-row"><span class="lk">能耗</span><span class="lv">${escapeHtml(r.kwh)} 度</span></div>
              <div class="lease-row"><span class="lk">业务流程码</span><span class="lv">${escapeHtml(
                r.flowNo
              )}</span></div>
              <div class="lease-row"><span class="lk">换入电池</span><span class="lv">${batIn}</span></div>
              <div class="lease-row"><span class="lk">换出电池</span><span class="lv">${batOut}</span></div>
              <div class="lease-row"><span class="lk">还电格口</span><span class="lv">${
                r.batIn && r.batIn.slot != null ? r.batIn.slot : "—"
              }</span></div>
              <div class="lease-row"><span class="lk">取电格口</span><span class="lv">${
                r.batOut && r.batOut.slot != null ? r.batOut.slot : "—"
              }</span></div>
              <div class="lease-row"><span class="lk">用时</span><span class="lv">${
                r.durationSec == null ? "—" : r.durationSec + "秒"
              }</span></div>
              <div class="lease-row"><span class="lk">开始时间</span><span class="lv">${escapeHtml(
                r.startAt || "—"
              )}</span></div>
              <div class="lease-row"><span class="lk">结束时间</span><span class="lv">${escapeHtml(
                r.endAt || "—"
              )}</span></div>
              <div class="lease-row"><span class="lk">换电结果</span><span class="lv">${escapeHtml(
                Cabinets.swapResultText(r)
              )}</span></div>
            </div>
          </article>
        </div>
      </div>`;
  }

  function cabBindSiteSelect(c) {
    const cur = state.ops.cabSite || (Cabinets.bindSiteOptions()[0] && Cabinets.bindSiteOptions()[0].id) || "";
    const opts = Cabinets.bindSiteOptions()
      .map(
        (s) =>
          `<option value="${escapeAttr(s.id)}" ${s.id === cur ? "selected" : ""}>${escapeHtml(
            s.label
          )}</option>`
      )
      .join("");
    const assigned = !Cabinets.isUnassigned(c);
    if (assigned) {
      return `
          <label class="sites-field">所属站点
            <input type="text" value="${escapeAttr(c.site)}" readonly />
          </label>
          <p class="sites-hint">改站须先<strong>确认解绑</strong>，再绑定新站。不能从本站直接改到另一站。电池不随站绑定。</p>
          <button type="button" class="cab-site-act" data-action="cab-unbind-open">解绑站点</button>`;
    }
    return `
          <label class="sites-field">所属站点
            <input type="text" value="未分配站点" readonly />
          </label>
          <p class="sites-hint">已解绑。选择站点后确认绑定。</p>
          <label class="sites-field">绑定到
            <select id="cab-bind-site">${opts}</select>
          </label>
          <button type="button" class="cab-site-act primary" data-action="cab-bind-open">绑定站点</button>`;
  }

  function renderCabinetMove() {
    const c = Cabinets.getById(state.ops.cabId);
    if (!c) {
      state.ops.cabView = "list";
      return renderCabinetList();
    }
    return `
      <div class="sites-page sites-page-form">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="cab-back-detail" aria-label="返回">‹</button>
          <h1>移柜</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <div class="sites-form-body">
          <label class="sites-field">当前电柜
            <input type="text" value="${escapeAttr(c.sn + " · " + (c.name || ""))}" readonly />
          </label>
          ${cabBindSiteSelect(c)}
        </div>
        ${renderCabDialog()}
      </div>`;
  }

  function renderCabinetEdit() {
    const c = currentCabinet();
    if (!c) return renderCabinetList();
    if (!canMoveCabinets()) {
      toast("无编辑权限");
      return renderCabinetDetail();
    }
    const opts = Cabinets.DEVICE_STATUSES.map(
      (s) =>
        `<option value="${escapeAttr(s)}" ${c.deviceStatus === s ? "selected" : ""}>${escapeHtml(s)}</option>`
    ).join("");
    return `
      <div class="sites-page sites-page-form">
        ${cabSubHeader("编辑换电柜")}
        <div class="sites-form-body">
          <label class="sites-field">设备名称
            <input id="cab-edit-name" type="text" value="${escapeAttr(c.name || "")}" placeholder="如 浦东1号柜" />
          </label>
          <label class="sites-field">投放地址
            <input id="cab-edit-addr" type="text" value="${escapeAttr(c.address || "")}" placeholder="${
      Cabinets.isUnassigned(c) ? "未投放，可空" : ""
    }" />
          </label>
          ${cabBindSiteSelect(c)}
          <label class="sites-field">设备状态
            <select id="cab-edit-status">${opts}</select>
          </label>
        </div>
        <div class="sites-footer-bar">
          <button type="button" class="sites-footer-ghost" data-action="cab-back-detail">取消</button>
          <button type="button" class="sites-footer-primary" data-action="cab-edit-save">保存</button>
        </div>
        ${renderCabDialog()}
      </div>`;
  }

  function renderCabinetCompose() {
    const c = currentCabinet();
    if (!c) return renderCabinetList();
    const mods = c.slotModules || [];
    const slots = Cabinets.slotSnapshot(c);
    const table = mods
      .map(
        (m) =>
          `<div class="sites-kv cab-kv"><span>${escapeHtml(m.id)}</span><em>${escapeHtml(m.type)} · ${
            m.slots
          } 仓 · ${escapeHtml(m.fw)}</em></div>`
      )
      .join("");
    const grid = slots
      .map((s) => `<i class="${s.on ? "on" : ""}">${escapeHtml(s.label)}</i>`)
      .join("");
    return `
      <div class="sites-page">
        ${cabSubHeader("电柜组成")}
        <div class="sites-detail-body">
          <p class="sites-hint">${cabP2()} 一期不交付；可浏览模块与格口快照。</p>
          ${cabKvHtml([
            ["通讯板", c.commBoardId || "—"],
            ["ICCID", c.iccid || "—"],
            ["在线", c.online ? "在线" : "离线"],
            ["仓口总数", String(c.slots)],
          ])}
          ${cabSec("模块清单", `<span>${mods.length} 个</span>`, `<div class="sites-kv-block cab-kv-block">${table || "<p class='cab-empty'>暂无模块</p>"}</div>`)}
          ${cabSec("格口快照", "", `<div class="cab-slot-grid">${grid}</div>
            ${
              canOperateCabinets()
                ? `<div class="cab-link-row" style="padding:8px 0 0">
                    <button type="button" class="cab-mini" data-action="cab-compose-ops" data-ops="slot">隔口开关 ${cabP2()}</button>
                    <button type="button" class="cab-mini" data-action="cab-compose-ops" data-ops="power">上下电 ${cabP2()}</button>
                  </div>`
                : ""
            }`)}
        </div>
      </div>`;
  }

  function renderCabinetOpsLog() {
    const c = currentCabinet();
    if (!c) return renderCabinetList();
    const rows = Cabinets.opsLogs(c.sn);
    const list =
      rows.length === 0
        ? `<p class="cab-empty">暂无运维记录</p>`
        : rows
            .map(
              (r) => `<div class="cab-log">
          <strong>${escapeHtml(r.op)}</strong>
          <span>${escapeHtml(r.result)}</span>
          <p>端口 ${escapeHtml(r.port)} · ${escapeHtml(r.by)}</p>
          <small>${escapeHtml(r.time)}</small>
        </div>`
            )
            .join("");
    return `
      <div class="sites-page">
        ${cabSubHeader("历史记录")}
        <div class="sites-detail-body">
          <p class="sites-hint">本柜远程开门 / 锁定 / 刷新等操作留痕。数字为 Mock。</p>
          ${list}
        </div>
      </div>`;
  }

  function renderCabinetQr() {
    const c = currentCabinet();
    if (!c) return renderCabinetList();
    const cells = Array.from({ length: 49 }, (_, i) => {
      const on = (c.sn.charCodeAt(i % c.sn.length) + i) % 3 !== 0;
      return `<i class="${on ? "on" : ""}"></i>`;
    }).join("");
    return `
      <div class="sites-page">
        ${cabSubHeader("设备二维码")}
        <div class="sites-detail-body">
          <p class="sites-hint">${c.qrBound ? "已绑定" : "未绑定"}${
      c.qrReplacedAt ? ` · 更换于 ${escapeHtml(c.qrReplacedAt)}` : ""
    }</p>
          <div class="cab-qr" aria-hidden="true">${cells}</div>
          <p class="cab-empty">锂电快换 · ${escapeHtml(c.sn)}</p>
          ${
            canOperateCabinets()
              ? `<button type="button" class="btn-primary" style="margin-top:16px" data-action="cab-qr-replace">更换二维码</button>`
              : ""
          }
        </div>
      </div>`;
  }

  function renderCabinetSnapshot() {
    const c = currentCabinet();
    if (!c) return renderCabinetList();
    const device = state.ops.cabSnapType === "device";
    const slots = Cabinets.slotSnapshot(c);
    const grid = slots
      .map((s) => `<i class="${s.on ? "on" : ""}">${escapeHtml(s.label)}</i>`)
      .join("");
    const body = device
      ? cabKvHtml([
          ["硬件种类", c.hardwareType],
          ["硬件版本", c.hardwareVersion],
          ["软件版本", c.softwareVersion],
          ["BOOT版本", c.bootVersion],
          ["4G模组", c.module4gType],
          ["通电", c.powerStatus],
          ["在线", c.online ? "在线" : "离线"],
        ])
      : `${cabKvHtml([
          ["SN", c.sn],
          ["站点", c.site],
          ["通电", c.powerStatus],
          ["仓口占用", `${slots.filter((s) => s.on).length} / ${c.slots}`],
        ])}<div class="cab-slot-grid">${grid}</div>`;
    return `
      <div class="sites-page">
        ${cabSubHeader(device ? "设备快照" : "电柜快照")}
        <div class="sites-detail-body">
          <p class="sites-hint">${cabP2()} 原型演示快照，非实时 IoT。</p>
          ${body}
        </div>
      </div>`;
  }

  function openCabinetDetail(id) {
    const c = Cabinets.getById(id);
    if (!c) {
      toast("电柜不存在");
      return;
    }
    const root = els.screenRoot;
    if (root) state.ops.listScroll = root.scrollTop;
    state.ops.cabId = id;
    state.ops.cabView = "detail";
    state.ops.cabReturn = "detail";
    state.ops.cabPortOpen = 1;
    state.ops.cabDetailTab = "cabinet";
    state.screen = "cabinets";
    track("cab_open", { sn: c.sn });
    render();
  }

  function openCabinetList() {
    state.ops.cabView = "list";
    state.ops.cabId = null;
    state.screen = "cabinets";
    render();
    requestAnimationFrame(() => {
      if (els.screenRoot) els.screenRoot.scrollTop = state.ops.listScroll || 0;
    });
  }

  function showTabBar() {
    const hide =
      !state.session ||
      state.screen === "login" ||
      state.screen === "pickRole" ||
      state.screen === "placeholder" ||
      state.screen === "leaseOrders" ||
      state.screen === "leaseSub" ||
      state.screen === "daypoolOrders" ||
      state.screen === "daypoolSub" ||
      state.screen === "sites" ||
      state.screen === "bizStats" ||
      state.screen === "cabinets" ||
      state.screen === "deviceStats" ||
      state.screen === "userList" ||
      state.screen === "userSms" ||
      state.screen === "userPay" ||
      state.screen === "financeAccount" ||
      state.screen === "packageOrders" ||
      state.screen === "batteryDetail" ||
      (state.screen === "todos" && state.todos.type) ||
      state.screen === "alerts" ||
      state.screen === "messages" ||
      state.screen === "msgDetail" ||
      state.screen === "about" ||
      state.screen === "account";
    els.tabBar.classList.toggle("hidden", hide);

    const inboxN = pendingInboxCount();
    const badge = els.tabBar.querySelector("[data-tab-badge]");
    if (badge) {
      if (inboxN > 0 && !hide) {
        badge.textContent = inboxN > 99 ? "99+" : String(inboxN);
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }

    els.tabBar.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === state.tab);
    });
  }

  function renderScreen() {
    let html = "";
    switch (state.screen) {
      case "login":
        html = renderLogin();
        break;
      case "pickRole":
        html = renderPickRole();
        break;
      case "dataStats":
        html = renderDataStats();
        break;
      case "workbench":
        html = renderWorkbench();
        break;
      case "todosHub":
        html = renderTodosHub();
        break;
      case "messages":
        html = renderMessages();
        break;
      case "mine":
        html = renderMine();
        break;
      case "msgDetail":
        html = renderMsgDetail();
        break;
      case "about":
        html = renderAbout();
        break;
      case "account":
        html = renderAccount();
        break;
      case "placeholder":
        html = renderPlaceholder();
        break;
      case "leaseOrders":
        html = renderLeaseOrders();
        break;
      case "leaseSub":
        html = renderLeaseSub();
        break;
      case "daypoolOrders":
        html = renderDaypoolOrders();
        break;
      case "daypoolSub":
        html = renderDaypoolSub();
        break;
      case "sites":
        html = renderSites();
        break;
      case "bizStats":
        html = renderBizStats();
        break;
      case "cabinets":
        html = renderCabinets();
        break;
      case "deviceStats":
        html = renderDeviceStats();
        break;
      case "userList":
        html = renderUserList();
        break;
      case "userSms":
        html = renderUserSms();
        break;
      case "userPay":
        html = renderUserPay();
        break;
      case "financeAccount":
        html = renderFinanceAccount();
        break;
      case "packageOrders":
        html = renderPackageOrders();
        break;
      case "batteryDetail":
        html = renderBatteryDetail();
        break;
      case "todos":
        html = renderTodos();
        break;
      case "alerts":
        html = renderAlerts();
        break;
      default:
        html = renderLogin();
    }
    els.screenRoot.innerHTML = html;
    bindScreenInputs();
  }

  function bindScreenInputs() {
    const phone = $("login-phone");
    const pwd = $("login-password");
    const agree = $("login-agree");
    if (phone) {
      phone.addEventListener("input", () => {
        state.loginPhone = phone.value;
      });
    }
    if (pwd) {
      pwd.addEventListener("input", () => {
        state.loginPassword = pwd.value;
      });
    }
    if (agree) {
      agree.addEventListener("change", () => {
        state.agree = agree.checked;
      });
    }

    const leaseType = $("lease-search-type");
    const leaseKw = $("lease-keyword");
    const leaseSite = $("lease-site");
    if (leaseType) {
      leaseType.addEventListener("change", () => {
        state.lease.searchType = leaseType.value;
        const meta = leaseSearchMeta();
        if (leaseKw) leaseKw.placeholder = meta.placeholder;
        track("lease_search_type", { type: state.lease.searchType });
      });
    }
    if (leaseKw) {
      leaseKw.addEventListener("input", () => {
        state.lease.keyword = leaseKw.value;
      });
      leaseKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("lease_search", { keyword: state.lease.keyword });
          render();
        }
      });
    }
    if (leaseSite) {
      leaseSite.addEventListener("change", () => {
        state.lease.siteId = leaseSite.value;
        track("lease_site_filter", { site: state.lease.siteId });
        render();
      });
    }

    const dpType = $("daypool-search-type");
    const dpKw = $("daypool-keyword");
    const dpSite = $("daypool-site");
    if (dpType) {
      dpType.addEventListener("change", () => {
        state.daypool.searchType = dpType.value;
        const meta = daypoolSearchMeta();
        if (dpKw) dpKw.placeholder = meta.placeholder;
        track("daypool_search_type", { type: state.daypool.searchType });
      });
    }
    if (dpKw) {
      dpKw.addEventListener("input", () => {
        state.daypool.keyword = dpKw.value;
      });
      dpKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("daypool_search", { keyword: state.daypool.keyword });
          render();
        }
      });
    }
    if (dpSite) {
      dpSite.addEventListener("change", () => {
        state.daypool.siteId = dpSite.value;
        track("daypool_site_filter", { site: state.daypool.siteId });
        render();
      });
    }

    const sitesKw = $("sites-keyword");
    if (sitesKw) {
      sitesKw.addEventListener("input", () => {
        state.sites.keyword = sitesKw.value;
      });
      sitesKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("sites_search", { keyword: state.sites.keyword });
          render();
        }
      });
    }

    const cabKw = $("cab-keyword");
    if (cabKw) {
      cabKw.addEventListener("input", () => {
        state.ops.cabKeyword = cabKw.value;
      });
      cabKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("cab_search", { keyword: state.ops.cabKeyword, site: state.ops.cabFilterSite });
          render();
        }
      });
    }

    const cabSite = $("cab-filter-site");
    if (cabSite) {
      cabSite.addEventListener("change", () => {
        state.ops.cabFilterSite = cabSite.value || "all";
        track("cab_site_filter", { site: state.ops.cabFilterSite });
        render();
      });
    }

    const cabSwapKw = $("cab-swap-kw");
    if (cabSwapKw) {
      cabSwapKw.addEventListener("input", () => {
        state.ops.cabSwapKw = cabSwapKw.value;
      });
      cabSwapKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          render();
        }
      });
    }

    const lockReason = $("cab-lock-reason");
    if (lockReason) {
      lockReason.addEventListener("input", () => {
        if (state.ops.cabDialog) state.ops.cabDialog.reason = lockReason.value;
      });
    }

    const cabBind = $("cab-bind-site");
    if (cabBind) {
      cabBind.addEventListener("change", () => {
        state.ops.cabSite = cabBind.value;
      });
    }

    const mapQuery = $("sites-map-query");
    if (mapQuery) {
      mapQuery.addEventListener("input", () => {
        state.sites.mapQuery = mapQuery.value;
      });
      mapQuery.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submitSiteMapSearch();
        }
      });
    }

    const mapCanvas = $("sites-map-canvas");
    if (mapCanvas) {
      mapCanvas.addEventListener("click", (e) => {
        if (e.target.closest("[data-action]")) return;
        const rect = mapCanvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const hit = Sites.tapMapToCoord(x, y, state.sites.form, state.sites.mapZoom);
        applySiteMapPick(hit, "tap");
      });
    }

    const photoFile = $("sites-photo-file");
    if (photoFile) {
      photoFile.addEventListener("change", () => {
        addSitePhotoFiles(photoFile.files);
        photoFile.value = "";
      });
    }

    els.screenRoot.querySelectorAll("[data-sites-key]").forEach((el) => {
      const key = el.dataset.sitesKey;
      el.addEventListener(
        el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "input",
        () => {
          state.sites.form[key] = el.value;
          if (key === "city" || key === "type") render();
        }
      );
    });

    els.screenRoot.querySelectorAll("[data-form-key]").forEach((el) => {
      const key = el.dataset.formKey;
      const form =
        el.dataset.formScope === "daypool" ? state.daypool.form : state.lease.form;
      el.addEventListener(el.tagName === "TEXTAREA" || el.type === "text" || el.type === "search" ? "input" : "change", () => {
        if (el.type === "radio") {
          if (el.checked) {
            form[key] = el.value;
            if (key === "depositMode" || key === "overdueFeeMode" || key === "op") render();
          }
          return;
        }
        form[key] = el.value;
      });
    });

    els.screenRoot.querySelectorAll("[data-todo-key]").forEach((el) => {
      const key = el.dataset.todoKey;
      el.addEventListener("input", () => {
        state.todos.form[key] = el.value;
      });
    });

    const rejectReason = $("todo-reject-reason");
    if (rejectReason) {
      rejectReason.addEventListener("input", () => {
        state.todos.rejectReason = rejectReason.value;
      });
    }

    const userKw = $("user-kw");
    if (userKw) {
      userKw.addEventListener("input", () => {
        state.users.kw = userKw.value;
      });
      userKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("users_search", { kw: state.users.kw });
          render();
        }
      });
    }
    const smsKw = $("sms-kw");
    if (smsKw) {
      smsKw.addEventListener("input", () => {
        state.users.smsKw = smsKw.value;
      });
      smsKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("sms_search", { kw: state.users.smsKw });
          render();
        }
      });
    }

    const payKw = $("pay-kw");
    if (payKw) {
      payKw.addEventListener("input", () => {
        state.users.payKw = payKw.value;
      });
      payKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("pay_search", { kw: state.users.payKw, tab: state.users.payTab });
          render();
        }
      });
    }
    const pkgKw = $("pkg-kw");
    if (pkgKw) {
      pkgKw.addEventListener("input", () => {
        state.packageOrders.kw = pkgKw.value;
      });
      pkgKw.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          track("pkg_search", { kw: state.packageOrders.kw, tab: state.packageOrders.tab });
          render();
        }
      });
    }

    const finAmt = $("fin-apply-amount");
    if (finAmt) {
      finAmt.addEventListener("input", () => {
        state.finance.applyAmount = finAmt.value;
      });
    }
  }

  function renderPageSpec() {
    const Specs = window.OperatorAppPageSpecs;
    const title = $("spec-title");
    const source = $("spec-source");
    const note = $("spec-note");
    const body = $("spec-body");
    if (!Specs || !body) return;
    const spec = Specs.getSpec(state);
    if (title) title.textContent = spec.title || "本页";
    if (source) source.textContent = spec.source || "PC 一期";
    if (note) note.textContent = spec.note || "";
    const block = (h, rows) => {
      if (!rows || !rows.length) return "";
      const items = rows
        .map((r) => {
          if (typeof r === "string") {
            return `<div class="spec-row"><dt></dt><dd>${escapeHtml(r)}</dd></div>`;
          }
          return `<div class="spec-row"><dt>${escapeHtml(r.name)}</dt><dd>${escapeHtml(
            r.def
          )}</dd></div>`;
        })
        .join("");
      return `<div class="spec-sec"><h3>${escapeHtml(h)}</h3>${items}</div>`;
    };
    body.innerHTML =
      block("统计定义", spec.stats) +
      block("字段", spec.fields) +
      block("枚举", spec.enums) +
      `<div class="spec-meta">
        <div><strong>空态</strong>　${escapeHtml(spec.empty || "—")}</div>
        <div><strong>错误</strong>　${escapeHtml(spec.error || "—")}</div>
        <div><strong>权限</strong>　${escapeHtml(spec.roles || "—")}</div>
      </div>`;
  }

  function renderInspector() {
    renderPageSpec();
    const pill = $("status-pill");
    const title = $("status-title");
    const list = $("state-list");
    const s = state.session;
    title.textContent = SCENARIOS[state.activeScenario]
      ? SCENARIOS[state.activeScenario].label
      : state.screen;
    pill.textContent = state.screen;
    pill.className =
      "status-pill " +
      (state.session ? "ok" : state.loginError ? "warn" : "neutral");

    list.innerHTML = `
      <div><dt>会话</dt><dd>${s ? "已登录" : "未登录"}</dd></div>
      <div><dt>角色</dt><dd>${s ? escapeHtml(s.roleLabel) : "—"}</dd></div>
      <div><dt>宫格数</dt><dd>${s ? visibleModules().length : "—"}</dd></div>
      <div><dt>注册表条目</dt><dd>${MODULE_REGISTRY.length}</dd></div>
      <div><dt>未读消息</dt><dd>${unreadCount()}</dd></div>
      <div><dt>待办</dt><dd>${
        s ? Todos.totalCount(s.role, { forceEmpty: state.forceEmptyGrid }) : "—"
      }</dd></div>
      <div><dt>警告</dt><dd>${
        s ? Alerts.totalCount({ forceEmpty: state.forceEmptyGrid }) : "—"
      }</dd></div>
      <div><dt>空宫格</dt><dd>${state.forceEmptyGrid ? "是" : "否"}</dd></div>
      <div><dt>弱网</dt><dd>${state.loadError ? "是" : "否"}</dd></div>
    `;
  }

  function renderEventLog() {
    const body = $("event-log-body");
    const count = $("event-count");
    if (!body) return;
    count.textContent = state.events.length + " 条";
    body.innerHTML = state.events
      .map(
        (e) => `
      <tr>
        <td>${escapeHtml(e.time)}</td>
        <td>${escapeHtml(e.name)}</td>
        <td>${escapeHtml(e.props)}</td>
      </tr>`
      )
      .join("");
  }

  function render() {
    renderScreen();
    showTabBar();
    renderInspector();
    const timeEl = $("status-time");
    if (timeEl) {
      timeEl.textContent = new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(str) {
    return escapeHtml(str);
  }

  function onClick(e) {
    const t = e.target.closest("[data-action]");
    if (t) {
      const action = t.dataset.action;
      if (action !== "order-menu" && state.lease.menuKey) state.lease.menuKey = null;
      switch (action) {
        case "login":
          loginSubmit();
          break;
        case "pick-role": {
          const role = t.dataset.role;
          const id = state.pendingAccount.identities.find((i) => i.role === role);
          enterWithIdentity(state.pendingAccount, id);
          break;
        }
        case "back-login":
          state.pendingAccount = null;
          state.screen = "login";
          setHash("#/login");
          render();
          break;
        case "open-module":
          openModule(t.dataset.id, true);
          break;
        case "data-stats-tab":
          state.dataStats.subTab = t.dataset.tab === "asset" ? "asset" : "biz";
          if (state.tab !== "dataStats") {
            state.tab = "dataStats";
            state.screen = "dataStats";
            setHash("#/dataStats");
          }
          track("data_stats_subtab", { tab: state.dataStats.subTab });
          render();
          break;
        case "open-todo":
          openTodoType(t.dataset.type);
          break;
        case "open-alert":
          openAlertGroup(t.dataset.group);
          break;
        case "retry-load":
          state.loadError = false;
          toast("已重试");
          render();
          break;
        case "open-messages":
          state.msgFrom = "mine";
          state.tab = "mine";
          state.screen = "messages";
          setHash("#/messages");
          render();
          break;
        case "open-msg":
          if (state.screen === "todosHub") state.msgFrom = "hub";
          else if (state.screen === "messages") state.msgFrom = "mine";
          state.selectedMsgId = t.dataset.id;
          state.screen = "msgDetail";
          setHash("#/msg/" + t.dataset.id);
          render();
          break;
        case "back-messages":
          if (state.msgFrom === "mine") {
            state.tab = "mine";
            state.screen = "messages";
            setHash("#/messages");
            render();
          } else {
            goTab("todos");
          }
          break;
        case "back-workbench":
          goTab("workbench");
          break;
        case "back-mine":
          goTab("mine");
          break;
        case "open-about":
          state.screen = "about";
          setHash("#/about");
          render();
          break;
        case "open-account":
          state.screen = "account";
          setHash("#/account");
          render();
          break;
        case "logout":
          logout();
          break;
        case "order-menu": {
          const key = (t.dataset.kind || "personal") + ":" + t.dataset.id;
          state.lease.menuKey = state.lease.menuKey === key ? null : key;
          render();
          break;
        }
        case "battery-open":
          openBatteryDetail(t.dataset.sn);
          break;
        case "battery-back":
          closeBatteryDetail();
          break;
        case "battery-discharge": {
          const bat = Batteries.toggleDischarge(state.battery.sn);
          track("battery_discharge", { sn: state.battery.sn, on: bat && bat.dischargeOn });
          toast(
            bat
              ? `放电开关已${bat.dischargeOn ? "开启" : "关闭"}（Mock）`
              : "电池不存在"
          );
          render();
          break;
        }
        case "battery-charge": {
          const bat = Batteries.toggleCharge(state.battery.sn);
          track("battery_charge", { sn: state.battery.sn, on: bat && bat.chargeOn });
          toast(
            bat
              ? `充电开关已${bat.chargeOn ? "开启" : "关闭"}（Mock）`
              : "电池不存在"
          );
          render();
          break;
        }
        case "battery-buzzer": {
          const res = Batteries.buzzerCmd(state.battery.sn, t.dataset.cmd);
          track("battery_buzzer", { sn: state.battery.sn, cmd: t.dataset.cmd, ok: !!(res && res.ok) });
          toast((res && res.msg) || "指令失败");
          render();
          break;
        }
        case "battery-loc": {
          const cmd = t.dataset.cmd;
          const bat = Batteries.view(state.battery.sn);
          if (!bat) {
            toast("电池不存在");
            break;
          }
          if (cmd === "lbs") {
            Batteries.refreshLbs(state.battery.sn);
            track("battery_lbs", { sn: bat.sn });
            toast("LBS 定位已刷新（Mock）");
            render();
            break;
          }
          if (cmd === "addr") {
            toast(bat.address);
            break;
          }
          if (cmd === "nav") {
            toast("导航暂未开放");
            track("battery_nav", { sn: bat.sn });
            break;
          }
          if (cmd === "track") {
            toast("轨迹回放暂未开放");
            track("battery_track", { sn: bat.sn });
            break;
          }
          break;
        }
        case "battery-zoom": {
          const dir = t.dataset.dir;
          const next = (state.battery.mapZoom || 2) + (dir === "in" ? 1 : -1);
          state.battery.mapZoom = Math.max(1, Math.min(4, next));
          render();
          break;
        }
        case "lease-search":
          track("lease_search", {
            type: state.lease.searchType,
            keyword: state.lease.keyword,
          });
          render();
          toast(state.lease.keyword.trim() ? "已筛选" : "已刷新列表");
          break;
        case "lease-problem-filter":
          state.lease.problemFilter = t.dataset.filter || "all";
          state.lease.menuKey = null;
          track("lease_problem_filter", { filter: state.lease.problemFilter });
          render();
          break;
        case "lease-scan":
          toast("请手动输入，扫码暂未开放");
          track("lease_scan_click", {});
          break;
        case "lease-call":
          toast("拨打 " + t.dataset.phone + "（原型示意）");
          track("lease_call", { phone: t.dataset.phone });
          break;
        case "copy-text":
        case "user-copy":
        case "sms-copy":
          copyText(t.dataset.text, t.dataset.ok || "已复制");
          track("copy_text", { from: action });
          break;
        case "lease-act":
          openLeaseSub(t.dataset.act, t.dataset.order);
          break;
        case "lease-sub-back":
          closeLeaseSub({ trackCancel: true });
          break;
        case "lease-sub-submit":
          submitLeaseSub();
          break;
        case "lease-dialog-mask":
          if (e.target !== t) break;
          // fallthrough
        case "lease-dialog-cancel":
          if (state.lease.confirmDialog) {
            track("lease_sub_cancel", {
              act: "confirm",
              order_id: state.lease.confirmDialog.orderId,
            });
          }
          state.lease.confirmDialog = null;
          render();
          break;
        case "lease-dialog-ok": {
          const oid = state.lease.confirmDialog && state.lease.confirmDialog.orderId;
          track("lease_sub_submit", { act: "confirm", order_id: oid });
          state.lease.confirmDialog = null;
          toast("订单已确认（原型示意）");
          render();
          break;
        }
        case "daypool-tab":
          state.daypool.tab = t.dataset.tab;
          track("daypool_tab_switch", { tab: state.daypool.tab });
          render();
          break;
        case "daypool-search":
          track("daypool_search", {
            type: state.daypool.searchType,
            keyword: state.daypool.keyword,
          });
          render();
          toast(state.daypool.keyword.trim() ? "已筛选" : "已刷新列表");
          break;
        case "daypool-scan":
          toast("请手动输入，扫码暂未开放");
          track("daypool_scan_click", {});
          break;
        case "daypool-call":
          toast("拨打 " + t.dataset.phone + "（原型示意）");
          track("daypool_call", { phone: t.dataset.phone });
          break;
        case "daypool-act":
          openDaypoolSub(t.dataset.act, t.dataset.order);
          break;
        case "daypool-sub-back":
          closeDaypoolSub({ trackCancel: true });
          break;
        case "daypool-sub-submit":
          submitDaypoolSub();
          break;
        case "daypool-dialog-mask":
          if (e.target !== t) break;
          // fallthrough
        case "daypool-dialog-cancel":
          if (state.daypool.confirmDialog) {
            track("daypool_sub_cancel", {
              act: state.daypool.confirmDialog.act || "mock_return",
              order_id: state.daypool.confirmDialog.orderId,
            });
          }
          state.daypool.confirmDialog = null;
          render();
          break;
        case "daypool-dialog-ok": {
          const oid = state.daypool.confirmDialog && state.daypool.confirmDialog.orderId;
          track("daypool_sub_submit", { act: "mock_return", order_id: oid });
          state.daypool.confirmDialog = null;
          toast("模拟还电已提交（原型示意）");
          render();
          break;
        }
        case "sites-tab":
          state.sites.status = t.dataset.status;
          track("sites_tab", { status: state.sites.status });
          render();
          break;
        case "sites-search":
          track("sites_search", { keyword: state.sites.keyword });
          render();
          toast(state.sites.keyword.trim() ? "已筛选" : "已刷新列表");
          break;
        case "sites-open":
          openSiteDetail(t.dataset.id);
          break;
        case "sites-add":
          openSiteForm("new");
          break;
        case "sites-edit":
          openSiteForm(t.dataset.id);
          break;
        case "sites-back-list":
          openSitesList();
          break;
        case "sites-form-back":
          if (state.sites.formId && state.sites.formId !== "new") {
            openSiteDetail(state.sites.formId);
          } else {
            openSitesList();
          }
          break;
        case "sites-save":
          submitSiteForm();
          break;
        case "sites-map-search":
          submitSiteMapSearch();
          break;
        case "sites-locate":
          pickSiteDeviceLocation();
          break;
        case "sites-map-zoom": {
          const dir = t.dataset.dir;
          const next = state.sites.mapZoom + (dir === "in" ? 1 : -1);
          state.sites.mapZoom = Sites.clampMapZoom(next);
          track("sites_map_zoom", { zoom: state.sites.mapZoom });
          render();
          break;
        }
        case "sites-phase2":
          toast("该功能暂未开放");
          track("sites_phase2", { feat: t.dataset.feat });
          break;
        case "sites-photo-add":
          if (t.hasAttribute("disabled")) {
            toast("最多上传 " + Sites.PHOTO_MAX + " 张");
            break;
          }
          {
            const input = $("sites-photo-file");
            if (input) input.click();
          }
          break;
        case "sites-photo-remove": {
          const idx = Number(t.dataset.idx);
          const photos = formPhotos();
          if (idx >= 0 && idx < photos.length) {
            photos.splice(idx, 1);
            state.sites.form.photos = photos;
            state.sites.previewIdx = 0;
            track("sites_photo_remove", { idx });
            render();
          }
          break;
        }
        case "sites-photo-sample":
          state.sites.form.photos = Sites.clonePhotos(Sites.SAMPLE_PHOTOS);
          state.sites.previewIdx = 0;
          track("sites_photo_sample", {});
          toast("已填入示例实景");
          render();
          break;
        case "sites-photo-hero":
        case "sites-photo-hero-detail": {
          if (e.target.closest("[data-action='sites-photo-dot']")) break;
          const list =
            t.dataset.action === "sites-photo-hero-detail"
              ? Sites.photoList(Sites.getSiteById(state.sites.siteId))
              : formPhotos();
          if (list.length > 1) {
            state.sites.previewIdx = ((state.sites.previewIdx || 0) + 1) % list.length;
            render();
          }
          break;
        }
        case "sites-photo-dot":
          state.sites.previewIdx = Number(t.dataset.idx) || 0;
          render();
          break;
        case "biz-chart-mode":
          state.ops.bizChartMode = t.dataset.mode || "7d";
          track("biz_chart_mode", { mode: state.ops.bizChartMode });
          render();
          break;
        case "biz-year-prev":
          if (state.ops.bizYear > OpsStats.BIZ_YEAR_MIN) {
            state.ops.bizYear -= 1;
            const months = OpsStats.bizMonthsForYear(state.ops.bizYear);
            if (state.ops.bizMonth > months[months.length - 1]) {
              state.ops.bizMonth = months[months.length - 1];
            }
            track("biz_year", { year: state.ops.bizYear });
            render();
          }
          break;
        case "biz-year-next":
          if (state.ops.bizYear < OpsStats.DEMO_TODAY.year) {
            state.ops.bizYear += 1;
            const months = OpsStats.bizMonthsForYear(state.ops.bizYear);
            if (state.ops.bizMonth > months[months.length - 1]) {
              state.ops.bizMonth = months[months.length - 1];
            }
            track("biz_year", { year: state.ops.bizYear });
            render();
          }
          break;
        case "biz-month":
          state.ops.bizMonth = Number(t.dataset.month) || 1;
          track("biz_month", { year: state.ops.bizYear, month: state.ops.bizMonth });
          render();
          break;
        case "biz-tab":
          state.ops.bizTab = t.dataset.tab || "charts";
          track("biz_tab", { tab: state.ops.bizTab });
          render();
          break;
        case "cab-tab":
          state.ops.cabTab = t.dataset.tab;
          track("cab_tab", { tab: state.ops.cabTab });
          render();
          break;
        case "cab-detail-tab":
          state.ops.cabDetailTab = t.dataset.tab || "cabinet";
          track("cab_detail_tab", { tab: state.ops.cabDetailTab });
          render();
          requestAnimationFrame(() => {
            if (els.screenRoot) els.screenRoot.scrollTop = 0;
          });
          break;
        case "cab-search":
          track("cab_search", {
            keyword: state.ops.cabKeyword,
            site: state.ops.cabFilterSite,
          });
          render();
          toast(
            state.ops.cabKeyword.trim() || (state.ops.cabFilterSite && state.ops.cabFilterSite !== "all")
              ? "已筛选"
              : "已刷新列表"
          );
          break;
        case "cab-scan":
          toast("请手动输入，扫码暂未开放");
          track("cab_scan", {});
          break;
        case "cab-open":
          openCabinetDetail(t.dataset.id);
          break;
        case "cab-history":
          openCabSub("opslog", t.dataset.id);
          break;
        case "cab-swaps":
          openCabSub("swaplog", t.dataset.id);
          break;
        case "cab-sub-back":
          backCabSub();
          break;
        case "cab-swap-tab":
          state.ops.cabSwapTab = t.dataset.tab;
          render();
          break;
        case "cab-swap-search":
          track("cab_swap_search", { keyword: state.ops.cabSwapKw });
          render();
          break;
        case "cab-swap-detail":
          state.ops.cabSwapId = t.dataset.id;
          state.ops.cabView = "swapDetail";
          render();
          break;
        case "cab-swap-back":
          state.ops.cabView = "swaplog";
          state.ops.cabSwapId = null;
          render();
          break;
        case "cab-refresh": {
          const result = Cabinets.refreshCabinet(state.ops.cabId);
          toast(result.error || (result.cabinet.online ? "已刷新机柜状态" : "电柜离线，已记录刷新"));
          if (!result.error) render();
          break;
        }
        case "cab-ask-open":
          state.ops.cabDialog = { kind: "openPort", portNo: Number(t.dataset.port) };
          render();
          break;
        case "cab-ask-open-all":
          state.ops.cabDialog = { kind: "openAll" };
          render();
          break;
        case "cab-ask-lock":
          state.ops.cabDialog = { kind: "lockPort", portNo: Number(t.dataset.port), reason: "" };
          render();
          break;
        case "cab-ask-lock-all":
          state.ops.cabDialog = { kind: "lockAll", reason: "" };
          render();
          break;
        case "cab-unlock-port": {
          const result = Cabinets.unlockPort(state.ops.cabId, t.dataset.port);
          toast(result.error || `已解锁 ${t.dataset.port} 号仓`);
          if (!result.error) render();
          break;
        }
        case "cab-dialog-mask":
          if (e.target !== t) break;
          state.ops.cabDialog = null;
          render();
          break;
        case "cab-dialog-cancel":
          state.ops.cabDialog = null;
          render();
          break;
        case "cab-dialog-ok": {
          const dlg = state.ops.cabDialog;
          if (!dlg) break;
          if (dlg.kind === "unbind" || dlg.kind === "bind") {
            if (!canMoveCabinets()) {
              toast("无移柜权限");
              break;
            }
            const site = dlg.kind === "unbind" ? "unassigned" : dlg.site;
            const result = Cabinets.moveCabinet(state.ops.cabId, site);
            if (result.error) {
              toast(result.error);
              break;
            }
            state.ops.cabDialog = null;
            if (dlg.kind === "unbind") {
              state.ops.cabSite = (Cabinets.bindSiteOptions()[0] && Cabinets.bindSiteOptions()[0].id) || "";
              toast("已解绑站点，可绑定新站");
              track("cab_unbind", { sn: state.ops.cabId });
            } else {
              toast("已绑定到「" + (result.cabinet && result.cabinet.site) + "」");
              track("cab_bind", { sn: state.ops.cabId, site: result.cabinet && result.cabinet.site });
            }
            render();
            break;
          }
          let result = {};
          if (dlg.kind === "openPort") result = Cabinets.openPort(state.ops.cabId, dlg.portNo);
          else if (dlg.kind === "openAll") result = Cabinets.openAllPorts(state.ops.cabId);
          else if (dlg.kind === "lockPort") {
            const inp = $("cab-lock-reason");
            result = Cabinets.lockPort(state.ops.cabId, dlg.portNo, inp && inp.value);
          } else if (dlg.kind === "lockAll") {
            const inp = $("cab-lock-reason");
            result = Cabinets.lockAllPorts(state.ops.cabId, inp && inp.value);
          }
          if (result.error) {
            toast(result.error);
            if (result.error !== "请输入锁仓原因") {
              state.ops.cabDialog = null;
              render();
            }
            break;
          }
          state.ops.cabDialog = null;
          if (dlg.kind === "openPort") toast(`已打开 ${dlg.portNo} 号柜门（Mock）`);
          else if (dlg.kind === "openAll") toast(`已打开 ${result.opened} 个仓门（Mock）`);
          else toast("仓门已锁定（Mock）");
          track("cab_door_op", { kind: dlg.kind, port: dlg.portNo || "all" });
          render();
          break;
        }
        case "cab-port-jump": {
          const n = Number(t.dataset.port) || 0;
          state.ops.cabDetailTab = "slots";
          state.ops.cabPortOpen = n;
          render();
          requestAnimationFrame(() => {
            const el = document.getElementById("cab-port-" + n);
            if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" });
          });
          break;
        }
        case "cab-back-list":
          openCabinetList();
          break;
        case "cab-back-detail":
          backCabSub();
          break;
        case "cab-edit":
          if (!canMoveCabinets()) {
            toast("无编辑权限");
            break;
          }
          if (t.dataset.id) openCabSub("edit", t.dataset.id);
          else {
            state.ops.cabReturn = "detail";
            const cur = Cabinets.getById(state.ops.cabId);
            state.ops.cabSite =
              cur && Cabinets.isUnassigned(cur)
                ? (Cabinets.bindSiteOptions()[0] && Cabinets.bindSiteOptions()[0].id) || ""
                : "";
            goCabView("edit");
          }
          break;
        case "cab-move":
          if (!canMoveCabinets()) {
            toast("无移柜权限");
            break;
          }
          {
            const cur = Cabinets.getById(state.ops.cabId);
            state.ops.cabSite =
              cur && Cabinets.isUnassigned(cur)
                ? (Cabinets.bindSiteOptions()[0] && Cabinets.bindSiteOptions()[0].id) || ""
                : "";
            state.ops.cabView = "move";
            track("cab_move_open", { sn: state.ops.cabId });
            render();
          }
          break;
        case "cab-unbind-open":
          if (!canMoveCabinets()) {
            toast("无移柜权限");
            break;
          }
          {
            const cur = Cabinets.getById(state.ops.cabId);
            if (!cur || Cabinets.isUnassigned(cur)) {
              toast("当前未绑定站点");
              break;
            }
            state.ops.cabDialog = { kind: "unbind" };
            render();
          }
          break;
        case "cab-bind-open":
          if (!canMoveCabinets()) {
            toast("无移柜权限");
            break;
          }
          {
            const cur = Cabinets.getById(state.ops.cabId);
            if (!cur) {
              toast("电柜不存在");
              break;
            }
            if (!Cabinets.isUnassigned(cur)) {
              toast("请先解绑当前站点，再绑定新站");
              break;
            }
            const sel = $("cab-bind-site");
            const site = (sel && sel.value) || state.ops.cabSite;
            if (!site) {
              toast("请选择要绑定的站点");
              break;
            }
            state.ops.cabSite = site;
            state.ops.cabDialog = { kind: "bind", site };
            render();
          }
          break;
        case "cab-edit-save": {
          if (!canMoveCabinets()) {
            toast("无编辑权限");
            break;
          }
          const result = Cabinets.saveEdit(state.ops.cabId, {
            name: ($("cab-edit-name") && $("cab-edit-name").value) || "",
            address: ($("cab-edit-addr") && $("cab-edit-addr").value) || "",
            deviceStatus: ($("cab-edit-status") && $("cab-edit-status").value) || "启用",
          });
          if (result.error) {
            toast(result.error);
            break;
          }
          track("cab_edit_save", { sn: state.ops.cabId });
          toast("换电柜信息已保存（演示）");
          state.ops.cabView = state.ops.cabReturn === "list" ? "list" : "detail";
          render();
          break;
        }
        case "cab-swap-save": {
          const sel = $("cab-swap-mode");
          const result = Cabinets.setSwapMode(state.ops.cabId, sel && sel.value);
          if (result.error) {
            toast(result.error);
            break;
          }
          toast(`换电模式已切换为「${result.cabinet.swapMode}」`);
          track("cab_swap_mode", { sn: state.ops.cabId, mode: result.cabinet.swapMode });
          render();
          break;
        }
        case "cab-bt-save": {
          const sel = $("cab-bt-type");
          const result = Cabinets.setBtType(state.ops.cabId, sel && sel.value);
          if (result.error) {
            toast(result.error);
            break;
          }
          toast(`蓝牙类型已切换为「${result.cabinet.bluetoothType}」`);
          track("cab_bt_type", { sn: state.ops.cabId });
          render();
          break;
        }
        case "cab-iccid-refresh": {
          const result = Cabinets.refreshIccid(state.ops.cabId);
          if (result.error) toast(result.error);
          else {
            toast("已刷新物联网卡状态");
            track("cab_iccid_refresh", { sn: state.ops.cabId });
            render();
          }
          break;
        }
        case "cab-qr":
          goCabView("qr");
          break;
        case "cab-qr-replace": {
          const result = Cabinets.bindQr(state.ops.cabId);
          if (result.error) {
            toast(result.error);
            break;
          }
          toast("二维码已更换（演示）");
          track("cab_qr_replace", { sn: state.ops.cabId });
          if (state.ops.cabView !== "qr") goCabView("qr");
          else render();
          break;
        }
        case "cab-compose":
          state.ops.cabReturn = "detail";
          state.ops.cabDetailTab = "more";
          track("cab_compose", { sn: state.ops.cabId });
          goCabView("compose");
          break;
        case "cab-opslog":
          openCabSub("opslog");
          break;
        case "cab-compose-ops":
          toast(`电柜组成 · ${t.dataset.ops === "slot" ? "隔口开关" : "上下电"} · 二期演示`);
          break;
        case "cab-remote": {
          const cmd = Cabinets.REMOTE_CMDS.find((x) => x.id === t.dataset.cmd);
          if (!cmd) break;
          track("cab_remote", { sn: state.ops.cabId, cmd: cmd.id });
          if (cmd.view === "snapshot") {
            state.ops.cabSnapType = cmd.snap || "cabinet";
            goCabView("snapshot");
            break;
          }
          if (cmd.view === "opslog") {
            goCabView("opslog");
            break;
          }
          if (cmd.view === "qr") {
            goCabView("qr");
            break;
          }
          toast(`远程运维 · ${cmd.label} · 二期（原型演示桩）`);
          break;
        }
        case "cab-port-toggle-open": {
          const n = Number(t.dataset.port) || 0;
          state.ops.cabPortOpen = state.ops.cabPortOpen === n ? 0 : n;
          render();
          break;
        }
        case "cab-port-toggle": {
          const result = Cabinets.togglePortService(state.ops.cabId, t.dataset.port);
          if (result.error) toast(result.error);
          else {
            toast(`端口 ${t.dataset.port} 服务状态已切换为「${result.port.portServiceStatus}」（二期演示）`);
            track("cab_port_toggle", { sn: state.ops.cabId, port: t.dataset.port });
            render();
          }
          break;
        }
        case "cab-port-cmd": {
          const labels = { open: "开门", refresh: "刷新", charge: "补电", powerOn: "通电", powerOff: "断电" };
          toast(`端口 ${t.dataset.port} · ${labels[t.dataset.cmd] || t.dataset.cmd} · 二期`);
          track("cab_port_cmd", { sn: state.ops.cabId, port: t.dataset.port, cmd: t.dataset.cmd });
          break;
        }
        case "cab-alert-open": {
          const a = Alerts.getAlertById(t.dataset.id);
          if (!a) {
            toast("告警不存在");
            break;
          }
          state.alerts.itemId = a.id;
          state.alerts.view = "detail";
          state.alerts.group = a.group;
          state.alerts.fromCab = true;
          state.ops.cabDetailTab = "more";
          state.screen = "alerts";
          track("cab_alert_open", { id: a.id });
          render();
          break;
        }
        case "cab-phase2":
          toast("该功能暂未开放");
          track("cab_phase2", { feat: t.dataset.feat });
          break;
        case "todos-back-wb":
          closeTodos();
          break;
        case "todos-back-list":
          state.todos.view = "list";
          state.todos.itemId = null;
          state.todos.rejectOpen = false;
          render();
          break;
        case "todo-open-item":
          openTodoDetail(t.dataset.id);
          break;
        case "todo-refund-preset":
          setRefundPreset(t.dataset.mode);
          break;
        case "todo-refund-submit":
          submitRefundProcess();
          break;
        case "todo-overdue-remind": {
          const r = Todos.remindOverdue(state.todos.itemId);
          if (r.error) toast(r.error);
          else {
            track("todo_overdue_remind", { id: r.item.id });
            toast("已发送催还（原型示意）");
            render();
          }
          break;
        }
        case "todo-overdue-return": {
          const r = Todos.returnOverdue(state.todos.itemId);
          if (r.error) toast(r.error);
          else {
            track("todo_overdue_return", { id: r.item.id });
            toast("已模拟还电，逾期完结（原型示意）");
            state.todos.view = "list";
            state.todos.itemId = null;
            render();
          }
          break;
        }
        case "todo-overdue-alloc": {
          const r = Todos.allocOverdue(state.todos.itemId);
          if (r.error) toast(r.error);
          else {
            track("todo_overdue_alloc", { id: r.item.id });
            toast("已模拟续配人天（原型示意）");
            state.todos.view = "list";
            state.todos.itemId = null;
            render();
          }
          break;
        }
        case "todo-approve":
          approveTodo();
          break;
        case "todo-reject":
          state.todos.rejectOpen = true;
          render();
          break;
        case "todo-reject-mask":
          if (e.target !== t) break;
        case "todo-reject-cancel":
          state.todos.rejectOpen = false;
          render();
          break;
        case "todo-reject-ok":
          submitTodoReject();
          break;
        case "alerts-back-wb":
          goTab("todos");
          break;
        case "alerts-back-list":
          if (state.alerts.fromCab) {
            state.alerts.fromCab = false;
            state.alerts.view = "list";
            state.alerts.itemId = null;
            state.screen = "cabinets";
            state.ops.cabView = "detail";
            render();
            break;
          }
          state.alerts.view = "list";
          state.alerts.itemId = null;
          render();
          break;
        case "alert-filter-type":
          state.alerts.type = t.dataset.type || "all";
          track("alert_filter_type", { type: state.alerts.type });
          render();
          break;
        case "alert-open-item":
          openAlertDetail(t.dataset.id);
          break;
        case "alert-claim": {
          const r = Alerts.claimAlert(state.alerts.itemId);
          if (r.error) toast(r.error);
          else {
            track("alert_claim", { id: state.alerts.itemId });
            toast("已接单（原型示意）");
            render();
          }
          break;
        }
        case "alert-close": {
          const r = Alerts.closeAlert(state.alerts.itemId);
          if (r.error) toast(r.error);
          else {
            track("alert_close", { id: state.alerts.itemId });
            toast("告警已关闭（原型示意）");
            state.alerts.view = "list";
            state.alerts.itemId = null;
            render();
          }
          break;
        }
        case "user-search":
          track("users_search", { kw: state.users.kw });
          render();
          toast(state.users.kw.trim() ? "已筛选" : "已刷新列表");
          break;
        case "sms-search":
          track("sms_search", { kw: state.users.smsKw });
          render();
          toast(state.users.smsKw.trim() ? "已筛选" : "已刷新列表");
          break;
        case "pay-search":
          track("pay_search", { kw: state.users.payKw, tab: state.users.payTab });
          render();
          toast(state.users.payKw.trim() ? "已筛选" : "已刷新列表");
          break;
        case "pay-tab":
          state.users.payTab = t.dataset.tab || "success";
          track("pay_tab", { tab: state.users.payTab });
          render();
          break;
        case "pkg-search":
          track("pkg_search", { kw: state.packageOrders.kw, tab: state.packageOrders.tab });
          render();
          toast(state.packageOrders.kw.trim() ? "已筛选" : "已刷新列表");
          break;
        case "pkg-tab":
          state.packageOrders.tab = t.dataset.tab || "all";
          track("pkg_tab", { tab: state.packageOrders.tab });
          render();
          break;
        case "fin-wd-tab":
          state.finance.wdTab = t.dataset.tab || "all";
          track("fin_wd_tab", { tab: state.finance.wdTab });
          render();
          break;
        case "fin-wd-open":
          state.finance.wdId = t.dataset.id;
          state.finance.view = "detail";
          track("fin_wd_open", { id: state.finance.wdId });
          render();
          break;
        case "fin-back":
          state.finance.view = "home";
          state.finance.wdId = null;
          render();
          break;
        case "fin-settle-change":
          state.finance.settleForm = Finance.settleFormDefaults();
          state.finance.settleReturn =
            state.finance.view === "apply" ? "apply" : "home";
          state.finance.view = "settle-edit";
          track("fin_settle_change_open", {});
          render();
          break;
        case "fin-settle-cancel":
          state.finance.settleForm = null;
          state.finance.view = state.finance.settleReturn || "home";
          render();
          break;
        case "fin-settle-save": {
          const form = {
            bankAccountName: ($("fin-settle-name") && $("fin-settle-name").value) || "",
            bankAccount: ($("fin-settle-account") && $("fin-settle-account").value) || "",
            bankName: ($("fin-settle-bank") && $("fin-settle-bank").value) || "",
            bankBranch: ($("fin-settle-branch") && $("fin-settle-branch").value) || "",
            bankCode: ($("fin-settle-code") && $("fin-settle-code").value) || "",
          };
          const res = Finance.updateSettle(form);
          if (!res.ok) {
            toast(res.msg);
            break;
          }
          toast("提现账户已更新");
          track("fin_settle_change_save", {});
          state.finance.settleForm = null;
          state.finance.view = state.finance.settleReturn || "home";
          render();
          break;
        }
        case "fin-copy": {
          const text = t.dataset.text || "";
          if (!text) {
            toast("无可复制内容");
            break;
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
              () => toast("已复制卡号"),
              () => toast("已复制卡号")
            );
          } else {
            toast("已复制卡号");
          }
          track("fin_copy_account", {});
          break;
        }
        case "fin-apply-open": {
          const snap = Finance.snapshot();
          if (!snap.collect.bound) {
            toast("未绑定收款账户不可提现");
            break;
          }
          state.finance.view = "apply";
          state.finance.applyAmount =
            snap.withdrawable > 0
              ? String(Math.min(snap.withdrawable, 100).toFixed(2))
              : "";
          track("fin_apply_open", { pending: snap.hasPending });
          render();
          break;
        }
        case "fin-apply-submit": {
          const amt = ($("fin-apply-amount") && $("fin-apply-amount").value) || state.finance.applyAmount;
          const res = Finance.applyWithdraw(amt);
          if (!res.ok) {
            toast(res.msg);
            break;
          }
          toast("已提交提现申请");
          track("fin_apply_submit", { id: res.id, amount: amt });
          state.finance.view = "home";
          state.finance.wdTab = "pending";
          state.finance.applyAmount = "";
          render();
          break;
        }
        case "noop":
          break;
        case "reset-demo":
          applyScenario("admin");
          state.events = [];
          track("demo_reset", {});
          break;
        default:
          break;
      }
      return;
    }

    if (state.lease.menuKey) {
      state.lease.menuKey = null;
      render();
      return;
    }

    const tabBtn = e.target.closest("#tab-bar [data-tab]");
    if (tabBtn && tabBtn.dataset.tab) {
      goTab(tabBtn.dataset.tab);
    }
  }

  function init() {
    els.screenRoot = $("screen-root");
    els.tabBar = $("tab-bar");
    els.toast = $("toast");

    document.body.addEventListener("click", onClick);
    window.addEventListener("hashchange", applyRoute);

    document.querySelectorAll("[data-scenario]").forEach((btn) => {
      btn.addEventListener("click", () => applyScenario(btn.dataset.scenario));
    });

    resetMessages(false);
    setHash("#/login");
    state.screen = "login";
    render();
    track("prototype_ready", { modules: MODULE_REGISTRY.length });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
