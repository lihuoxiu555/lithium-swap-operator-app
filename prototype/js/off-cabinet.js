/**
 * 柜外电池作业 · Mock + 流程（柜外换电/退电/领电、远程出电）
 * 决策 decision-067 · 跨网作业 decision-071
 */
(function (global) {
  const SESSION_OPERATOR = { id: "op-lh", name: "锂电快换" };
  const L1_BATTERY_FEE = 2.0;

  const ORDER_TYPES = {
    off_swap: { id: "off_swap", label: "柜外换电" },
    off_return: { id: "off_return", label: "柜外退电" },
    off_pickup: { id: "off_pickup", label: "柜外领电" },
    remote_out: { id: "remote_out", label: "远程出电" },
  };

  const SWAP_STATUS = {
    in_progress: "进行中",
    swap_timeout: "换电超时",
    swap_failed: "换电失败",
    completed: "已完成",
  };

  /** @type {Record<string, { sn: string, boundUserPhone?: string, deviceOwnerId?: string, deviceOwnerName?: string, inCabinet?: { cab: string, port: number, door: string } }>} */
  let BATTERIES = {
    "035211127474": {
      sn: "035211127474",
      boundUserPhone: "18915821617",
      deviceOwnerId: SESSION_OPERATOR.id,
      deviceOwnerName: SESSION_OPERATOR.name,
    },
    /** 他网电池 · 柜外作业不校验归属，成单仍计跨网费（decision-071） */
    "035211888777": {
      sn: "035211888777",
      deviceOwnerId: "op-jd",
      deviceOwnerName: "京东换电",
    },
    "035211210001": { sn: "035211210001", boundUserPhone: "13800138001" },
    "492391002233": {
      sn: "492391002233",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 7,
        door: "关闭",
        soc: 41,
      },
    },
    "492391883344": {
      sn: "492391883344",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 2,
        door: "关闭",
        soc: 55,
      },
    },
    "492399990003": {
      sn: "492399990003",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 8,
        door: "关闭",
        soc: 65,
      },
    },
    "492399990004": {
      sn: "492399990004",
      boundUserPhone: "13600003333",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 6,
        door: "关闭",
        soc: 82,
      },
    },
    "492399990001": {
      sn: "492399990001",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 3,
        door: "关闭",
        soc: 92,
      },
    },
    "492399990002": {
      sn: "492399990002",
      boundUserPhone: "13700002222",
      inCabinet: {
        cabinetId: "cab-pd-1",
        siteName: "浦东骑手驿站",
        cabinetName: "浦东 1 号柜",
        port: 5,
        door: "关闭",
        soc: 78,
      },
    },
  };

  /** @type {Array<object>} */
  let USERS = [
    {
      id: "u-shi",
      name: "史建国",
      phone: "18915821617",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: "035211127474",
      waitPickup: false,
    },
    {
      id: "u-wang",
      name: "王骑手",
      phone: "13800138001",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: null,
      waitPickup: true,
    },
    {
      id: "u-chen",
      name: "陈晓",
      phone: "13900001111",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: null,
      waitPickup: false,
      location: {
        lat: 31.2376,
        lng: 121.5068,
        address: "上海市浦东新区张杨路梅园新村段（LBS）",
        source: "LBS",
        reportedAt: "2 分钟前",
      },
    },
    {
      id: "u-zhao",
      name: "赵骑手",
      phone: "13600003333",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: "492399990004",
      waitPickup: false,
      heldInCabinet: true,
      location: {
        lat: 31.2312,
        lng: 121.5018,
        address: "上海市浦东新区潍坊路附近（LBS）",
        source: "LBS",
        reportedAt: "3 分钟前",
      },
    },
    {
      id: "u-li",
      name: "李骑手",
      phone: "13700002222",
      packageLabel: "包月30天 · 生效中",
      packageOk: true,
      heldSn: "492399990002",
      waitPickup: false,
      heldInCabinet: true,
      location: {
        lat: 31.2284,
        lng: 121.4972,
        address: "上海市浦东新区浦东南路地铁站（LBS）",
        source: "LBS",
        reportedAt: "5 分钟前",
      },
    },
  ];

  /** @type {Record<string, { lat: number, lng: number, address: string, source: string }>} */
  /** @type {Set<string>} cabinetId:port */
  const DISABLED_PORTS = new Set();

  const CAB_LOCATIONS = {
    "cab-pd-1": {
      lat: 31.2368,
      lng: 121.5055,
      address: "上海市浦东新区张杨路1588号 · 浦东骑手驿站",
      source: "站点/柜机坐标",
    },
  };

  /** @type {Array<object>} */
  let CABINET_SWAPS = [
    {
      id: "sw-r1",
      userId: "u-chen",
      orderNo: "SW260928001",
      status: "in_progress",
      createdAt: "2026-10-28 16:10",
      outboundDeadlineMs: Date.now() + 4 * 60 * 1000,
      r1: true,
      r2: false,
      returnedSn: "492391002233",
      outboundSn: "492399990001",
      returnRecorded: true,
      cabinetId: "cab-pd-1",
      siteName: "浦东骑手驿站",
      cabinetName: "浦东 1 号柜",
      cab: "浦东 1 号柜",
      outPort: 3,
      returnPort: 7,
      returnAt: "2026-10-28 16:11",
      outboundAt: "2026-10-28 16:12",
    },
    {
      id: "sw-r2",
      userId: "u-li",
      orderNo: "SW260928002",
      status: "in_progress",
      createdAt: "2026-10-28 16:20",
      outboundDeadlineMs: Date.now() - 60000,
      r1: false,
      r2: true,
      returnedSn: "492391883344",
      outboundSn: "492399990002",
      returnRecorded: true,
      openFail: true,
      cabinetId: "cab-pd-1",
      siteName: "浦东骑手驿站",
      cabinetName: "浦东 1 号柜",
      cab: "浦东 1 号柜",
      outPort: 5,
      returnPort: 2,
      returnAt: "2026-10-28 16:18",
      outboundAt: "2026-10-28 16:20",
      /** Mock 场景二：本柜除出电/还入外无其他可发电池 */
      sparseCabinet: true,
      remoteScenario: 2,
    },
    {
      id: "sw-r2-zhao",
      userId: "u-zhao",
      orderNo: "SW260928003",
      status: "swap_timeout",
      createdAt: "2026-10-28 16:25",
      outboundDeadlineMs: Date.now() - 120000,
      r1: false,
      r2: true,
      returnedSn: "492391002233",
      outboundSn: "492399990004",
      returnRecorded: true,
      openFail: true,
      cabinetId: "cab-pd-1",
      siteName: "浦东骑手驿站",
      cabinetName: "浦东 1 号柜",
      cab: "浦东 1 号柜",
      outPort: 6,
      returnPort: 7,
      returnAt: "2026-10-28 16:23",
      outboundAt: "2026-10-28 16:25",
      /** Mock 场景一：重开失败后另有 3/8 号等可发格口 */
      sparseCabinet: false,
      remoteScenario: 1,
    },
  ];

  /** @type {Array<object>} */
  let OFF_ORDERS = [
    {
      id: "OC-260928001",
      orderNo: "OC260928001",
      orderType: "柜外退电",
      orderTypeKey: "off_return",
      userName: "史建国",
      phone: "18915821617",
      operatorName: "管理员",
      createdAt: "2026-10-28 15:20",
      store: "柜外作业",
      channel: "off_cabinet",
      steps: [
        { label: "运营商回收", sn: "035211127474", operatorName: "管理员" },
      ],
    },
    {
      id: "OC-260928002",
      orderNo: "OC260928002",
      orderType: "远程出电",
      orderTypeKey: "remote_out",
      userName: "李骑手",
      phone: "13700002222",
      operatorName: "管理员",
      createdAt: "2026-10-28 16:35",
      store: "浦东骑手驿站",
      channel: "off_cabinet",
      steps: [
        {
          label: "远程出电 · 浦东骑手驿站 · 浦东 1 号柜 · 5号",
          sn: "492399990002",
          operatorName: "管理员",
        },
      ],
    },
    {
      id: "OC-260928003",
      orderNo: "OC260928003",
      orderType: "柜外领电",
      orderTypeKey: "off_pickup",
      userName: "王骑手",
      phone: "13800138001",
      operatorName: "管理员",
      createdAt: "2026-10-28 14:10",
      store: "柜外作业",
      channel: "off_cabinet",
      batteryNo: "035211888777",
      batteryNos: ["035211888777"],
      steps: [
        {
          label: "绑定用户 · 他网电池",
          sn: "035211888777",
          operatorName: "管理员",
        },
      ],
      crossNetwork: {
        userOwnerId: "op-lh",
        userOwnerName: "锂电快换",
        batteryOwnerId: "op-jd",
        batteryOwnerName: "京东换电",
        l1CabinetFee: 0,
        l1BatteryFee: 2,
        l1Total: 2,
        isCrossNetwork: true,
      },
    },
  ];

  function searchUsers(kw) {
    const q = String(kw || "")
      .trim()
      .toLowerCase();
    if (!q) return USERS.slice();
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.heldSn && u.heldSn.includes(q))
    );
  }

  function userById(id) {
    return USERS.find((u) => u.id === id) || null;
  }

  function batteryInfo(sn) {
    return BATTERIES[sn] || null;
  }

  function batteryOwner(sn) {
    const b = BATTERIES[sn];
    if (!b) return null;
    return {
      id: b.deviceOwnerId || SESSION_OPERATOR.id,
      name: b.deviceOwnerName || SESSION_OPERATOR.name,
    };
  }

  /** 成单后跨网设备服务费（对齐 PC 三元组 · 柜外无柜机时不计柜机维） */
  function computeCrossNetworkFee(user, sns) {
    const u = SESSION_OPERATOR;
    let batteryFee = 0;
    let crossBattery = null;
    (sns || []).forEach((sn) => {
      const bo = batteryOwner(sn);
      if (bo && bo.id !== u.id) {
        batteryFee = L1_BATTERY_FEE;
        crossBattery = bo;
      }
    });
    const l1Total = batteryFee;
    return {
      userOwnerId: u.id,
      userOwnerName: u.name,
      batteryOwnerId: crossBattery ? crossBattery.id : u.id,
      batteryOwnerName: crossBattery ? crossBattery.name : u.name,
      l1CabinetFee: 0,
      l1BatteryFee: batteryFee,
      l1Total,
      isCrossNetwork: l1Total > 0,
    };
  }

  function validateRecycle(sn, user) {
    const b = BATTERIES[sn];
    if (!b) return { ok: false, msg: "电池编码不存在（体系外不可回收）" };
    if (!user.heldSn || user.heldSn !== sn)
      return { ok: false, msg: "与用户当前持电不一致" };
    // decision-071：不校验 battery.deviceOwnerId 是否等于当前运营商
    const owner = batteryOwner(sn);
    const hint =
      owner && owner.id !== SESSION_OPERATOR.id
        ? `（归属 ${owner.name}，可继续回收；成单后按跨网规则计费）`
        : "";
    return { ok: true, hint };
  }

  function validateBind(sn, user) {
    const b = BATTERIES[sn];
    if (!b) return { ok: false, msg: "电池编码不存在" };
    if (b.boundUserPhone && b.boundUserPhone !== user.phone)
      return { ok: false, msg: "电池已绑定其他用户" };
    if (b.inCabinet) return { ok: false, msg: "电池仍在柜内，请走远程出电或柜机流程" };
    const owner = batteryOwner(sn);
    const hint =
      owner && owner.id !== SESSION_OPERATOR.id
        ? `（归属 ${owner.name}，可继续绑定；成单后按跨网规则计费）`
        : "";
    return { ok: true, hint };
  }

  function doRecycle(sn, user, operatorName) {
    const v = validateRecycle(sn, user);
    if (!v.ok) return v;
    delete BATTERIES[sn].boundUserPhone;
    user.heldSn = null;
    user.waitPickup = true;
    return {
      ok: true,
      log: {
        type: "recycle",
        sn,
        operatorName,
        at: new Date().toISOString(),
        label: "运营商回收",
      },
    };
  }

  function doBind(sn, user, operatorName) {
    const v = validateBind(sn, user);
    if (!v.ok) return v;
    if (!BATTERIES[sn]) BATTERIES[sn] = { sn };
    BATTERIES[sn].boundUserPhone = user.phone;
    user.heldSn = sn;
    user.waitPickup = false;
    return {
      ok: true,
      log: {
        type: "bind",
        sn,
        operatorName,
        at: new Date().toISOString(),
        label: "绑定用户",
      },
    };
  }

  function batteryNosFromSteps(steps) {
    const set = new Set();
    (steps || []).forEach((s) => {
      if (s.sn) set.add(s.sn);
    });
    return Array.from(set);
  }

  function createOffOrder(typeKey, user, operatorName, steps, extra) {
    const type = ORDER_TYPES[typeKey];
    const ts = Date.now();
    const sns = batteryNosFromSteps(steps);
    const crossNetwork = computeCrossNetworkFee(user, sns);
    const row = {
      id: "OC-" + ts,
      orderNo: "OC" + String(ts).slice(-10),
      orderType: type.label,
      orderTypeKey: typeKey,
      userName: user.name,
      phone: user.phone,
      operatorName,
      createdAt: formatLocal(),
      store: (extra && extra.siteName) || "柜外作业",
      channel: "off_cabinet",
      batteryNo: sns[0] || "",
      batteryNos: sns,
      steps: steps.slice(),
      extra: extra || {},
      crossNetwork,
    };
    OFF_ORDERS.unshift(row);
    return row;
  }

  function orderRowsForList(order) {
    const rows = [];
    const push = (label, value, opts = {}) => {
      if (value === undefined || value === null || value === "") return;
      rows.push({ label, value, ...opts });
    };
    push("业务类型", order.orderType, { tag: "柜外" });
    push("订单编号", order.orderNo || order.id, { copy: true });
    push("站点/场景", order.store);
    push("操作人", order.operatorName);
    push("创建时间", order.createdAt);
    const sns = order.batteryNos || batteryNosFromSteps(order.steps);
    if (sns.length === 1) push("电池编号", sns[0], { copy: true, link: true });
    else if (sns.length > 1) push("电池编号", sns.join(" / "), { copy: true });
    const cn = order.crossNetwork;
    if (cn && cn.isCrossNetwork && cn.l1Total > 0) {
      push("跨网设备服务费", "¥" + cn.l1Total.toFixed(2), { tag: "跨网" });
      push("用户运营商", cn.userOwnerName);
      push("电池运营商", cn.batteryOwnerName);
    }
    return rows;
  }

  function formatLocal() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      p(d.getMonth() + 1) +
      "-" +
      p(d.getDate()) +
      " " +
      p(d.getHours()) +
      ":" +
      p(d.getMinutes())
    );
  }

  function cabLocation(cabinetId, sw) {
    const row = CAB_LOCATIONS[cabinetId];
    if (row) return row;
    return {
      lat: null,
      lng: null,
      address: (sw && sw.siteName) || "—",
      source: "—",
    };
  }

  function haversineMeters(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistanceM(m) {
    if (m == null || !isFinite(m)) return "—";
    if (m < 1000) return Math.round(m) + " m";
    return (m / 1000).toFixed(1) + " km";
  }

  function truncateLocText(str, maxLen) {
    const s = String(str || "").trim();
    if (!s) return "—";
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen - 1) + "…";
  }

  function batteryInCabLabel(sn) {
    if (!sn) return "—";
    const b = BATTERIES[sn];
    if (!b) return "未知";
    return b.inCabinet ? "在柜" : "不在柜";
  }

  function outboundPortNumber(sw) {
    if (!sw) return null;
    if (sw.outPort != null && isFinite(sw.outPort)) return sw.outPort;
    const ob = sw.outboundSn && BATTERIES[sw.outboundSn];
    if (ob && ob.inCabinet && ob.inCabinet.port != null) return ob.inCabinet.port;
    return null;
  }

  function formatRefreshClock(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const p = (n) => String(n).padStart(2, "0");
    return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  function swapScenarioLabel(sw) {
    if (!sw) return "—";
    if (sw.r1) return "R1 · 已还入未取新";
    if (sw.r2) return "R2 · 出电失败仍在柜";
    return "持电仍在柜";
  }

  function remoteMockScenarioLabel(sw) {
    if (!sw || !sw.remoteScenario) return "";
    if (sw.remoteScenario === 1) return "Mock·场景一：重开失败可改发他格口";
    if (sw.remoteScenario === 2) return "Mock·场景二：禁用出电格口·取还入电·换电失败";
    return "";
  }

  function refreshOutboundInCab(sw) {
    if (!sw || !sw.outboundSn) return { inCab: "—", sn: null };
    return { inCab: batteryInCabLabel(sw.outboundSn), sn: sw.outboundSn };
  }

  function reopenPort(cabinetId, port) {
    if (!cabinetId || !port) return { ok: false, msg: "格口无效" };
    let hit = false;
    Object.keys(BATTERIES).forEach((sn) => {
      const ic = BATTERIES[sn].inCabinet;
      if (ic && ic.cabinetId === cabinetId && ic.port === port) {
        ic.door = "开";
        hit = true;
      }
    });
    if (!hit) return { ok: false, msg: "该格口无在柜电池" };
    return { ok: true, msg: `已下发重开 ${port} 号格口（Mock）` };
  }

  function listAlternateIssueSlots(sw) {
    if (!sw) return [];
    return listRemoteSlots(sw).filter((s) => {
      if (s.sn === sw.outboundSn) return false;
      if (s.sn === sw.returnedSn) return false;
      if (isPortDisabled(sw.cabinetId, s.port)) return false;
      return true;
    });
  }

  /** 步骤②无其他可发格口（仅故障出电格口有电） */
  function onlyFailedOutboundAvailable(sw) {
    return listAlternateIssueSlots(sw).length === 0;
  }

  /** ① 重开出电格口：成功则绑用户并完结；失败进入步骤② */
  function tryReopenForRemote(sw, user, operatorName) {
    const port = outboundPortNumber(sw);
    const sn = sw.outboundSn;
    if (!port || !sn) return { ok: false, msg: "无出电格口信息" };
    if (sw.openFail) {
      return {
        ok: false,
        reopenFailed: true,
        msg: `重开 ${port} 号格口失败（柜门/通讯异常）`,
      };
    }
    const open = reopenPort(sw.cabinetId, port);
    if (!open.ok) return { ok: false, reopenFailed: true, msg: open.msg };
    const bind = remoteOpenPort(sw, port, sn, user, operatorName);
    if (!bind.ok) return { ok: false, reopenFailed: true, msg: bind.msg };
    return {
      ok: true,
      reopenSuccess: true,
      log: {
        ...bind.log,
        label: `重开成功 · ${bind.log.label}`,
      },
      msg: `重开 ${port} 号成功，用户可取电，流程结束`,
    };
  }

  /** ② 禁用故障格口 + 新开其他格口并绑用户 */
  function disableAndIssueAlternate(sw, disablePortNum, issuePort, issueSn, user, operatorName) {
    if (!sw || !issuePort || !issueSn) return { ok: false, msg: "请选择新发格口" };
    if (issueSn === sw.outboundSn) return { ok: false, msg: "不可重复选择故障出电格口" };
    const dis = disablePort(sw.cabinetId, disablePortNum);
    if (!dis.ok) return dis;
    const open = reopenPort(sw.cabinetId, issuePort);
    if (!open.ok) return open;
    const bind = remoteOpenPort(sw, issuePort, issueSn, user, operatorName);
    if (!bind.ok) return bind;
    return {
      ok: true,
      logs: [
        {
          type: "disable_port",
          port: disablePortNum,
          operatorName,
          label: `禁用 ${disablePortNum} 号格口`,
        },
        { ...bind.log, label: `改发 ${issuePort} 号 · ${bind.log.label}` },
      ],
      msg: `已禁用 ${disablePortNum} 号并改发 ${issuePort} 号`,
    };
  }

  /** 本柜仅故障出电：禁用出电格口 + 取走还入电池；换电单标记失败 */
  function allowReturnPickupElsewhere(sw, user, operatorName) {
    const retSn = sw.returnedSn;
    const outSn = sw.outboundSn;
    const outPort = outboundPortNumber(sw);
    if (!retSn || !sw.returnRecorded) return { ok: false, msg: "无还入电池信息" };
    if (outPort == null) return { ok: false, msg: "无出电格口信息" };
    const retB = BATTERIES[retSn];
    if (!retB || !retB.inCabinet) return { ok: false, msg: "还入电池不在柜" };
    const retPort = sw.returnPort != null ? sw.returnPort : retB.inCabinet.port;
    disablePort(sw.cabinetId, outPort);
    reopenPort(sw.cabinetId, retPort);
    if (outSn && BATTERIES[outSn]) {
      delete BATTERIES[outSn].boundUserPhone;
    }
    delete retB.inCabinet;
    retB.boundUserPhone = user.phone;
    user.heldSn = retSn;
    user.waitPickup = false;
    sw.status = "swap_failed";
    return {
      ok: true,
      logs: [
        {
          type: "disable_port",
          port: outPort,
          operatorName,
          label: `禁用 ${outPort} 号格口`,
        },
        {
          type: "return_pickup_elsewhere",
          sn: retSn,
          port: retPort,
          operatorName,
          label: `开 ${retPort} 号 · 允许取走还入电池`,
        },
        {
          type: "swap_mark_failed",
          operatorName,
          label: `换电订单 ${sw.orderNo || ""} 标记为换电失败`.trim(),
        },
      ],
      msg: `已禁用 ${outPort} 号格口，用户可取还入电池；换电单已标记为换电失败`,
    };
  }

  function disablePort(cabinetId, port) {
    if (!cabinetId || !port) return { ok: false, msg: "格口无效" };
    DISABLED_PORTS.add(cabinetId + ":" + port);
    return { ok: true, msg: `已禁用 ${port} 号格口（Mock）` };
  }

  function isPortDisabled(cabinetId, port) {
    return DISABLED_PORTS.has(cabinetId + ":" + port);
  }

  function swapLegPort(sw, leg) {
    if (leg === "return") {
      if (!sw.returnRecorded && !sw.returnedSn) return "—";
      if (sw.returnPort != null) return sw.returnPort + " 号";
      const b = sw.returnedSn && BATTERIES[sw.returnedSn];
      if (b && b.inCabinet && b.inCabinet.port != null) return b.inCabinet.port + " 号";
      return "—";
    }
    if (!sw.outboundSn) return "—";
    if (sw.outPort != null) return sw.outPort + " 号";
    const ob = BATTERIES[sw.outboundSn];
    if (ob && ob.inCabinet && ob.inCabinet.port != null) return ob.inCabinet.port + " 号";
    return "—";
  }

  function remoteLocationSummary(sw, user) {
    const cab = cabLocation(sw.cabinetId, sw);
    const ul = user && user.location;
    let distanceM = null;
    if (cab.lat != null && cab.lng != null && ul && ul.lat != null && ul.lng != null) {
      distanceM = haversineMeters(ul.lat, ul.lng, cab.lat, cab.lng);
    }
    return {
      cab,
      user: ul,
      distanceM,
      distanceLabel: formatDistanceM(distanceM),
    };
  }

  function latestCabinetSwap(userId) {
    return CABINET_SWAPS.filter((s) => s.userId === userId).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1
    )[0];
  }

  function heldBatteryInCabinet(user) {
    if (!user || !user.heldSn) return false;
    const b = BATTERIES[user.heldSn];
    return !!(b && b.inCabinet);
  }

  /** 远程出电：有换电单 + 持电 + 持电仍在柜（出电失败误绑定） */
  function canShowRemoteOut(user) {
    if (!user || !user.packageOk) return false;
    if (!latestCabinetSwap(user.id)) return false;
    return heldBatteryInCabinet(user);
  }

  function refreshSwapTimeout(sw) {
    if (!sw || sw.status !== "in_progress") return sw;
    if (Date.now() > sw.outboundDeadlineMs) sw.status = "swap_timeout";
    return sw;
  }

  function listRemoteSlots(sw) {
    if (!sw || !sw.cabinetId) return [];
    const rows = [];
    Object.keys(BATTERIES).forEach((sn) => {
      const b = BATTERIES[sn];
      const ic = b && b.inCabinet;
      if (!ic || ic.cabinetId !== sw.cabinetId) return;
      if (sw.sparseCabinet && sn !== sw.outboundSn && sn !== sw.returnedSn) return;
      rows.push({
        port: ic.port,
        sn,
        soc: typeof ic.soc === "number" ? ic.soc : null,
        door: ic.door || "—",
        siteName: ic.siteName || sw.siteName,
        cabinetName: ic.cabinetName || sw.cabinetName,
      });
    });
    return rows.sort((a, b) => a.port - b.port);
  }

  function defaultRemoteSlot(sw, slots) {
    if (!slots.length) return null;
    const bySn = slots.find((s) => s.sn === sw.outboundSn);
    if (bySn) return bySn;
    const byPort = slots.find((s) => s.port === sw.outPort);
    if (byPort) return byPort;
    return slots[0];
  }

  function remoteEligibility(sw, user) {
    refreshSwapTimeout(sw);
    if (!sw) return { ok: false, msg: "无换电订单" };
    if (!sw.returnRecorded || !sw.returnedSn)
      return { ok: false, msg: "还电未成功，无法远程出电" };
    if (!user || !user.heldSn) return { ok: false, msg: "用户未持电，无法远程出电" };
    if (!heldBatteryInCabinet(user))
      return { ok: false, msg: "持电不在柜内，请走柜外退/换电" };
    if (user.heldSn !== sw.outboundSn && !BATTERIES[user.heldSn])
      return { ok: false, msg: "持电与换电出电编码不一致" };
    const tags = [];
    if (sw.r1) tags.push("R1·已还入未取新");
    if (sw.r2) tags.push("R2·出电失败仍在柜");
    if (!tags.length) tags.push("持电仍在柜");
    const slots = listRemoteSlots(sw).filter((s) => s.sn === user.heldSn);
    if (!slots.length) return { ok: false, msg: "用户持电格口不可用" };
    return { ok: true, tags, swap: sw, slots, heldSn: user.heldSn };
  }

  function remoteOpenPort(sw, port, sn, user, operatorName) {
    const b = BATTERIES[sn];
    const ic = b && b.inCabinet;
    if (!ic || ic.cabinetId !== sw.cabinetId || ic.port !== port)
      return { ok: false, msg: "所选格口无可用电池" };
    const siteName = sw.siteName || ic.siteName || "—";
    const cabinetName = sw.cabinetName || ic.cabinetName || sw.cab || "—";
    delete BATTERIES[sn].inCabinet;
    BATTERIES[sn].boundUserPhone = user.phone;
    user.heldSn = sn;
    user.waitPickup = false;
    sw.status = "completed";
    return {
      ok: true,
      log: {
        type: "remote_open",
        sn,
        port,
        siteName,
        cabinetName,
        operatorName,
        at: new Date().toISOString(),
        label: `远程出电 · ${siteName} · ${cabinetName} · ${port}号`,
      },
    };
  }

  function simulateUserConfirm(sn) {
    return {
      type: "user_confirm",
      sn,
      at: new Date().toISOString(),
      label: "用户小程序确认领取",
    };
  }

  function render(state, ctx) {
    const { escapeHtml, escapeAttr, session } = ctx;
    const oc = state.offCab || {};
    const view = oc.view || "search";
    const operatorName =
      (session && (session.account.operatorName || session.roleLabel)) || "运营商";

    if (view === "result" && oc.lastOrder) {
      const o = oc.lastOrder;
      const steps = o.steps
        .map(
          (s) =>
            `<li><strong>${escapeHtml(s.label)}</strong> · ${escapeHtml(s.sn || "")} · ${escapeHtml(
              s.operatorName || o.operatorName
            )}${s.userConfirm ? " · 用户已确认" : ""}</li>`
        )
        .join("");
      return `
        <div class="sites-page ops-page">
          <div class="sites-header">
            <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
            <h1>作业完成</h1>
            <div class="sites-header-spacer"></div>
          </div>
          <article class="sites-card offcab-result">
            <div class="sites-card-hd"><strong>${escapeHtml(o.orderType)}</strong></div>
            <div class="sites-card-rows">
              <div><span>单号</span><em>${escapeHtml(o.id)}</em></div>
              <div><span>时间</span><em>${escapeHtml(o.createdAt)}</em></div>
              <div><span>操作人</span><em>${escapeHtml(o.operatorName)}</em></div>
            </div>
            <ul class="offcab-steps">${steps}</ul>
          </article>
          <button type="button" class="btn-primary offcab-btn" data-action="offcab-back-search">返回搜索</button>
        </div>`;
    }

    if (view === "flow" && oc.userId && oc.flowType) {
      return renderFlow(state, ctx, operatorName);
    }

    if (view === "remote" && oc.userId) {
      return renderRemote(state, ctx, operatorName);
    }

    const kw = oc.kw || "";
    const list = searchUsers(kw);
    const cards = list
      .map((u) => {
        const inCab = heldBatteryInCabinet(u);
        const held = u.heldSn
          ? inCab
            ? `持电 ${escapeHtml(u.heldSn)} · <em class="brand">仍在柜</em>`
            : `持电 ${escapeHtml(u.heldSn)}`
          : u.waitPickup
            ? '<em class="brand">待领取电池</em>'
            : "无持电";
        const actions = [];
        const hasSwap = !!latestCabinetSwap(u.id);
        const swHint = latestCabinetSwap(u.id);
        const scenTag = remoteMockScenarioLabel(swHint);
        const scenHtml = scenTag
          ? `<p class="offcab-scenario-hint">${escapeHtml(scenTag)}</p>`
          : "";
        if (canShowRemoteOut(u)) {
          actions.push(
            `<button type="button" class="is-primary" data-action="offcab-remote" data-uid="${escapeAttr(
              u.id
            )}">远程出电</button>`
          );
        } else if (u.heldSn && !inCab) {
          actions.push(
            `<button type="button" data-action="offcab-start" data-flow="off_swap" data-uid="${escapeAttr(
              u.id
            )}">柜外换电</button>`,
            `<button type="button" data-action="offcab-start" data-flow="off_return" data-uid="${escapeAttr(
              u.id
            )}">柜外退电</button>`
          );
        } else if (u.packageOk && !u.heldSn) {
          actions.push(
            `<button type="button" class="is-primary" data-action="offcab-start" data-flow="off_pickup" data-uid="${escapeAttr(
              u.id
            )}">柜外领电</button>`
          );
        }
        return `<article class="sites-card">
          <div class="sites-card-hd">
            <div>
              <strong>${escapeHtml(u.name)}</strong>
              <div class="sites-meta">${escapeHtml(u.phone)}</div>
            </div>
          </div>
          <div class="sites-card-rows">
            <div><span>套餐</span><em>${escapeHtml(u.packageLabel)}</em></div>
            <div><span>电池</span><em>${held}</em></div>
          </div>
          ${scenHtml}
          <div class="offcab-actions">${actions.join("")}</div>
        </article>`;
      })
      .join("");

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="back-workbench" aria-label="返回">‹</button>
          <h1>柜外电池作业</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">远程出电 Mock：<strong>赵骑手</strong>场景一（改发他格口）、<strong>李骑手</strong>场景二（取还入电赴他站）。</p>
        <div class="sites-filters">
          <div class="sites-search-row">
            <input type="search" class="offcab-kw" data-action="offcab-kw-input" placeholder="手机号 / 姓名" value="${escapeAttr(
              kw
            )}" />
            <button type="button" class="sites-confirm" data-action="offcab-kw-apply">确定</button>
          </div>
        </div>
        <div class="sites-list">${cards || `<div class="empty-inline compact">无匹配用户</div>`}</div>
      </div>`;
  }

  /** 绑定/回收 · Mock 扫码回填 */
  function mockScanSn(stepKey, user, flowType) {
    if (stepKey === "recycle") return (user && user.heldSn) || "";
    if (stepKey === "bind") {
      if (flowType === "off_pickup") return "492399990003";
      if (flowType === "off_swap") return "492399990001";
      return "492399990003";
    }
    return "";
  }

  function renderSnInput(stepKey, oc, escapeAttr) {
    const v = (oc.draftSn && oc.draftSn[stepKey]) || "";
    const scanBtn = `<button type="button" class="offcab-scan-btn" data-action="offcab-scan" data-step="${escapeAttr(
      stepKey
    )}">扫描</button>`;
    return `<div class="offcab-sn-row">
      <div class="offcab-sn-field">
        <input type="text" class="offcab-sn" data-action="offcab-sn" data-step="${escapeAttr(
          stepKey
        )}" placeholder="扫码或手动输入电池编码" value="${escapeAttr(v)}" />
        ${scanBtn}
      </div>
    </div>`;
  }

  function renderFlow(state, ctx, operatorName) {
    const { escapeHtml, escapeAttr } = ctx;
    const oc = state.offCab;
    const user = userById(oc.userId);
    if (!user) return `<div class="empty-full">用户不存在</div>`;
    const type = ORDER_TYPES[oc.flowType];
    const steps = oc.flowSteps || [];
    const stepLog = steps
      .map((s) => `<li>${escapeHtml(s.label)} · ${escapeHtml(s.sn)}</li>`)
      .join("");

    let body = "";
    if (oc.flowType === "off_return") {
      body = `<section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>A · 回收原电池</strong></div>
        ${renderSnInput("recycle", oc, escapeAttr)}
        <button type="button" class="btn-primary offcab-btn" data-action="offcab-recycle-only">确认回收</button>
      </section>`;
    } else if (oc.flowType === "off_pickup") {
      body = `<section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>A · 绑定电池</strong></div>
        ${renderSnInput("bind", oc, escapeAttr)}
        <button type="button" class="btn-primary offcab-btn" data-action="offcab-bind">确认绑定</button>
        <button type="button" class="btn-mock offcab-btn" data-action="offcab-user-confirm" data-step="bind">模拟用户扫码确认</button>
      </section>`;
    } else if (oc.flowType === "off_swap") {
      body = `<section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>A · 回收原电池</strong></div>
        ${renderSnInput("recycle", oc, escapeAttr)}
        <button type="button" class="btn-secondary offcab-btn" data-action="offcab-recycle-step">确认回收（可稍后再领）</button>
      </section>
      <section class="devstat-sec offcab-sec">
        <div class="devstat-hd"><strong>B · 绑定新电池</strong></div>
        ${renderSnInput("bind", oc, escapeAttr)}
        <button type="button" class="btn-primary offcab-btn" data-action="offcab-bind" ${user.waitPickup && !oc.recycledThisSession ? " disabled" : ""}>确认绑定新电</button>
        <button type="button" class="btn-mock offcab-btn" data-action="offcab-user-confirm" data-step="bind">模拟用户扫码确认</button>
      </section>`;
    }

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
          <h1>${escapeHtml(type.label)}</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <p class="ops-hint">${escapeHtml(user.name)} · ${escapeHtml(user.packageLabel)} · ${
          user.heldSn ? "持电 " + escapeHtml(user.heldSn) : "待领取/无持电"
        }</p>
        ${body}
        ${stepLog ? `<ul class="offcab-steps">${stepLog}</ul>` : ""}
        <button type="button" class="btn-secondary offcab-btn" data-action="offcab-finish-flow">完成并生成订单</button>
      </div>`;
  }

  function renderRemote(state, ctx, operatorName) {
    const { escapeHtml, escapeAttr } = ctx;
    const oc = state.offCab;
    const user = userById(oc.userId);
    const sw = latestCabinetSwap(user.id);
    refreshSwapTimeout(sw);
    const el = remoteEligibility(sw, user);

    if (!el.ok) {
      return `
        <div class="sites-page ops-page">
          <div class="sites-header">
            <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
            <h1>远程出电</h1>
            <div class="sites-header-spacer"></div>
          </div>
          <div class="empty-inline compact">${escapeHtml(el.msg)}</div>
        </div>`;
    }

    const tags = el.tags.map((t) => `<span class="offcab-tag">${escapeHtml(t)}</span>`).join("");
    const statusLabel = SWAP_STATUS[sw.status] || sw.status;
    const remainMin = Math.max(0, Math.round((sw.outboundDeadlineMs - Date.now()) / 60000));
    const phase = oc.remotePhase || "reopen";
    const alternates = listAlternateIssueSlots(sw);
    const onlyFailed = phase === "alternate" && onlyFailedOutboundAvailable(sw);
    const altSlots = alternates;
    const altFallback = altSlots[0];
    const selectedSn =
      oc.remoteSn || (phase === "alternate" && altFallback ? altFallback.sn : sw.outboundSn) || "";
    const selectedPort =
      oc.remotePort != null
        ? oc.remotePort
        : phase === "alternate" && altFallback
          ? altFallback.port
          : outboundPortNumber(sw);

    const slotCards = altSlots
      .map((s) => {
        const selected = s.sn === selectedSn;
        const socLabel = s.soc != null ? `${s.soc}%` : "—";
        return `<button type="button" class="offcab-slot${selected ? " is-selected" : ""}" data-action="offcab-select-slot" data-port="${s.port}" data-sn="${escapeAttr(
          s.sn
        )}">
          <span class="offcab-slot-port">${s.port} 号</span>
          <span class="offcab-slot-soc">SOC ${escapeHtml(socLabel)}</span>
          <span class="offcab-slot-sn">${escapeHtml(s.sn)}</span>
        </button>`;
      })
      .join("");

    const selectedSlot = altSlots.find((s) => s.sn === selectedSn);
    const loc = remoteLocationSummary(sw, user);
    const returnSn = sw.returnedSn || "—";
    const returnTime = sw.returnAt || sw.createdAt || "—";
    const outboundTime = sw.outboundAt || sw.createdAt || "—";
    const userAddr = (loc.user && loc.user.address) || "暂无定位";
    const userReported = (loc.user && loc.user.reportedAt) || "—";
    const siteAddr = loc.cab.address || "—";

    const kvRow = (label, value) =>
      `<div class="offcab-kv-row"><span class="offcab-kv-k">${escapeHtml(label)}</span><span class="offcab-kv-v">${escapeHtml(
        value
      )}</span></div>`;

    const outPortNum = outboundPortNumber(sw);
    const outPortLabel = outPortNum != null ? outPortNum + " 号" : "—";
    const outInCab = refreshOutboundInCab(sw).inCab;
    const refreshLabel = formatRefreshClock(oc.outboundRefreshAt);
    const swapRow = (label, value) =>
      `<div class="offcab-kv-row offcab-kv-row-swap"><span class="offcab-kv-k">${escapeHtml(
        label
      )}</span><span class="offcab-kv-v">${escapeHtml(value)}</span></div>`;
    const limitHint =
      sw.status === "in_progress" ? ` · 出电限时约 ${remainMin} 分钟` : "";

    const returnLeg = `
      <div class="offcab-remote-leg">
        <div class="offcab-remote-leg-hd">还电信息</div>
        <div class="offcab-kv-list">
          ${kvRow("还入格口", swapLegPort(sw, "return"))}
          ${kvRow("还入电池", returnSn)}
          ${kvRow("是否在柜", batteryInCabLabel(sw.returnedSn))}
          ${kvRow("时间", returnTime)}
        </div>
      </div>`;

    const outboundLeg = `
      <div class="offcab-remote-leg offcab-remote-leg-out">
        <div class="offcab-remote-leg-hd-row">
          <span class="offcab-remote-leg-hd">出电信息</span>
          <button type="button" class="btn-mock btn-mock-xs offcab-refresh-btn" data-action="offcab-out-refresh">刷新</button>
        </div>
        <p class="offcab-out-updated">更新 ${escapeHtml(refreshLabel)}</p>
        <div class="offcab-kv-list">
          ${kvRow("出电格口", outPortLabel)}
          ${kvRow("出电电池", sw.outboundSn || "—")}
          ${kvRow("是否在柜", outInCab)}
          ${kvRow("时间", outboundTime)}
        </div>
      </div>`;

    const step1Class =
      phase === "reopen" ? "is-current" : phase === "alternate" ? "is-done is-fail" : "is-done";
    const step2Class = phase === "alternate" ? "is-current" : "is-wait";
    const step1Btn =
      phase === "reopen" && outPortNum != null
        ? `<button type="button" class="btn-primary offcab-btn offcab-step-btn" data-action="offcab-reopen-outbound" data-port="${outPortNum}">重开格口：${outPortNum}</button>`
        : "";
    const step1Note =
      phase === "alternate"
        ? `<p class="offcab-step-note fail">步骤 ① 重开失败，请继续步骤 ② 或下方兜底方案。</p>`
        : `<p class="offcab-step-note">成功则用户取走出电电池，流程结束。</p>`;
    const step2Body =
      phase === "alternate" && !onlyFailed
        ? `<p class="offcab-step-note">先禁用 ${outPortNum} 号故障格口，再选择其他有电格口新开并绑给用户。</p>
          <div class="offcab-slot-list">${slotCards}</div>
          ${
            selectedSlot
              ? `<p class="offcab-slot-pick">已选新发 ${selectedSlot.port} 号 · ${escapeHtml(selectedSlot.sn)}</p>`
              : ""
          }
          <button type="button" class="btn-primary offcab-btn offcab-step-btn" data-action="offcab-alternate-issue" ${
            selectedSn && outPortNum != null ? "" : "disabled"
          }>禁用 ${outPortNum} 号 · 新开 ${selectedPort != null ? selectedPort : "—"} 号并绑定</button>`
        : phase === "alternate"
          ? `<p class="offcab-step-note warn">本柜无其他可发电池（仅 ${outPortNum} 号出电故障格口有电）。</p>`
          : `<p class="offcab-step-note muted">仅在步骤 ① 重开失败时启用。</p>`;
    const fallbackBlock =
      onlyFailed && outPortNum != null
        ? `<div class="offcab-remote-fallback">
            <p class="offcab-step-note">禁用出电 ${outPortNum} 号格口，开还入格口供用户取走电池（${escapeHtml(
              swapLegPort(sw, "return")
            )} · ${escapeHtml(returnSn)}）；<strong>换电订单标记为换电失败</strong>。</p>
            <button type="button" class="btn-mock offcab-btn offcab-step-btn" data-action="offcab-return-pickup">禁用${outPortNum}号格口·允许取走还入电池</button>
          </div>`
        : "";

    const siteShort = truncateLocText(siteAddr, 28);
    const userShort = truncateLocText(userAddr, 28);

    return `
      <div class="sites-page ops-page">
        <div class="sites-header">
          <button type="button" class="sites-back" data-action="offcab-back-search" aria-label="返回">‹</button>
          <h1>远程出电</h1>
          <div class="sites-header-spacer"></div>
        </div>
        <section class="devstat-sec offcab-remote-swap">
          <div class="offcab-remote-leg-hd">换电信息</div>
          <div class="offcab-remote-swap-grid">
            ${swapRow("用户", user.name)}
            ${swapRow("换电单号", sw.orderNo || "—")}
            ${swapRow("换电状态", statusLabel + limitHint.replace(/^ · /, ""))}
            ${swapRow("场景", swapScenarioLabel(sw))}
            ${swapRow("发起时间", sw.createdAt || "—")}
            ${swapRow("还电结果", sw.returnRecorded ? "还电成功" : "未还电")}
          </div>
          <div class="offcab-tags offcab-tags-inline">${tags}${
            remoteMockScenarioLabel(sw)
              ? `<span class="offcab-tag offcab-tag-scenario">${escapeHtml(remoteMockScenarioLabel(sw))}</span>`
              : ""
          }</div>
        </section>
        <div class="offcab-remote-dual">${returnLeg}${outboundLeg}</div>
        <section class="devstat-sec offcab-remote-loc-compact" title="球面直线估算">
          <div class="offcab-loc-compact-grid">
            <span>站点</span><em>${escapeHtml(sw.siteName || "—")}</em>
            <span>柜机</span><em>${escapeHtml(sw.cabinetName || sw.cab || "—")}</em>
            <span>站点位置</span><em class="offcab-loc-ellipsis" title="${escapeAttr(siteAddr)}">${escapeHtml(siteShort)}</em>
            <span>用户定位</span><em class="offcab-loc-ellipsis" title="${escapeAttr(userAddr)}">${escapeHtml(userShort)}</em>
            <span>最近回传</span><em>${escapeHtml(userReported)}</em>
            <span>与站点距离</span><em>${escapeHtml(loc.distanceLabel)}</em>
          </div>
        </section>
        <section class="devstat-sec offcab-remote-ops">
          <div class="devstat-hd"><strong>操作步骤</strong></div>
          <ol class="offcab-remote-step-list">
            <li class="offcab-remote-step ${step1Class}">
              <div class="offcab-remote-step-hd">① 重开出电格口${outPortNum != null ? " · " + outPortNum + " 号" : ""}</div>
              ${step1Note}
              ${step1Btn}
            </li>
            <li class="offcab-remote-step ${step2Class}">
              <div class="offcab-remote-step-hd">② 禁用故障格口并改发其他有电格口</div>
              ${step2Body}
            </li>
          </ol>
          ${fallbackBlock}
          <button type="button" class="btn-mock offcab-btn" data-action="offcab-user-confirm" data-step="remote">模拟用户扫码确认</button>
        </section>
      </div>`;
  }

  global.OperatorAppOffCabinet = {
    ORDER_TYPES,
    SWAP_STATUS,
    searchUsers,
    userById,
    batteryInfo,
    validateRecycle,
    validateBind,
    doRecycle,
    doBind,
    createOffOrder,
    latestCabinetSwap,
    listRemoteSlots,
    defaultRemoteSlot,
    canShowRemoteOut,
    heldBatteryInCabinet,
    remoteLocationSummary,
    remoteEligibility,
    remoteOpenPort,
    refreshOutboundInCab,
    reopenPort,
    disablePort,
    isPortDisabled,
    listAlternateIssueSlots,
    onlyFailedOutboundAvailable,
    tryReopenForRemote,
    disableAndIssueAlternate,
    allowReturnPickupElsewhere,
    outboundPortNumber,
    formatRefreshClock,
    mockScanSn,
    simulateUserConfirm,
    getOffOrders: () => OFF_ORDERS.slice(),
    orderRowsForList,
    batteryNosFromSteps,
    getCabinetSwaps: () => CABINET_SWAPS.slice(),
    render,
  };
})(window);
