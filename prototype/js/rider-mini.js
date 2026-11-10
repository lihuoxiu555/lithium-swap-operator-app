/**
 * 换电小程序 · 骑手端 Mock（C 端）
 * 与运营商管理端同小程序壳，经「商户」入口切换
 */
(function (global) {
  function defaultState() {
    return { tab: "mine" };
  }

  function renderMine(ctx) {
    const { escapeHtml } = ctx;
    return `
      <div class="rider-page rider-mine">
        <header class="rider-mine-hd">
          <button type="button" class="rider-merchant-entry" data-action="open-merchant-login">商户</button>
          <button type="button" class="rider-settings" data-action="rider-settings" aria-label="设置">⚙</button>
        </header>
        <section class="rider-profile">
          <div class="rider-avatar" aria-hidden="true"></div>
          <div class="rider-profile-txt">
            <strong>电满满换电服务商</strong>
            <p>177****1052</p>
            <p class="rider-verify">
              <span class="tag-muted">未认证</span>
              <button type="button" class="link-like" data-action="rider-verify">去认证 ›</button>
            </p>
          </div>
        </section>
        <section class="rider-svc-card">
          <div>
            <h3>暂未开通服务</h3>
            <p>开通服务，放心骑行</p>
          </div>
          <button type="button" class="rider-svc-buy" data-action="rider-buy">服务购买</button>
        </section>
        <section class="rider-panel">
          <h4>常用功能</h4>
          <div class="rider-grid3">
            <button type="button" data-action="rider-buy"><span>🛍</span>购买套餐</button>
            <button type="button" data-action="rider-verify"><span>🪪</span>实名认证</button>
            <button type="button" data-action="rider-hotline"><span>🎧</span>客服电话</button>
          </div>
        </section>
        <section class="rider-panel">
          <h4>我的订单</h4>
          <div class="rider-grid4">
            <button type="button" data-action="rider-orders-swap"><span>📋</span>换电订单</button>
            <button type="button" data-action="rider-orders-svc"><span>📄</span>服务购买订单</button>
            <button type="button" data-action="rider-deposit"><span>💰</span>我的押金</button>
            <button type="button" data-action="rider-overdue"><span>🕐</span>超期记录</button>
          </div>
        </section>
      </div>`;
  }

  function renderHome(ctx) {
    const { escapeHtml } = ctx;
    return `
      <div class="rider-page rider-home">
        <header class="rider-home-hd">
          <button type="button" class="rider-merchant-entry" data-action="open-merchant-login">商户</button>
          <span>附近换电柜</span>
        </header>
        <div class="rider-map-placeholder">
          <p>地图 · 站点列表（骑手端 Mock）</p>
        </div>
      </div>`;
  }

  function renderTabBar(active) {
    const tabs = [
      { id: "home", label: "首页", icon: "🏠" },
      { id: "scan", label: "扫一扫", icon: "⌁", scan: true },
      { id: "mine", label: "我的", icon: "👤" },
    ];
    return `
      <nav class="rider-tab-bar" aria-label="骑手端导航">
        ${tabs
          .map((t) => {
            if (t.scan) {
              return `<button type="button" class="rider-tab-scan" data-action="rider-scan" aria-label="扫一扫"><span>${t.icon}</span></button>`;
            }
            const on = active === t.id ? " active" : "";
            return `<button type="button" class="rider-tab${on}" data-action="rider-tab" data-tab="${t.id}"><span class="ico">${t.icon}</span>${t.label}</button>`;
          })
          .join("")}
      </nav>`;
  }

  function render(state, ctx) {
    const mini = state.riderMini || defaultState();
    const tab = mini.tab || "mine";
    const body = tab === "home" ? renderHome(ctx) : renderMine(ctx);
    return `${body}${renderTabBar(tab)}`;
  }

  global.OperatorAppRiderMini = { defaultState, render };
})(window);
