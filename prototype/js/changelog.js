/**
 * 原型 · 更新记录（评审侧栏展示，新条目置顶）
 */
(function (global) {
  /** @type {Array<{ version: string, date: string, title: string, items: string[], decisions?: string[] }>} */
  const ENTRIES = [
    {
      version: "V1.54",
      date: "2026-09-21",
      title: "换电订单重构 · 套餐订单",
      decisions: ["058", "059", "060"],
      items: [
        "经营新增「套餐订单」（已支付/待支付）",
        "「计费记录」→「逾期记录」，仅已欠费可见",
        "个人换电移除：更换电池/更换记录/支付记录/订单合同",
        "换电卡片不再混套餐购买信息（待确认保留简要用户信息）",
        "列表展示全部换电记录；同用户仅最新一条有用户信息头",
        "「暂存订单/暂存中/暂存取电」→ 冻结记录/冻结中；移除暂存取电",
        "赠送天数（冻结中）不展示设备编号",
        "换电列表快捷筛：全部 / 待确认 / 有问题",
      ],
    },
    {
      version: "V1.53",
      date: "2026-09-21",
      title: "首页统计 · 结束订单 · 员工站点",
      decisions: ["055", "056", "057"],
      items: [
        "工作台新增用户数据 9 格 + 电池数据 3 格",
        "结束订单：电池状态、逾期费用、押金；移除租金",
        "员工账号站点繁忙度按 siteIds 裁切",
        "逾期待办：到期仍持有电池 + 电池编码可点",
      ],
    },
    {
      version: "V1.52",
      date: "2026-09-20",
      title: "电柜详情精简",
      decisions: ["054"],
      items: ["电柜详情移除「充电服务设置」Tab（4 Tab）"],
    },
    {
      version: "V1.51",
      date: "2026-09-19",
      title: "财务账户 · 经营图表",
      items: [
        "财务账户：收款/结算分户、图表恢复今日/近7日筛选",
        "经营统计图表时间筛与自然月选择器",
      ],
    },
    {
      version: "V1.45",
      date: "2026-09-17",
      title: "基线交付（Initial）",
      decisions: ["001", "002", "022", "025", "045"],
      items: [
        "可插拔工作台壳：登录 / 工作台 / 待办 / 我的",
        "换电订单（个人 + 人天合一列表）",
        "经营统计 / 设备统计 / 电柜管理（5 Tab 详情）",
        "运维·站点（地图选点 / 实景照片）",
        "待办：退款 / 逾期 / 渠道充值 + 换电柜警告五类",
        "财务·账户 / 其他·用户管理 / 用户支付记录",
        "订单电池编号 → 电池详情（定位 + 远程操作）",
        "评审右侧 page-specs 字段面板",
        "品牌名「锂电快换」；移除实名审核 / 短信验证码屏蔽",
      ],
    },
  ];

  function renderChangelog(root) {
    if (!root) return;
    root.innerHTML = ENTRIES.map((e) => {
      const dec = (e.decisions || [])
        .map(
          (n) =>
            `<a href="../decisions/decision-${n.padStart(3, "0")}.md" class="changelog-dec">#${n}</a>`
        )
        .join("");
      const lis = e.items.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
      return `<article class="changelog-item">
        <header class="changelog-hd">
          <span class="changelog-ver">${escapeHtml(e.version)}</span>
          <time class="changelog-date">${escapeHtml(e.date)}</time>
        </header>
        <h3 class="changelog-title">${escapeHtml(e.title)}</h3>
        ${dec ? `<div class="changelog-decisions">${dec}</div>` : ""}
        <ul class="changelog-ul">${lis}</ul>
      </article>`;
    }).join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mount() {
    renderChangelog(document.getElementById("changelog-root"));
  }

  global.OperatorAppChangelog = { ENTRIES, renderChangelog, mount };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})(window);
