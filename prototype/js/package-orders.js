/**
 * 套餐订单 · 个人套餐购买（已支付 / 待支付）
 * 与换电订单分离；口径对齐 C 端套餐实付
 */
(function (global) {
  const PAY_STATUS = {
    paid: { id: "paid", label: "已支付" },
    pending: { id: "pending", label: "待支付" },
  };

  const TABS = [
    { id: "all", label: "全部" },
    { id: "paid", label: "已支付" },
    { id: "pending", label: "待支付" },
  ];

  const ORDERS = [
    {
      id: "pkg-1",
      orderNo: "SUB2609151343039140495",
      userName: "史建国",
      phone: "18915821617",
      packageName: "60V 60AH · 包月30天",
      amount: 389,
      status: "paid",
      paidAt: "2026-09-15 13:43:04",
      createdAt: "2026-09-15 13:43:04",
      site: "溧阳运营",
      swapOrderNo: "xbl2609151343039140495",
      channel: "微信支付",
    },
    {
      id: "pkg-2",
      orderNo: "SUB2609011000123456789",
      userName: "周强",
      phone: "13800138001",
      packageName: "72V 60AH · 30天",
      amount: 389,
      status: "paid",
      paidAt: "2026-09-01 10:00:12",
      createdAt: "2026-09-01 10:00:12",
      site: "昆山运营",
      swapOrderNo: "xbl2609011000123456789",
      channel: "微信支付",
    },
    {
      id: "pkg-3",
      orderNo: "SUB2609021024467916705",
      userName: "赵阳",
      phone: "13092134051",
      packageName: "60V 60AH · 30天",
      amount: 389,
      status: "paid",
      paidAt: "2026-09-02 10:24:47",
      createdAt: "2026-09-02 10:24:47",
      site: "昆山运营",
      swapOrderNo: "xbl2609021024467916705",
      channel: "微信支付",
    },
    {
      id: "pkg-4",
      orderNo: "SUB2609111306410223167",
      userName: "李敏",
      phone: "15722783885",
      packageName: "72V 60AH · 90天",
      amount: 999,
      status: "paid",
      paidAt: "2026-09-11 13:06:41",
      createdAt: "2026-09-11 13:06:41",
      site: "溧阳运营",
      swapOrderNo: "xbl2609111306410223167",
      channel: "微信支付",
    },
    {
      id: "pkg-5",
      orderNo: "SUB2609151500000000001",
      userName: "陈晓",
      phone: "13600001111",
      packageName: "60V 60AH · 30天",
      amount: 389,
      status: "pending",
      paidAt: "",
      createdAt: "2026-09-15 15:00:00",
      site: "苏州军盛",
      swapOrderNo: "xbl2609151500000000001",
      channel: "—",
    },
    {
      id: "pkg-6",
      orderNo: "SUB2609201200000000002",
      userName: "刘洋",
      phone: "13912345678",
      packageName: "72V 60AH · 30天",
      amount: 389,
      status: "pending",
      paidAt: "",
      createdAt: "2026-09-20 12:00:00",
      site: "浦东骑手驿站",
      swapOrderNo: "",
      channel: "—",
    },
  ];

  function filterOrders(tab, kw) {
    let list = ORDERS.slice();
    if (tab && tab !== "all") {
      list = list.filter((o) => o.status === tab);
    }
    const q = (kw || "").trim();
    if (q) {
      list = list.filter(
        (o) =>
          o.phone.includes(q) ||
          o.userName.includes(q) ||
          o.orderNo.includes(q) ||
          (o.swapOrderNo && o.swapOrderNo.includes(q))
      );
    }
    return list;
  }

  function statusLabel(status) {
    return (PAY_STATUS[status] && PAY_STATUS[status].label) || status;
  }

  global.OperatorAppPackageOrders = {
    TABS,
    PAY_STATUS,
    ORDERS,
    filterOrders,
    statusLabel,
  };
})(window);
