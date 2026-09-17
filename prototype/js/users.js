/**
 * 其他 · 用户管理 / 短信验证码 / 用户支付记录
 * 空值展示「—」；字段对齐 PC 一期用户 / 资金实收。实名认证由平台处理，不在运营商 APP。
 */
(function (global) {
  const PAY_TABS = [
    { id: "success", label: "套餐支付" },
    { id: "occupy", label: "逾期占用费" },
    { id: "refund", label: "退款" },
  ];

  const USERS = [
    {
      id: "xur2609161444522034893",
      name: "车贵益",
      phone: "15995582833",
      emergency: "15995582833",
      idNo: "533323199405111832",
      gender: "",
      channel: "",
      store: "浦东骑手驿站",
      phoneAuth: "已认证",
      idAuth: "已认证",
      authWay: "自动通过",
      kyc: "done",
      pkg: "包月30天",
      realName: "已实名",
      serviceStatus: "服务中",
      depositWay: "实付（¥99）",
      depositStatus: "在押",
    },
    {
      id: "xur26091518915821617",
      name: "史建国",
      phone: "18915821617",
      emergency: "18915821617",
      idNo: "320481198801011234",
      gender: "男",
      channel: "",
      store: "溧阳运营",
      phoneAuth: "已认证",
      idAuth: "已认证",
      authWay: "自动通过",
      kyc: "done",
      realName: "已实名",
      serviceStatus: "服务中",
      depositWay: "实付",
      depositStatus: "在押",
    },
    {
      id: "xur2609161429282975169",
      name: "",
      phone: "18221327286",
      emergency: "",
      idNo: "",
      gender: "",
      channel: "",
      store: "浦东骑手驿站",
      phoneAuth: "已认证",
      idAuth: "未认证",
      authWay: "",
      kyc: "none",
      realName: "未实名",
      serviceStatus: "",
      depositWay: "",
      depositStatus: "",
    },
    {
      id: "xur2609161346268469058",
      name: "",
      phone: "18988385268",
      emergency: "",
      idNo: "",
      gender: "",
      channel: "",
      store: "世博换电服务点",
      phoneAuth: "已认证",
      idAuth: "未认证",
      authWay: "",
      kyc: "none",
      realName: "未实名",
      serviceStatus: "",
      depositWay: "",
      depositStatus: "",
    },
    {
      id: "xur26060913821010001",
      name: "王骑手",
      phone: "13821010001",
      emergency: "13821010001",
      idNo: "310101199201011234",
      gender: "男",
      channel: "顺丰同城渠道",
      store: "浦东骑手驿站",
      phoneAuth: "已认证",
      idAuth: "已认证",
      authWay: "自动通过",
      kyc: "done",
      realName: "已实名",
      serviceStatus: "服务中",
      depositWay: "渠道担保（顺丰同城）",
      depositStatus: "",
    },
  ];

  const SMS = [
    {
      id: "sms-1",
      phone: "15995582833",
      code: "535770",
      userName: "车贵益",
      idNo: "533323199405111832",
      company: "锂电快换",
      createdAt: "2026-09-16 14:44:34",
      status: "发送成功",
    },
    {
      id: "sms-2",
      phone: "18988385268",
      code: "951349",
      userName: "",
      idNo: "",
      company: "锂电快换",
      createdAt: "2026-09-16 14:43:46",
      status: "发送成功",
    },
    {
      id: "sms-3",
      phone: "18221327286",
      code: "884702",
      userName: "",
      idNo: "",
      company: "锂电快换",
      createdAt: "2026-09-16 14:41:12",
      status: "发送成功",
    },
    {
      id: "sms-4",
      phone: "13821010001",
      code: "102938",
      userName: "王骑手",
      idNo: "310101199201011234",
      company: "锂电快换",
      createdAt: "2026-09-16 09:12:08",
      status: "发送成功",
    },
  ];

  const MCH_WX = "1900000123***";
  const PAYEE = "锂电快换";

  /** 对齐 PC fundReceipts：套餐支付 / 电池占用费 / 退款出款；不含额度池采购、待审核 */
  const PAYMENTS = [
    {
      id: "RC260916001",
      tab: "success",
      type: "套餐支付",
      order: "SUB260916001",
      site: "浦东骑手驿站",
      userName: "车贵益",
      phone: "15995582833",
      pkg: "包月30天",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 99,
      fee: 1.78,
      net: 97.22,
      channel: "微信支付",
      time: "2026-09-16 14:46:02",
      status: "支付成功",
      note: "",
    },
    {
      id: "RC260607ME",
      tab: "success",
      type: "套餐支付",
      order: "SUB260607ME",
      site: "浦东骑手驿站",
      userName: "陈骑手",
      phone: "13821012301",
      pkg: "30天畅换",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 299,
      fee: 5.38,
      net: 293.62,
      channel: "微信支付",
      time: "2026-06-07 11:30",
      status: "支付成功",
      note: "",
    },
    {
      id: "RC260524001",
      tab: "success",
      type: "套餐支付",
      order: "SUB260524001",
      site: "浦东骑手驿站",
      userName: "张骑手",
      phone: "13821011028",
      pkg: "包月30天",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 299,
      fee: 5.38,
      net: 293.62,
      channel: "微信支付",
      time: "2026-05-01 09:12",
      status: "支付成功",
      note: "",
    },
    {
      id: "RC260525001",
      tab: "success",
      type: "套餐支付",
      order: "SUB260525001",
      site: "世博换电服务点",
      userName: "钱骑手",
      phone: "13621011055",
      pkg: "包月30天",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 299,
      fee: 5.38,
      net: 293.62,
      channel: "微信支付",
      time: "2026-05-15 10:30",
      status: "支付成功",
      note: "",
    },
    {
      id: "RC260610088",
      tab: "success",
      type: "套餐支付",
      order: "SUB260610088",
      site: "浦东骑手驿站",
      userName: "周骑手",
      phone: "13821012201",
      pkg: "7天套餐",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 89,
      fee: 0.89,
      net: 88.11,
      channel: "微信支付",
      time: "2026-06-03 08:00",
      status: "支付成功",
      note: "",
    },
    {
      id: "RC260608015",
      tab: "success",
      type: "套餐支付",
      order: "SUB260608015",
      site: "世博换电服务点",
      userName: "孙骑手",
      phone: "13921012199",
      pkg: "单次换电",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 9.9,
      fee: 0.1,
      net: 9.8,
      channel: "微信支付",
      time: "2026-06-08 15:50",
      status: "支付成功",
      note: "",
    },
    {
      id: "RC260609001",
      tab: "success",
      type: "套餐支付",
      order: "SUB260609001",
      site: "浦东骑手驿站",
      userName: "王骑手",
      phone: "13821010001",
      pkg: "包月30天",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 299,
      fee: 5.38,
      net: 293.62,
      channel: "微信支付",
      time: "2026-06-09 10:00",
      status: "支付成功",
      note: "",
    },
    {
      id: "RC260917OCC",
      tab: "occupy",
      type: "电池占用费",
      order: "OCC260917001",
      site: "溧阳运营",
      userName: "史建国",
      phone: "18915821617",
      pkg: "逾期占用",
      payee: PAYEE,
      mch: MCH_WX,
      amount: 15,
      fee: 0,
      net: 15,
      channel: "微信支付",
      time: "2026-09-17 09:12:00",
      status: "支付成功",
      note: "逾期占用费 · 全额进运营商不进清分",
    },
    {
      id: "RC260601099R",
      tab: "refund",
      type: "退款出款",
      order: "SUB260601099",
      site: "浦东骑手驿站",
      userName: "测试用户A",
      phone: "13521019001",
      pkg: "包月30天",
      payee: PAYEE,
      mch: MCH_WX,
      amount: -186,
      fee: 0,
      net: -186,
      channel: "原路退回",
      time: "2026-06-01 10:15",
      status: "已退",
      note: "RF-260601-003 中途完结·套餐退",
    },
    {
      id: "RC260608015R",
      tab: "refund",
      type: "退款出款",
      order: "SUB260608015",
      site: "世博换电服务点",
      userName: "孙骑手",
      phone: "13921012199",
      pkg: "单次换电",
      payee: PAYEE,
      mch: MCH_WX,
      amount: -9.9,
      fee: 0,
      net: -9.9,
      channel: "原路退回",
      time: "2026-06-08 16:06",
      status: "已退",
      note: "RF-260608-002 单次未换电退订",
    },
  ];

  function dash(v) {
    if (v == null || v === "" || v === "null") return "—";
    return String(v);
  }

  function getUser(id) {
    return USERS.find((u) => u.id === id || u.phone === id) || null;
  }

  function orderTime(o) {
    return o.createdAt || o.openedAt || o.endedAt || "";
  }

  function latestByPhone(list, phone) {
    let best = null;
    (list || []).forEach((o) => {
      if (o.phone !== phone) return;
      if (!best || orderTime(o) > orderTime(best)) best = o;
    });
    return best;
  }

  /** 个人套餐 / 渠道额度 / 持电：有则展示，无则空（—）。生效套餐不含已结束单。 */
  function enrichUser(u) {
    const lease = latestByPhone(
      global.OperatorAppLease && global.OperatorAppLease.LEASE_ORDERS,
      u.phone
    );
    const dp = latestByPhone(
      global.OperatorAppDaypool && global.OperatorAppDaypool.DAYPOOL_ORDERS,
      u.phone
    );
    let pkg = u.pkg || "";
    let pkgOn = false;
    if (lease && lease.status && lease.status !== "ended") {
      pkg = lease.modelLabel || lease.model || pkg;
      pkgOn = true;
    } else if (pkg) {
      pkgOn = true;
    }
    let quota = "";
    if (dp && dp.status && dp.status !== "ended") {
      const left = dp.remainingDays != null && dp.remainingDays !== "" ? dp.remainingDays : "—";
      quota =
        (dp.channelName ? dp.channelName + " · " : "") +
        "剩余" +
        left +
        "人天" +
        (dp.poolId ? "（" + dp.poolId + "）" : "");
    }
    let batterySn = "";
    const holdLease = lease && lease.status !== "ended" && lease.batteryNo;
    const holdDp = dp && dp.status !== "ended" && dp.batteryNo;
    if (holdLease && holdDp) {
      batterySn = orderTime(lease) >= orderTime(dp) ? lease.batteryNo : dp.batteryNo;
    } else if (holdLease) {
      batterySn = lease.batteryNo;
    } else if (holdDp) {
      batterySn = dp.batteryNo;
    }
    return Object.assign({}, u, { pkg, pkgOn, quota, batterySn });
  }

  function filterUsers(kw) {
    const q = (kw || "").trim();
    return USERS.filter((u) => {
      if (!q) return true;
      return (
        (u.name || "").includes(q) ||
        (u.phone || "").includes(q) ||
        (u.id || "").includes(q)
      );
    }).map(enrichUser);
  }

  function maskIdNo(idNo) {
    if (!idNo || idNo.length < 8) return idNo || "—";
    return idNo.slice(0, 3) + "*".repeat(Math.max(0, idNo.length - 7)) + idNo.slice(-4);
  }

  function filterSms(kw) {
    const q = (kw || "").trim();
    if (!q) return SMS.slice();
    return SMS.filter(
      (s) => (s.phone || "").includes(q) || (s.name || s.userName || "").includes(q)
    );
  }

  function money(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return "—";
    const abs = Math.abs(v).toFixed(2);
    return v < 0 ? "-¥" + abs : "¥" + abs;
  }

  function filterPay(kw, tab) {
    const q = (kw || "").trim().toLowerCase();
    return PAYMENTS.filter((p) => {
      if (tab && p.tab !== tab) return false;
      if (!q) return true;
      return (
        String(p.id || "").toLowerCase().includes(q) ||
        String(p.order || "").toLowerCase().includes(q) ||
        String(p.userName || "").toLowerCase().includes(q) ||
        String(p.phone || "").includes(q) ||
        String(p.pkg || "").toLowerCase().includes(q) ||
        String(p.note || "").toLowerCase().includes(q)
      );
    });
  }

  global.OperatorAppUsers = {
    PAY_TABS,
    USERS,
    SMS,
    PAYMENTS,
    dash,
    getUser,
    filterUsers,
    maskIdNo,
    filterSms,
    filterPay,
    money,
  };
})(window);
