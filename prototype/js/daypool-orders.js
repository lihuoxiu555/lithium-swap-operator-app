/**
 * 人天池订单 · Mock 数据与展示辅助
 * 渠道骑手人天服务单（非批发采购；入口在换电订单页）
 */
(function (global) {
  const DAYPOOL_STATUS = {
    active: { id: "active", label: "使用中" },
    return_due: { id: "return_due", label: "待还电" },
    ended: { id: "ended", label: "已结束" },
  };

  const SEARCH_TYPES = [
    { id: "phone", label: "用户手机号", placeholder: "请输入用户手机号" },
    { id: "battery", label: "电池编号", placeholder: "请输入电池编号" },
  ];

  const SITES = [
    { id: "all", label: "全部" },
    { id: "pd", label: "浦东骑手驿站" },
    { id: "wb", label: "世博换电服务点" },
  ];

  const SUBPAGE_META = {
    consume: { title: "消耗记录", kind: "list" },
    swap: { title: "换电记录", kind: "list" },
    replace_log: { title: "更换记录", kind: "list" },
    replace_battery: { title: "电池更换", kind: "form" },
    urge: { title: "催还", kind: "toast" },
    mock_return: { title: "模拟还电", kind: "dialog" },
  };

  function actionsForStatus(status) {
    const records = [
      { id: "consume", label: "消耗记录", color: "purple" },
      { id: "swap", label: "换电记录", color: "teal" },
    ];
    switch (status) {
      case "active":
        return [{ id: "replace_battery", label: "更换电池", color: "orange" }, ...records];
      case "return_due":
        return [
          { id: "urge", label: "催还", color: "yellow" },
          { id: "mock_return", label: "模拟还电", color: "red" },
          ...records,
        ];
      case "ended":
        return [
          ...records,
          { id: "replace_log", label: "更换记录", color: "blue" },
        ];
      default:
        return records;
    }
  }

  /** @type {Array<object>} */
  const DAYPOOL_ORDERS = [
    {
      id: "dp-1",
      status: "active",
      userName: "王骑手",
      phone: "13821010001",
      orderNo: "dp2605011000123450001",
      channelName: "顺丰同城渠道",
      poolId: "QP-2601",
      team: "默认团队",
      store: "浦东骑手驿站",
      model: "7260",
      modelLabel: "72V 60AH",
      batteryNo: "035211210001",
      allocatedDays: "30",
      usedDays: "12",
      remainingDays: "18",
      todayEligibility: "已确认消耗",
      confirmReason: "换电",
      deposit: "0元",
      depositTag: "渠道担保",
      openedAt: "2026-05-01 10:00:00",
      endedAt: "",
      gateReason: "",
      recycleDays: "",
      endReason: "",
      remark: "分配即开通 · 人天服务单",
      lastSwap: "今天 08:30",
      consumes: [
        {
          date: "2026-06-09",
          reason: "换电",
          days: "1",
          swaps: "1",
          held: "是",
          status: "已确认",
        },
        {
          date: "2026-06-08",
          reason: "换电",
          days: "1",
          swaps: "2",
          held: "是",
          status: "已确认",
        },
      ],
      swaps: [
        {
          swapId: "SW2606090830",
          at: "2026-06-09 08:30",
          result: "成功",
          site: "浦东骑手驿站",
          cabinetSn: "CAB-22018",
          slotIn: "6",
          slotOut: "2",
          batIn: { sn: "035211210088", soc: "18%" },
          batOut: { sn: "035211210001", soc: "96%" },
        },
        {
          swapId: "SW2606081920",
          at: "2026-06-08 19:20",
          result: "成功",
          site: "浦东骑手驿站",
          cabinetSn: "CAB-22018",
          slotIn: "4",
          slotOut: "7",
          batIn: { sn: "035211210001", soc: "22%" },
          batOut: { sn: "035211210044", soc: "94%" },
        },
        {
          swapId: "SW2606080735",
          at: "2026-06-08 07:35",
          result: "成功",
          site: "世博换电服务点",
          cabinetSn: "CAB-22021",
          slotIn: "3",
          slotOut: "8",
          batIn: { sn: "035211210044", soc: "19%" },
          batOut: { sn: "035211210077", soc: "97%" },
        },
        {
          swapId: "SW2606051210",
          at: "2026-06-05 12:10",
          result: "成功",
          site: "浦东骑手驿站",
          cabinetSn: "CAB-22050",
          slotIn: "5",
          slotOut: "1",
          batIn: { sn: "035211210077", soc: "31%" },
          batOut: { sn: "035211210088", soc: "95%" },
        },
      ],
      replaces: [],
    },
    {
      id: "dp-2",
      status: "active",
      userName: "李骑手",
      phone: "13921020002",
      orderNo: "dp2605011005123450002",
      channelName: "顺丰同城渠道",
      poolId: "QP-2601",
      team: "默认团队",
      store: "浦东骑手驿站",
      model: "6060",
      modelLabel: "60V 60AH",
      batteryNo: "",
      allocatedDays: "30",
      usedDays: "8",
      remainingDays: "22",
      todayEligibility: "今日可用",
      confirmReason: "—",
      deposit: "0元",
      depositTag: "渠道担保",
      openedAt: "2026-05-01 10:05:00",
      endedAt: "",
      gateReason: "",
      recycleDays: "",
      endReason: "",
      remark: "今日未换电且未持电，不扣人天",
      lastSwap: "2 天前",
      consumes: [
        {
          date: "2026-06-07",
          reason: "换电",
          days: "1",
          swaps: "1",
          held: "否",
          status: "已确认",
        },
      ],
      swaps: [],
      replaces: [],
    },
    {
      id: "dp-3",
      status: "active",
      userName: "孙骑手",
      phone: "13621100010",
      orderNo: "dp2605151400123450010",
      channelName: "顺丰同城渠道",
      poolId: "QP-2601",
      team: "世博车队",
      store: "世博换电服务点",
      model: "7260",
      modelLabel: "72V 60AH",
      batteryNo: "035211210010",
      allocatedDays: "15",
      usedDays: "2",
      remainingDays: "13",
      todayEligibility: "今日可用",
      confirmReason: "—",
      deposit: "10元",
      depositTag: "微信支付",
      openedAt: "2026-05-15 14:00:00",
      endedAt: "",
      gateReason: "",
      recycleDays: "",
      endReason: "",
      remark: "世博车队 · 月度额度",
      lastSwap: "昨天 14:30",
      consumes: [],
      swaps: [
        {
          swapId: "SW2606091430",
          at: "2026-06-09 14:30",
          result: "成功",
          site: "世博换电服务点",
          cabinetSn: "CAB-22021",
          slotIn: "6",
          slotOut: "2",
          batIn: { sn: "035211210009", soc: "24%" },
          batOut: { sn: "035211210010", soc: "95%" },
        },
        {
          swapId: "SW2606021015",
          at: "2026-06-02 10:15",
          result: "成功",
          site: "世博换电服务点",
          cabinetSn: "CAB-22021",
          slotIn: "1",
          slotOut: "4",
          batIn: { sn: "035211210003", soc: "16%" },
          batOut: { sn: "035211210009", soc: "93%" },
        },
      ],
      replaces: [
        {
          oldCode: "035211210009",
          newCode: "035211210010",
          reason: "故障更换",
          at: "2026-06-02 11:20:00",
          operator: "运维小王",
        },
      ],
    },
    {
      id: "dp-4",
      status: "active",
      userName: "陈骑手",
      phone: "13521060006",
      orderNo: "dp2605011010123450006",
      channelName: "顺丰同城渠道",
      poolId: "QP-2601",
      team: "默认团队",
      store: "浦东骑手驿站",
      model: "7260",
      modelLabel: "72V 60AH",
      batteryNo: "035211210006",
      allocatedDays: "30",
      usedDays: "10",
      remainingDays: "20",
      todayEligibility: "已确认消耗",
      confirmReason: "持电池",
      deposit: "0元",
      depositTag: "渠道担保",
      openedAt: "2026-05-01 10:10:00",
      endedAt: "",
      gateReason: "",
      recycleDays: "",
      endReason: "",
      remark: "日终持电确认消耗 1 人天",
      lastSwap: "3 天前",
      consumes: [
        {
          date: "2026-06-09",
          reason: "持电池",
          days: "1",
          swaps: "0",
          held: "是",
          status: "已确认",
        },
      ],
      swaps: [],
      replaces: [],
    },
    {
      id: "dp-5",
      status: "return_due",
      userName: "吴骑手",
      phone: "13421120012",
      orderNo: "dp2605011020123450012",
      channelName: "顺丰同城渠道",
      poolId: "QP-2601",
      team: "默认团队",
      store: "浦东骑手驿站",
      model: "6060",
      modelLabel: "60V 60AH",
      batteryNo: "035211210012",
      allocatedDays: "30",
      usedDays: "30",
      remainingDays: "0",
      todayEligibility: "待还电",
      confirmReason: "—",
      deposit: "0元",
      depositTag: "渠道担保",
      openedAt: "2026-05-01 10:20:00",
      endedAt: "",
      gateReason: "个人无额度",
      recycleDays: "",
      endReason: "",
      remark: "昨日确认消耗后额度用尽，仍持电池；逾期占用从池可用扣人天",
      lastSwap: "昨天",
      consumes: [
        {
          date: "2026-06-08",
          reason: "换电",
          days: "1",
          swaps: "1",
          held: "是",
          status: "已确认",
        },
      ],
      swaps: [
        {
          swapId: "SW2606081810",
          at: "2026-06-08 18:10",
          result: "成功",
          site: "浦东骑手驿站",
          cabinetSn: "CAB-22018",
          slotIn: "9",
          slotOut: "3",
          batIn: { sn: "035211210070", soc: "21%" },
          batOut: { sn: "035211210012", soc: "94%" },
        },
      ],
      replaces: [],
    },
    {
      id: "dp-6",
      status: "ended",
      userName: "周骑手",
      phone: "13521110011",
      orderNo: "dp2605151405123450011",
      channelName: "顺丰同城渠道",
      poolId: "QP-2601",
      team: "世博车队",
      store: "世博换电服务点",
      model: "7260",
      modelLabel: "72V 60AH",
      batteryNo: "",
      allocatedDays: "30",
      usedDays: "12",
      remainingDays: "0",
      todayEligibility: "已回池",
      confirmReason: "—",
      deposit: "0元",
      depositTag: "渠道担保",
      openedAt: "2026-05-15 14:05:00",
      endedAt: "2026-06-07 16:20:00",
      gateReason: "",
      recycleDays: "18",
      endReason: "离职回池",
      remark: "离职收回未用人天，不向骑手退款",
      lastSwap: "",
      consumes: [
        {
          date: "2026-06-06",
          reason: "换电",
          days: "1",
          swaps: "1",
          held: "否",
          status: "已确认",
        },
      ],
      swaps: [
        {
          swapId: "SW2606060900",
          at: "2026-06-06 09:00",
          result: "成功",
          site: "世博换电服务点",
          cabinetSn: "CAB-22021",
          slotIn: "2",
          slotOut: "5",
          batIn: { sn: "035211210055", soc: "28%" },
          batOut: { sn: "035211210066", soc: "92%" },
        },
      ],
      replaces: [],
    },
  ];

  const TAB_COUNTS = {
    all: 186,
    active: 142,
    return_due: 11,
    ended: 33,
  };

  const TABS = [
    { id: "all", label: "全部", countKey: "all" },
    { id: "active", label: "使用中", countKey: "active" },
    { id: "return_due", label: "待还电", countKey: "return_due" },
    { id: "ended", label: "已结束", countKey: "ended" },
  ];

  function getOrderById(id) {
    return DAYPOOL_ORDERS.find((o) => o.id === id) || null;
  }

  function filterOrders(orders, opts) {
    const { tab, searchType, keyword, siteLabel } = opts;
    let list = orders.slice();
    if (tab && tab !== "all") {
      list = list.filter((o) => o.status === tab);
    }
    if (siteLabel && siteLabel !== "全部") {
      list = list.filter((o) => o.store === siteLabel);
    }
    const kw = (keyword || "").trim();
    if (kw) {
      list = list.filter((o) => {
        if (searchType === "battery") return (o.batteryNo || "").includes(kw);
        return o.phone.includes(kw);
      });
    }
    return list;
  }

  function swapsForUser(phone) {
    return DAYPOOL_ORDERS.filter((o) => o.phone === phone)
      .flatMap((o) =>
        (o.swaps || []).map((s) => ({
          ...s,
          orderNo: o.orderNo,
          userName: o.userName,
          phone: o.phone,
        }))
      )
      .sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }

  function addReplace(orderId, patch) {
    const order = getOrderById(orderId);
    if (!order) return { error: "订单不存在" };
    const row = {
      oldCode: order.batteryNo || "—",
      newCode: String(patch.newCode || "").trim(),
      reason: String(patch.reason || "").trim(),
      at: "刚刚",
      operator: "演示员",
    };
    order.replaces = [row].concat(order.replaces || []);
    order.batteryNo = row.newCode;
    return { order, row };
  }

  function profileRows(order) {
    const rows = [];
    const push = (label, value, opts = {}) => {
      if (value === undefined || value === null || value === "") return;
      rows.push({ label, value, ...opts });
    };
    push("权益来源", "渠道人天");
    push("渠道商", order.channelName);
    push("额度池", order.poolId, { copy: true });
    push("团队", order.team);
    push("已分配人天", order.allocatedDays);
    push("已消耗人天", order.usedDays);
    push("个人剩余", order.remainingDays, {
      warn: order.status === "return_due",
    });
    push("今日资格", order.todayEligibility, {
      warn: order.status === "return_due",
    });
    if (order.deposit) {
      push("押金", order.deposit, { tag: order.depositTag || "" });
    }
    return rows;
  }

  function orderRows(order) {
    const rows = [];
    const push = (label, value, opts = {}) => {
      if (value === undefined || value === null || value === "") return;
      rows.push({ label, value, ...opts });
    };
    push("订单编号", order.orderNo, { copy: true });
    push("站点", order.store);
    push("电池型号", order.modelLabel || order.model);
    push("电池编号", order.batteryNo, { copy: true, link: true });
    if (order.confirmReason && order.confirmReason !== "—") {
      push("确认口径", order.confirmReason);
    }
    push("开通时间", order.openedAt);
    if (order.status === "ended") {
      push("结束时间", order.endedAt);
      push("结束原因", order.endReason);
      push("回池人天", order.recycleDays);
    }
    if (order.status === "return_due") {
      push("闸门原因", order.gateReason, { warn: true });
    }
    push("订单备注", order.remark);
    if (order.lastSwap) push("上次换电时间", order.lastSwap);
    return rows;
  }

  function fieldRows(order) {
    return profileRows(order).concat(orderRows(order));
  }

  function deviceDisplayCode(order) {
    return order.batteryNo || "—";
  }

  function getSubpageData(order, type) {
    if (!order) return null;
    const meta = SUBPAGE_META[type];
    if (!meta) return null;
    return {
      meta,
      order,
      consumes: order.consumes || [],
      swaps: swapsForUser(order.phone),
      replaces: order.replaces || [],
      deviceCode: deviceDisplayCode(order),
      modelLabel: order.modelLabel || order.model || "—",
    };
  }

  global.OperatorAppDaypool = {
    DAYPOOL_STATUS,
    SEARCH_TYPES,
    SITES,
    SUBPAGE_META,
    DAYPOOL_ORDERS,
    TAB_COUNTS,
    TABS,
    actionsForStatus,
    filterOrders,
    profileRows,
    orderRows,
    fieldRows,
    getOrderById,
    getSubpageData,
    deviceDisplayCode,
    swapsForUser,
    addReplace,
  };
})(window);
