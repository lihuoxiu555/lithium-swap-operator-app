/**
 * 个人换电订单 · Mock 数据与展示辅助
 * 列表 + 次页（计费/支付/更换/延期/合同/表单）
 */
(function (global) {
  const LEASE_STATUS = {
    pending: { id: "pending", label: "待确认" },
    active: { id: "active", label: "使用中" },
    parked: { id: "parked", label: "暂存中" },
    arrears: { id: "arrears", label: "已欠费" },
    ended: { id: "ended", label: "已结束" },
  };

  const SEARCH_TYPES = [
    { id: "phone", label: "用户手机号", placeholder: "请输入用户手机号或姓名" },
    { id: "battery", label: "电池编号", placeholder: "请输入电池编号" },
  ];

  const SITES = [
    { id: "all", label: "全部" },
    { id: "szjs", label: "苏州军盛" },
    { id: "ksyy", label: "昆山运营" },
    { id: "ks2", label: "昆山2级" },
    { id: "lyyy", label: "溧阳运营" },
  ];

  const SUBPAGE_META = {
    billing: { title: "订单计费记录", kind: "list" },
    pay: { title: "订单支付记录", kind: "list" },
    replace_log: { title: "更换记录", kind: "list" },
    extend_log: { title: "订单延期记录", kind: "list" },
    contract: { title: "订单合同", kind: "doc" },
    end: { title: "结束订单", kind: "form" },
    abnormal_end: { title: "异常结束", kind: "form" },
    replace_battery: { title: "电池更换", kind: "form" },
    park: { title: "暂存订单", kind: "confirm" },
    park_pickup: { title: "暂存取电", kind: "form" },
    gift_days: { title: "赠送天数", kind: "form" },
    confirm: { title: "确认订单", kind: "dialog" },
  };

  function actionsForStatus(status) {
    const commonRecords = [
      { id: "contract", label: "订单合同", color: "teal" },
      { id: "pay", label: "支付记录", color: "mint" },
      { id: "billing", label: "计费记录", color: "purple" },
    ];
    switch (status) {
      case "active":
        return [
          { id: "end", label: "结束订单", color: "red" },
          { id: "abnormal_end", label: "异常结束", color: "yellow" },
          { id: "replace_battery", label: "更换电池", color: "orange" },
          { id: "replace_log", label: "更换记录", color: "blue" },
          { id: "park", label: "暂存订单", color: "orange" },
          ...commonRecords,
        ];
      case "parked":
        return [
          { id: "end", label: "结束订单", color: "red" },
          { id: "abnormal_end", label: "异常结束", color: "yellow" },
          { id: "gift_days", label: "赠送天数", color: "cyan" },
          { id: "extend_log", label: "延期记录", color: "green" },
          { id: "park_pickup", label: "暂存取电", color: "blue" },
          ...commonRecords,
        ];
      case "arrears":
        return [
          { id: "end", label: "结束订单", color: "red" },
          { id: "abnormal_end", label: "异常结束", color: "yellow" },
          { id: "replace_battery", label: "更换电池", color: "orange" },
          { id: "replace_log", label: "更换记录", color: "blue" },
          ...commonRecords,
        ];
      case "ended":
        return [
          { id: "replace_log", label: "更换记录", color: "green" },
          { id: "contract", label: "订单合同", color: "green" },
          { id: "pay", label: "支付记录", color: "mint" },
          { id: "billing", label: "计费记录", color: "purple" },
        ];
      case "pending":
        return [
          { id: "confirm", label: "确认订单", color: "teal" },
          { id: "abnormal_end", label: "异常结束", color: "yellow" },
          ...commonRecords,
        ];
      default:
        return commonRecords;
    }
  }

  /** @type {Array<object>} */
  const LEASE_ORDERS = [
    {
      id: "lo-1",
      status: "active",
      userName: "史建国",
      phone: "18915821617",
      orderNo: "xbl2609151343039140495",
      store: "溧阳运营",
      model: "6060",
      modelLabel: "60V 60AH",
      deviceId: "BT6060060150025051127474",
      batteryNo: "035211127474",
      firstCabinetName: "",
      firstCabinetCode: "",
      rent: "0.00/月",
      deposit: "0元",
      depositPayTag: "",
      refundableDeposit: "0",
      partyA: "军盛新能源科技（苏州）有限公司",
      createdAt: "2026-09-15 13:43:04",
      expireAt: "2026-10-15 13:43:04",
      endedAt: "",
      remain: "29天23小时38分钟",
      overdue: "",
      arrearsAmount: "",
      parkStartAt: "",
      parkDays: "",
      accumRent: "",
      remark: "用户机柜取电,生成订单",
      lastSwap: "",
      billing: [
        {
          purpose: "租金",
          bookedAt: "2026-09-15 13:43:04",
          startAt: "2026-09-15 13:43:04",
          endAt: "2026-10-15 13:43:04",
          remark: "2026-09-15 13:43:04",
          status: "成功",
        },
        {
          purpose: "押金",
          bookedAt: "2026-09-15 13:43:04",
          startAt: "",
          endAt: "",
          remark: "null",
          status: "",
        },
      ],
      payments: [],
      replaces: [],
      extends: [],
    },
    {
      id: "lo-2",
      status: "active",
      userName: "周强",
      phone: "13800138001",
      orderNo: "xbl2609011000123456789",
      store: "昆山运营",
      model: "7260",
      modelLabel: "72V 60AH",
      deviceId: "BT7072060150025101148001",
      batteryNo: "035211148001",
      firstCabinetName: "陆家嘴一号柜",
      firstCabinetCode: "352101100001",
      rent: "389元/30天",
      deposit: "10元",
      depositPayTag: "微信支付",
      refundableDeposit: "10",
      partyA: "军盛新能源科技（苏州）有限公司",
      createdAt: "2026-09-01 10:00:12",
      expireAt: "2026-10-01 10:00:12",
      endedAt: "",
      remain: "15天8小时",
      overdue: "",
      arrearsAmount: "",
      parkStartAt: "",
      parkDays: "",
      accumRent: "389元",
      remark: "用户机柜取电,生成订单",
      lastSwap: "2小时前",
      billing: [
        {
          purpose: "租金",
          bookedAt: "2026-09-01 10:00:12",
          startAt: "2026-09-01 10:00:12",
          endAt: "2026-10-01 10:00:12",
          remark: "首期租金",
          status: "成功",
        },
      ],
      payments: [
        {
          amount: "389.00",
          channel: "微信支付",
          paidAt: "2026-09-01 10:00:15",
          status: "成功",
          tradeNo: "4200001234567890",
        },
      ],
      replaces: [
        {
          oldCode: "035211148000",
          newCode: "035211148001",
          reason: "故障更换",
          at: "2026-09-05 16:20:00",
          operator: "运维小王",
        },
      ],
      extends: [],
    },
    {
      id: "lo-3",
      status: "parked",
      userName: "李敏",
      phone: "15722783885",
      orderNo: "xbl2609111306410223167",
      store: "溧阳运营",
      model: "未知",
      modelLabel: "72V 60AH",
      deviceId: "",
      batteryNo: "035211101427",
      firstCabinetName: "溧阳一号柜72",
      firstCabinetCode: "035211101427",
      rent: "999元/90天",
      deposit: "10元",
      depositPayTag: "",
      refundableDeposit: "10",
      partyA: "军盛新能源科技（苏州）有限公司",
      createdAt: "2026-09-11 13:06:41",
      expireAt: "2026-12-16 15:10:59",
      endedAt: "",
      remain: "92天1小时6分钟",
      overdue: "",
      arrearsAmount: "",
      parkStartAt: "2026-09-14 23:29:27",
      parkDays: "1",
      accumRent: "999元",
      remark: "",
      lastSwap: "",
      billing: [],
      payments: [],
      replaces: [],
      extends: [
        {
          startAt: "2026-09-11 13:06:41",
          initialEndAt: "2026-12-10 13:06:41",
          modifiedExpireAt: "2026-12-15 13:06:41",
          modifiedAt: "2026-09-11 13:28:38",
          remark: "a",
          store: "溧阳运营",
          operator: "张培超88",
        },
      ],
    },
    {
      id: "lo-4",
      status: "arrears",
      userName: "赵阳",
      phone: "13092134051",
      orderNo: "xbl2609021024467916705",
      store: "昆山运营",
      model: "6060",
      modelLabel: "60V 60AH",
      deviceId: "BT6060060150025051128027",
      batteryNo: "035211128027",
      firstCabinetName: "",
      firstCabinetCode: "",
      rent: "",
      deposit: "0元",
      depositPayTag: "",
      refundableDeposit: "0",
      partyA: "军盛新能源科技（苏州）有限公司",
      createdAt: "2026-09-02 10:24:47",
      expireAt: "2026-09-04 10:24:47",
      endedAt: "",
      remain: "",
      overdue: "11天3小时40分钟",
      arrearsAmount: "131.6元",
      overdueFeeNormal: "131.6",
      parkStartAt: "",
      parkDays: "",
      accumRent: "",
      remark: "用户机柜取电,生成订单",
      lastSwap: "",
      billing: [],
      payments: [],
      replaces: [],
      extends: [],
    },
    {
      id: "lo-5",
      status: "ended",
      userName: "王肇辉",
      phone: "13753404488",
      orderNo: "xbl2603221412350669406",
      store: "昆山2级",
      model: "7260",
      modelLabel: "72V 60AH",
      deviceId: "BT7072060150025101148864",
      batteryNo: "035211148864",
      firstCabinetName: "石牌九号电动车后边",
      firstCabinetCode: "352101169696",
      rent: "389元/30天",
      deposit: "10元",
      depositPayTag: "微信支付",
      refundableDeposit: "10",
      partyA: "军盛新能源科技（苏州）有限公司",
      createdAt: "2026-03-22 14:12:35",
      expireAt: "2026-09-24 14:12:35",
      endedAt: "2026-09-15 13:03:02",
      remain: "9天7分钟",
      overdue: "",
      arrearsAmount: "",
      parkStartAt: "",
      parkDays: "",
      accumRent: "2484元",
      remark:
        "2026-09-15 13:03:02,用户在机柜(柜机编号:035211101427)归还电池(电池编号:035211148864),订单结束",
      lastSwap: "1小时3分钟",
      billing: [
        {
          purpose: "租金",
          bookedAt: "2026-03-22 14:12:35",
          startAt: "2026-03-22 14:12:35",
          endAt: "2026-04-21 14:12:35",
          remark: "首期",
          status: "成功",
        },
      ],
      payments: [],
      replaces: [],
      extends: [],
    },
    {
      id: "lo-6",
      status: "pending",
      userName: "陈晓",
      phone: "13600001111",
      orderNo: "xbl2609151500000000001",
      store: "苏州军盛",
      model: "6060",
      modelLabel: "60V 60AH",
      deviceId: "",
      batteryNo: "",
      firstCabinetName: "军盛一号柜",
      firstCabinetCode: "352101200001",
      rent: "389元/30天",
      deposit: "10元",
      depositPayTag: "",
      refundableDeposit: "10",
      partyA: "军盛新能源科技（苏州）有限公司",
      createdAt: "2026-09-15 15:00:00",
      expireAt: "",
      endedAt: "",
      remain: "",
      overdue: "",
      arrearsAmount: "",
      parkStartAt: "",
      parkDays: "",
      accumRent: "",
      remark: "待确认开通",
      lastSwap: "",
      billing: [],
      payments: [],
      replaces: [],
      extends: [],
    },
  ];

  const TAB_COUNTS = {
    pending: 2,
    all: 2579,
    active: 2263,
    parked: 313,
    arrears: 234,
    ended: 20003,
  };

  const TABS = [
    { id: "pending", label: "待确认", countKey: "pending" },
    { id: "all", label: "全部", countKey: "all" },
    { id: "active", label: "使用中", countKey: "active" },
    { id: "parked", label: "暂存中", countKey: "parked" },
    { id: "arrears", label: "已欠费", countKey: "arrears" },
    { id: "ended", label: "已结束", countKey: "ended" },
  ];

  function getOrderById(id) {
    return LEASE_ORDERS.find((o) => o.id === id) || null;
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

  function profileRows(order) {
    const rows = [];
    const push = (label, value, opts = {}) => {
      if (value === undefined || value === null || value === "") return;
      rows.push({ label, value, ...opts });
    };
    push("权益来源", "个人套餐");
    push("套餐", order.modelLabel || order.model);
    push("租金", order.rent);
    if (order.deposit) push("押金", order.deposit, { tag: order.depositPayTag || "" });
    push("到期时间", order.expireAt);
    if (order.status === "arrears") {
      push("逾期时长", order.overdue, { warn: true });
    } else if (order.remain) {
      push("剩余时长", order.remain);
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
    push("设备ID", order.deviceId, { copy: true });
    push("电池编号", order.batteryNo, { copy: true, link: true });
    push("首租机柜名称", order.firstCabinetName);
    push("首租机柜编码", order.firstCabinetCode, { copy: true });
    push("创建时间", order.createdAt);
    if (order.status === "ended") push("结束时间", order.endedAt);
    if (order.status === "parked") {
      push("暂存开始时间", order.parkStartAt);
      push("已暂存天数", order.parkDays);
    }
    if (order.status === "arrears") {
      push("欠费金额", order.arrearsAmount, { warn: true });
    }
    push("累积租金金额", order.accumRent);
    push("订单备注", order.remark);
    if (order.status === "ended" || order.status === "active" || order.lastSwap) {
      push("上次换电时间", order.lastSwap);
    }
    return rows;
  }

  function fieldRows(order) {
    return profileRows(order).concat(orderRows(order));
  }

  /** 设备展示编号：优先电池编号，其次设备 ID */
  function deviceDisplayCode(order) {
    return order.batteryNo || order.deviceId || "—";
  }

  function overdueFeeNormal(order) {
    if (order.overdueFeeNormal != null && String(order.overdueFeeNormal).trim() !== "") {
      return String(order.overdueFeeNormal);
    }
    const m = String(order.arrearsAmount || "").match(/[\d.]+/);
    return m ? m[0] : "0";
  }

  function getSubpageData(order, type) {
    if (!order) return null;
    const meta = SUBPAGE_META[type];
    if (!meta) return null;
    return {
      meta,
      order,
      billing: order.billing || [],
      payments: order.payments || [],
      replaces: order.replaces || [],
      extends: order.extends || [],
      deviceCode: deviceDisplayCode(order),
      modelLabel: order.modelLabel || order.model || "—",
      refundableDeposit: order.refundableDeposit || "0",
      overdueFeeNormal: overdueFeeNormal(order),
      partyA: order.partyA || "军盛新能源科技（苏州）有限公司",
    };
  }

  global.OperatorAppLease = {
    LEASE_STATUS,
    SEARCH_TYPES,
    SITES,
    SUBPAGE_META,
    LEASE_ORDERS,
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
  };
})(window);
