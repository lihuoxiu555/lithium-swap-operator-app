/**
 * 经营 · 经营统计 / 设备统计 Mock
 * 字段与公式对齐 PC 一期（docs/字段口径-对齐PC一期.md）
 * 繁忙度口径对齐 PC「站点经营分析」：不展示站点收入
 */
(function (global) {
  const BIZ_YEAR_MIN = 2026;
  const DEMO_TODAY = { year: 2026, month: 9, day: 17 };

  /** 实时快照，不随图表时间筛选变化 */
  const BIZ_KPI = {
    sitesOnline: 4,
    cabOnline: 3,
    batOnline: 10,
    personalUsers: 5,
    personalFrozen: 1,
    channelUsers: 5,
  };

  const BUSY_SITES = [
    {
      id: "ST-SH-01",
      name: "浦东骑手驿站",
      address: "张杨路1588号",
      cabOnline: 2,
      cabTotal: 3,
      slotUsed: 24,
      slotTotal: 36,
      waiting: 2,
      peak: "11:00–14:00",
      hotHour: "12:00",
      hotCount: 18,
    },
    {
      id: "ST-SH-02",
      name: "世博换电服务点",
      address: "世博大道1368号",
      cabOnline: 1,
      cabTotal: 1,
      slotUsed: 8,
      slotTotal: 12,
      waiting: 0,
      peak: "17:00–19:00",
      hotHour: "18:00",
      hotCount: 7,
    },
    {
      id: "ST-SH-JD",
      name: "京东物流专属站",
      address: "康桥路888号",
      cabOnline: 4,
      cabTotal: 4,
      slotUsed: 18,
      slotTotal: 32,
      waiting: 1,
      peak: "07:00–09:00",
      hotHour: "08:00",
      hotCount: 11,
    },
    {
      id: "ST-SH-LG",
      name: "临港偏远站",
      address: "临港大道1888号",
      cabOnline: 2,
      cabTotal: 2,
      slotUsed: 6,
      slotTotal: 16,
      waiting: 0,
      peak: "12:00–13:00",
      hotHour: "12:00",
      hotCount: 3,
    },
  ];

  function slotUtil(row) {
    if (!row.slotTotal) return 0;
    return Math.round((row.slotUsed / row.slotTotal) * 100);
  }

  function busyLevel(row) {
    const util = slotUtil(row);
    if (row.waiting >= 3 || util >= 85) return "高";
    if (row.waiting >= 1 || util >= 60) return "中";
    return "低";
  }

  /** 员工 dataScope=sites 时按 siteIds 裁列表；管理员全量。KPI 仍主体全量。 */
  function busySitesForScope(scope) {
    const all = BUSY_SITES.slice();
    if (!scope || scope.mode === "all") return all;
    const ids = scope.siteIds;
    if (!ids || !ids.length) return [];
    const set = {};
    ids.forEach((id) => {
      set[id] = true;
    });
    return all.filter((s) => set[s.id]);
  }

  function bizKpi() {
    return BIZ_KPI;
  }

  const BIZ_TABS = [
    { id: "charts", label: "图表" },
    { id: "busy", label: "站点繁忙度" },
  ];

  /** 图表 Tab 时间：今日 / 近7日 + 自然月（decision-052） */
  const BIZ_CHART_MODES = [
    { id: "today", label: "今日" },
    { id: "7d", label: "近7日" },
    { id: "month", label: "自然月" },
  ];

  function bizYears() {
    const years = [];
    for (let y = BIZ_YEAR_MIN; y <= DEMO_TODAY.year; y++) years.push(y);
    return years;
  }

  function bizMonthsForYear(year) {
    const maxM = year === DEMO_TODAY.year ? DEMO_TODAY.month : 12;
    return Array.from({ length: maxM }, (_, i) => i + 1);
  }

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function sampleDays(start, end, maxPoints) {
    if (end - start + 1 <= maxPoints) {
      const arr = [];
      for (let d = start; d <= end; d++) arr.push(d);
      return arr;
    }
    const arr = [];
    for (let i = 0; i < maxPoints; i++) {
      arr.push(Math.round(start + (i * (end - start)) / (maxPoints - 1)));
    }
    return arr;
  }

  /** 今日：按 4 小时段；实付合计 4690 对齐工作台摘要 */
  const TODAY_PRESET = {
    labels: ["0–4", "4–8", "8–12", "12–16", "16–20", "20–24"],
    periodLabel: "今日",
    yoyHint: "去年同期同日同时段",
    rent: [210, 180, 920, 1480, 1260, 640],
    swaps: [2, 4, 18, 28, 22, 12],
    newUser: [0, 0, 1, 2, 1, 0],
    orderNew: [0, 1, 3, 4, 2, 1],
    dau: [4, 6, 12, 18, 16, 8],
  };

  /** 近 7 自然日 Mock */
  const SEVEN_DAY_PRESET = {
    labels: ["09-11", "09-12", "09-13", "09-14", "09-15", "09-16", "09-17"],
    periodLabel: "近7日",
    yoyHint: "去年同期同 7 自然日",
    rent: [2860, 3120, 2980, 3340, 3010, 2760, 2480],
    swaps: [78, 92, 84, 101, 88, 86, 83],
    newUser: [3, 4, 2, 5, 3, 2, 4],
    orderNew: [6, 8, 5, 9, 7, 4, 6],
    dau: [18, 21, 19, 24, 20, 17, 19],
  };

  const MONTH_PRESETS = {
    "2026-09": SEVEN_DAY_PRESET,
  };

  function mockMetric(year, month, day, kind) {
    const base = {
      rent: 2400,
      swaps: 85,
      dau: 20,
      orderNew: 6,
      newUser: 3,
    };
    const w = (year * 367 + month * 31 + day) % 97;
    const jitter = 0.85 + (w % 25) / 100;
    const floor = kind === "newUser" ? 0 : 1;
    return Math.max(
      floor,
      Math.round(base[kind] * jitter * (0.82 + (month % 4) * 0.06))
    );
  }

  function buildMonthChart(year, month) {
    const presetKey = year + "-" + String(month).padStart(2, "0");
    const preset = MONTH_PRESETS[presetKey];
    if (preset) {
      return {
        ...preset,
        periodLabel: year + "年" + month + "月",
        yoyHint: "去年同期同月",
      };
    }
    const dim = daysInMonth(year, month);
    let endDay = dim;
    if (year === DEMO_TODAY.year && month === DEMO_TODAY.month) {
      endDay = DEMO_TODAY.day;
    }
    const days = sampleDays(1, endDay, 7);
    const labels = days.map(
      (d) =>
        String(month).padStart(2, "0") + "-" + String(d).padStart(2, "0")
    );
    return {
      labels,
      periodLabel: year + "年" + month + "月",
      yoyHint: "去年同期同月",
      rent: days.map((d) => mockMetric(year, month, d, "rent")),
      swaps: days.map((d) => mockMetric(year, month, d, "swaps")),
      dau: days.map((d) => mockMetric(year, month, d, "dau")),
      orderNew: days.map((d) => mockMetric(year, month, d, "orderNew")),
      newUser: days.map((d) => mockMetric(year, month, d, "newUser")),
    };
  }

  /** 去年同期同月 Mock：约为本期的 72%–88% */
  function yoyValues(values) {
    return values.map((v, i) => {
      if (!v) return 0;
      const ratio = 0.72 + ((i * 7 + 3) % 17) / 100;
      return Math.max(1, Math.round(v * ratio));
    });
  }

  function withYoy(chart) {
    return {
      ...chart,
      rentYoy: yoyValues(chart.rent),
      swapsYoy: yoyValues(chart.swaps),
      dauYoy: yoyValues(chart.dau),
      orderNewYoy: yoyValues(chart.orderNew),
      newUserYoy: yoyValues(chart.newUser),
    };
  }

  function bizCharts(mode, year, month) {
    const chartMode = mode || "7d";
    if (chartMode === "today") return withYoy(TODAY_PRESET);
    if (chartMode === "7d") return withYoy(SEVEN_DAY_PRESET);
    const y = Number(year) || DEMO_TODAY.year;
    const m = Number(month) || DEMO_TODAY.month;
    return withYoy(buildMonthChart(y, m));
  }

  /**
   * 工作台摘要：今日三卡 + 用户数据 + 电池数据（decision-055）
   * 三卡无时间筛，点整区进经营统计。
   */
  function homeSummary() {
    const personalUsers = BIZ_KPI.personalUsers;
    const channelUsers = BIZ_KPI.channelUsers;
    const personalFrozen = BIZ_KPI.personalFrozen;
    return {
      bizCards: [
        { key: "swaps", val: 86, lab: "今日换电次数（次）" },
        { key: "riders", val: 18, lab: "今日换电人数（人）" },
        { key: "pay", val: 4690, lab: "今日套餐收入（元）" },
      ],
      userSection: {
        title: "用户数据",
        cards: [
          { key: "newToday", val: 2, lab: "今日新增" },
          { key: "renewToday", val: 5, lab: "今日续费" },
          { key: "expire3d", val: 3, lab: "3天内到期" },
          { key: "noSwap3d", val: 6, lab: "3天未换电" },
          { key: "terminateToday", val: 1, lab: "今日退租" },
          { key: "returnBatToday", val: 2, lab: "今日退电" },
          {
            key: "overdue",
            val: 4,
            lab: "已逾期",
            link: { action: "open-todo", type: "overdue" },
          },
          {
            key: "validUsers",
            val: personalUsers + channelUsers,
            lab: "总用户（有效）",
            sub: `个人 ${personalUsers} · 渠道 ${channelUsers}`,
            link: { action: "open-module", id: "biz.stats" },
          },
          { key: "frozen", val: personalFrozen, lab: "冻结中" },
        ],
      },
      batterySection: {
        title: "电池数据",
        link: { action: "open-module", id: "ops.deviceStats" },
        cards: [
          { key: "batTotal", val: HOME_BATTERY.batTotal, lab: "电池总数" },
          { key: "batInUse", val: HOME_BATTERY.batInUse, lab: "使用中" },
          { key: "batIdle", val: HOME_BATTERY.batIdle, lab: "空闲" },
        ],
      },
    };
  }

  /** 首页电池三指标 · 总数 = 使用中 + 空闲 + 离线/维修 */
  const HOME_BATTERY = {
    batTotal: 12,
    batInUse: 5,
    batIdle: 5,
    batOffline: 2,
  };

  const DEVICE_KPI = {
    cabTotal: 6,
    cabOnline: 3,
    cabOffline: 2,
    cabDisabled: 1,
    cabUnassigned: 2,
    batTotal: 12,
    batOnline: 10,
    batOffline: 2,
    batInCab: 8,
    batHeld: 1,
    batOut: 3,
    batIdle: 5,
    batInUse: 5,
    healthOk: 11,
    healthWarn: 1,
  };

  /**
   * 设备概况 · 对齐 PC 总览规格（柜机/电池/站点/仓口）
   * 数值按本主体台账缩放；0 值仍展示
   */
  const DEVICE_OVERVIEW = [
    {
      id: "cab",
      title: "柜机",
      items: [
        { key: "cabTotal", label: "总数", value: 6 },
        { key: "cabOnline", label: "在线", value: 3 },
        { key: "cabOffline", label: "离线", value: 2 },
        { key: "cabDisabled", label: "停用", value: 1 },
      ],
    },
    {
      id: "bat",
      title: "电池",
      items: [
        { key: "batTotal", label: "总数", value: 12 },
        { key: "batOnline", label: "在线", value: 10 },
        { key: "batOffline", label: "离线", value: 2 },
        { key: "batInCab", label: "在柜", value: 8 },
        { key: "batHeld", label: "柜外-用户", value: 1 },
        { key: "batOut", label: "柜外", value: 3 },
      ],
    },
    {
      id: "site",
      title: "站点",
      items: [
        { key: "siteOpen", label: "在营", value: 4 },
        { key: "siteBuild", label: "建设中", value: 1 },
        { key: "siteStop", label: "已停用", value: 1 },
      ],
    },
    {
      id: "slot",
      title: "仓口",
      items: [
        { key: "slotTotal", label: "总数", value: 72 },
        { key: "slotUsed", label: "占用", value: 56 },
      ],
    },
  ];

  const DEVICE_BY_SITE = [
    { name: "浦东骑手驿站", cab: 3, cabOnline: 2, bat: 7, batInCab: 5 },
    { name: "世博换电服务点", cab: 1, cabOnline: 1, bat: 3, batInCab: 2 },
    { name: "未分配站点", cab: 2, cabOnline: 0, bat: 2, batInCab: 0 },
  ];

  global.OperatorAppOpsStats = {
    BIZ_YEAR_MIN,
    DEMO_TODAY,
    BIZ_TABS,
    BIZ_CHART_MODES,
    BUSY_SITES,
    DEVICE_KPI,
    DEVICE_OVERVIEW,
    DEVICE_BY_SITE,
    bizYears,
    bizMonthsForYear,
    bizKpi,
    bizCharts,
    homeSummary,
    slotUtil,
    busyLevel,
    busySitesForScope,
  };
})(window);
