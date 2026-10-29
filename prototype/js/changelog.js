/**
 * 原型 · 更新记录（评审侧栏展示，新条目置顶）
 *
 * 新增条目时 date 必须写**本机本地**时间：YYYY-MM-DD HH:mm（与浏览器/评审机时区一致，勿填 UTC 或虚构日期）。
 */
(function (global) {
  function formatLocalDateTime(d) {
    const dt = d instanceof Date ? d : new Date();
    const y = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    const h = String(dt.getHours()).padStart(2, "0");
    const mi = String(dt.getMinutes()).padStart(2, "0");
    return y + "-" + mo + "-" + day + " " + h + ":" + mi;
  }

  /** @type {Array<{ version: string, date: string, title: string, items: string[], decisions?: string[] }>} */
  const ENTRIES = [
    {
      version: "V1.76",
      date: formatLocalDateTime(),
      title: "远程出电 · 两步主路径与兜底",
      decisions: ["067", "068"],
      items: [
        "① 重开出电格口成功即完结；失败进入 ② 禁用+改发",
        "本柜仅故障出电有电：允许取走还入电池赴他站换电",
        "李骑手 sparseCabinet Mock 演示兜底",
      ],
    },
    {
      version: "V1.75",
      date: formatLocalDateTime(),
      title: "远程出电 · 还电必有与 MOCK 色",
      decisions: ["067"],
      items: [
        "远程出电前提还电成功；李骑手 Mock 补还入 2 号/492391883344",
        "还电/出电 KV 对齐排版；MOCK 按钮统一紫色系",
        "待办模拟还电/续配、人天模拟还电改 btn-mock",
      ],
    },
    {
      version: "V1.74",
      date: formatLocalDateTime(),
      title: "远程出电 · 换电信息与格口操作",
      decisions: ["067"],
      items: [
        "区域1 补换电信息并修正还电/出电排版",
        "区域2 站点与定位合并紧凑展示",
        "出电信息刷新+更新时间；重开/禁用出电格口按钮",
      ],
    },
    {
      version: "V1.73",
      date: formatLocalDateTime(),
      title: "远程出电 · 还电/出电区紧凑",
      decisions: ["067"],
      items: ["还电/出电双栏改为单行字段，内边距减半"],
    },
    {
      version: "V1.72",
      date: formatLocalDateTime(),
      title: "远程出电 · 信息分区",
      decisions: ["067"],
      items: [
        "顶部双栏：还电信息 / 出电信息（格口·电池·在柜·时间）",
        "下方站点·柜机·站点位置；再下用户定位·回传·距离",
      ],
    },
    {
      version: "V1.71",
      date: "2026-10-29 10:16",
      title: "远程出电入口条件",
      decisions: ["067"],
      items: [
        "远程出电：换电单 + 持电 + 持电仍在柜（出电误绑定）",
        "李骑手 Mock 持电仍在柜；陈晓无持电不展示远程",
      ],
    },
    {
      version: "V1.70",
      date: "2026-10-29 09:21",
      title: "柜外订单 · 换电列表",
      decisions: ["067"],
      items: [
        "柜外/远程出电单汇入换电订单；快捷筛「柜外」",
        "卡片区分柜外角标；运营商操作记录折叠可展开",
      ],
    },
    {
      version: "V1.69",
      date: "2026-10-28 19:29",
      title: "远程定位区紧凑化",
      items: ["定位与距离改为单行摘要 + 柜机/用户各一行，减少纵向占位"],
    },
    {
      version: "V1.68",
      date: "2026-10-28 19:19",
      title: "远程出电 · 定位与距离",
      decisions: ["067"],
      items: [
        "远程页展示柜机定位、用户 LBS 定位与直线距离",
        "Mock：浦东 1 号柜 vs 陈晓/李骑手 LBS，球面估算",
      ],
    },
    {
      version: "V1.67",
      date: "2026-10-28 19:15",
      title: "换电超时口径",
      decisions: ["067"],
      items: [
        "5 分钟未取出电：状态改为「换电超时」，不再使用「出电超时-退电」",
        "明确不等同退电；李骑手 Mock 远程页同步",
      ],
    },
    {
      version: "V1.66",
      date: "2026-10-28 19:08",
      title: "远程出电 · 格口选择与柜机信息",
      decisions: ["067"],
      items: [
        "远程出电展示站点、柜机名称；可选有电格口（SOC + 编码）",
        "默认选中换出格口；留痕含站点/柜机/格口",
      ],
    },
    {
      version: "V1.65",
      date: "2026-10-28 19:02",
      title: "柜外入口 · 待领取无换电记录",
      decisions: ["067"],
      items: [
        "待领取且无柜机换电记录：仅「柜外领电」（如王骑手）",
        "远程出电需有柜机换电记录；有记录且非待领取时可同时展示领电",
      ],
    },
    {
      version: "V1.64",
      date: "2026-10-28 18:53",
      title: "柜外作业 · 去掉蓝牙、远程入口规则",
      decisions: ["067"],
      items: [
        "回收/绑定不再做蓝牙校验，仅输入 SN + 业务校验",
        "用户持电时不展示「远程出电」；无持电且有套餐才展示",
      ],
    },
    {
      version: "V1.63",
      date: "2026-10-28 18:48",
      title: "柜外作业 · 对齐运维框架样式",
      items: [
        "用户卡片/搜索/流程块复用 sites-card、sites-search-row、devstat-sec",
        "修正无效 CSS 变量，按钮与站点/电柜模块同口径",
      ],
    },
    {
      version: "V1.62",
      date: "2026-10-28 18:39",
      title: "柜外电池作业",
      decisions: ["067"],
      items: [
        "运维宫格：柜外换电 / 退电 / 领电 + 远程出电（R1/R2 标签）",
        "回收与绑定：手输/扫码 + 蓝牙校验 Mock；可选用户确认留痕",
        "远程出电：5 分钟超时态「出电超时-退电」样例（李骑手）",
      ],
    },
    {
      version: "V1.61",
      date: "2026-10-13 15:33",
      title: "站点繁忙度 · 底栏操作",
      items: [
        "详情页三键（换电订单/电柜/站点档案）固定底栏、同一行横排",
        "内容区可滚动，底栏 sticky 贴屏底",
      ],
    },
    {
      version: "V1.60",
      date: "2026-10-13 15:21",
      title: "移除等待相关展示",
      decisions: ["066"],
      items: [
        "站点繁忙度：列表/详情/经营统计 Tab 去掉等待字段",
        "繁忙度仅按格口占用（≥85% 高 / ≥60% 中）",
        "站点详情去掉「等待中」；柜机一览不再展示柜机等待",
      ],
    },
    {
      version: "V1.59",
      date: "2026-10-13 15:12",
      title: "工作台 · 站点繁忙度",
      decisions: ["065"],
      items: [
        "经营栏目新增「站点繁忙度」，列表与经营统计繁忙度 Tab 同口径",
        "点站点进详情：现场指标、今日分时、柜机一览、调度提示与跳转",
        "经营统计繁忙度 Tab 卡片可点进同一详情",
      ],
    },
    {
      version: "V1.58",
      date: "2026-09-21",
      title: "同比柱顶补数字",
      decisions: ["064"],
      items: [
        "经营统计双柱图：本期、同比柱顶各标对应数值（覆盖仅标本期）",
        "深色数字贴彩色柱，灰色数字贴同比灰柱",
      ],
    },
    {
      version: "V1.57",
      date: "2026-09-21",
      title: "今日三卡可点击引导",
      decisions: ["063"],
      items: [
        "经营统计今日三卡增加「点击查看近7日趋势」引导",
        "进入页时卡片轻脉冲 + 点击涟漪，文案常驻；点三卡仍进经营统计详情",
      ],
    },
    {
      version: "V1.56",
      date: "2026-09-21",
      title: "底栏新增「数据统计」Tab",
      decisions: ["062"],
      items: [
        "底栏顺序：数据统计 / 待办 / 工作台 / 我的",
        "数据统计子 Tab：经营统计（今日三卡+用户数据）、资产统计（设备概况）",
        "工作台仅保留操作宫格；经营统计/设备统计从宫格移除",
        "登录默认进入数据统计",
      ],
    },
    {
      version: "V1.55",
      date: "2026-09-21",
      title: "电池数据 · 其他状态",
      decisions: ["061"],
      items: [
        "电池数据新增第 4 格「其他」（维修中 + 丢失）",
        "电池总数 = 使用中 + 空闲 + 其他",
        "Mock：12 = 5 + 5 + 2（维修 1 · 丢失 1）",
      ],
    },
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
    const pill = document.getElementById("changelog-latest");
    if (pill && ENTRIES.length) pill.textContent = ENTRIES[0].version;
  }

  global.OperatorAppChangelog = {
    ENTRIES,
    renderChangelog,
    mount,
    formatLocalDateTime,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})(window);
