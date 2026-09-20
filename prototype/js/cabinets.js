/**
 * 运维 · 电柜管理 Mock
 * 对齐 PC「我的设备 → 换电柜」详情全量：台账 / 编辑 / 移柜 / 充电设置 /
 * 告警 / 组成 / 远程运维 / 端口（后三项标二期，原型可浏览）
 */
(function (global) {
  const CAB_TABS = [
    { id: "all", label: "全部" },
    { id: "online", label: "在线" },
    { id: "offline", label: "离线" },
    { id: "unassigned", label: "未分配" },
  ];

  const MOVE_SITES = [
    { id: "unassigned", label: "未分配站点" },
    { id: "浦东骑手驿站", label: "浦东骑手驿站" },
    { id: "世博换电服务点", label: "世博换电服务点" },
    { id: "京东物流专属站", label: "京东物流专属站" },
    { id: "临港偏远站", label: "临港偏远站" },
  ];

  const SWAP_MODES = ["正常换电", "MQTT离线换电", "蓝牙换电"];
  const BT_TYPES = ["类型1-0000FFE0", "类型2-0000FFE1"];
  const DEVICE_STATUSES = ["启用", "停用"];
  const REMOTE_CMDS = [
    { id: "snapshot-cab", label: "查看电柜快照", phase2: true, view: "snapshot", snap: "cabinet" },
    { id: "snapshot-dev", label: "查看设备快照", phase2: true, view: "snapshot", snap: "device" },
    { id: "req-log", label: "查看发送请求记录", phase2: true, view: "opslog" },
    { id: "ops-log", label: "查看运维操作记录", phase2: true, view: "opslog" },
    { id: "power-on", label: "通电", phase2: true },
    { id: "power-off", label: "断电", phase2: true, danger: true },
    { id: "fan-on", label: "开启风扇", phase2: true },
    { id: "fan-off", label: "关闭风扇", phase2: true, danger: true },
    { id: "reboot", label: "主板重启", phase2: true },
    { id: "fw-update", label: "更新设备版本号", phase2: true },
    { id: "upload-qr", label: "上传二维码", phase2: true, view: "qr" },
    { id: "reverse-power", label: "反向供电配置", phase2: true },
  ];
  const PORT_CMDS = [
    { id: "open", label: "开门" },
    { id: "lock", label: "锁定" },
    { id: "refresh", label: "刷新" },
    { id: "charge", label: "补电", extra: true },
    { id: "powerOn", label: "通电", extra: true },
    { id: "powerOff", label: "断电", extra: true },
  ];
  const SWAP_TABS = [
    { id: "all", label: "全部" },
    { id: "success", label: "成功" },
    { id: "doing", label: "进行中" },
    { id: "fail", label: "失败" },
  ];
  const SWAP_STATUS = {
    success: { id: "success", label: "成功" },
    doing: { id: "doing", label: "进行中" },
    fail: { id: "fail", label: "失败" },
  };

  const SITE_ADDR = {
    浦东骑手驿站: "上海市浦东新区张杨路1588号",
    世博换电服务点: "上海市浦东新区世博大道1368号",
    京东物流专属站: "上海市浦东新区康桥路 1155 号",
    临港偏远站: "上海市浦东新区临港大道 5000 号",
  };

  function baseMeta() {
    return {
      deviceType: "换电柜",
      qrBound: true,
      hardwareType: "HM221",
      hardwareVersion: "V3.0",
      softwareVersion: "MASBG129PROD60@SG",
      bootVersion: "1",
      module4gType: "ML307",
      exchangeableSpecs: "48V/20Ah",
      bluetoothType: "类型1-0000FFE0",
      slotChargeRatio: "80%",
      swapReserveSlots: "2",
      exclusiveSigned: "0",
      exclusiveSignable: "可签约",
      sharedSigned: "4",
      sharedSignable: "可签约",
      carrier: "中国移动",
      expireDate: "2027-12-31",
    };
  }

  const CABINETS = [
    {
      id: "CAB-22018",
      sn: "CAB-22018",
      deviceId: "1782954891846172302",
      commBoardId: "2401C00876",
      name: "浦东骑手驿站-1号柜",
      site: "浦东骑手驿站",
      city: "上海",
      address: SITE_ADDR["浦东骑手驿站"],
      slots: 12,
      online: true,
      powerStatus: "已通电",
      deviceStatus: "启用",
      serviceStatus: "启用",
      swapMode: "正常换电",
      lastSwap: "今天 12:05",
      ownership: "自有",
      iccid: "8986001111222333444",
      usedPowerKwh: 0.78,
      slotModules: [
        { id: "M1", type: "主控", slots: 12, fw: "v3.2.1" },
        { id: "M2", type: "充电模块×2", slots: 6, fw: "v2.0.8" },
      ],
      bats: [
        { port: 1, sn: "BAT-SH-1001", soc: 92, health: "正常" },
        { port: 4, sn: "BAT-SH-1011", soc: 67, health: "正常" },
        { port: 7, sn: "BAT-SH-1018", soc: 41, health: "预警" },
      ],
    },
    {
      id: "CAB-22019",
      sn: "CAB-22019",
      deviceId: "1782954814629920131",
      commBoardId: "2401C00929",
      name: "浦东骑手驿站-2号柜",
      site: "浦东骑手驿站",
      city: "上海",
      address: SITE_ADDR["浦东骑手驿站"],
      slots: 12,
      online: false,
      powerStatus: "已通电",
      deviceStatus: "启用",
      serviceStatus: "启用",
      swapMode: "正常换电",
      lastSwap: "06-14 09:12",
      ownership: "自有",
      iccid: "8986007777888899001",
      usedPowerKwh: 0.74,
      slotModules: [{ id: "M1", type: "主控", slots: 12, fw: "v3.1.0" }],
      bats: [{ port: 2, sn: "BAT-SH-1022", soc: 55, health: "正常" }],
    },
    {
      id: "CAB-22050",
      sn: "CAB-22050",
      deviceId: "1782954722334455667",
      commBoardId: "2401C01002",
      name: "浦东3号柜",
      site: "浦东骑手驿站",
      city: "上海",
      address: SITE_ADDR["浦东骑手驿站"],
      slots: 12,
      online: true,
      powerStatus: "已通电",
      deviceStatus: "启用",
      serviceStatus: "启用",
      swapMode: "正常换电",
      lastSwap: "今天 07:55",
      ownership: "融资",
      lessorName: "华东设备租赁公司",
      iccid: "898607B91025D0531404",
      usedPowerKwh: 0.8,
      exchangeableSpecs: "",
      slotModules: [{ id: "M1", type: "主控", slots: 12, fw: "v3.2.1" }],
      bats: [{ port: 5, sn: "BAT-SH-1050", soc: 90, health: "正常" }],
    },
    {
      id: "CAB-22021",
      sn: "CAB-22021",
      deviceId: "1782954655123456789",
      commBoardId: "2401C01118",
      name: "世博换电服务点-主柜",
      site: "世博换电服务点",
      city: "上海",
      address: SITE_ADDR["世博换电服务点"],
      slots: 12,
      online: true,
      powerStatus: "已通电",
      deviceStatus: "启用",
      serviceStatus: "启用",
      swapMode: "正常换电",
      lastSwap: "今天 10:30",
      ownership: "自有",
      iccid: "8986005555666677888",
      usedPowerKwh: 0.62,
      slotModules: [{ id: "M1", type: "主控", slots: 12, fw: "v3.2.1" }],
      bats: [
        { port: 3, sn: "BAT-SH-1005", soc: 85, health: "正常" },
        { port: 8, sn: "BAT-SH-1008", soc: 80, health: "正常" },
      ],
    },
    {
      id: "CAB-IMP-01",
      sn: "CAB-IMP-01",
      deviceId: "1782954000000000001",
      commBoardId: "",
      name: "待投放-01",
      site: "未分配站点",
      city: "上海",
      address: "",
      slots: 12,
      online: false,
      powerStatus: "未通电",
      deviceStatus: "启用",
      serviceStatus: "启用",
      swapMode: "正常换电",
      lastSwap: "—",
      ownership: "自有",
      iccid: "",
      qrBound: false,
      usedPowerKwh: 0,
      slotModules: [{ id: "M1", type: "主控", slots: 12, fw: "—" }],
      bats: [],
    },
    {
      id: "CAB-IMP-02",
      sn: "CAB-IMP-02",
      deviceId: "1782954000000000002",
      commBoardId: "",
      name: "待投放-02",
      site: "未分配站点",
      city: "上海",
      address: "",
      slots: 12,
      online: false,
      powerStatus: "未通电",
      deviceStatus: "停用",
      serviceStatus: "停用",
      swapMode: "正常换电",
      lastSwap: "—",
      ownership: "自有",
      iccid: "",
      qrBound: false,
      usedPowerKwh: 0,
      slotModules: [{ id: "M1", type: "主控", slots: 12, fw: "—" }],
      bats: [],
    },
  ];

  CABINETS.forEach((c) => {
    const d = baseMeta();
    Object.keys(d).forEach((k) => {
      if (c[k] == null) c[k] = d[k];
    });
    if (!c.ports) c.ports = null;
  });

  const OPS_LOGS = [
    { time: "2026-06-15 14:22", sn: "CAB-22018", op: "远程开门", port: "3", by: "运维·张工", result: "成功" },
    { time: "2026-06-15 11:08", sn: "CAB-22021", op: "通电", port: "—", by: "运维·李工", result: "成功" },
    { time: "2026-06-14 19:40", sn: "CAB-22018", op: "补电", port: "7", by: "运维·张工", result: "超时" },
    { time: "2026-06-14 16:05", sn: "CAB-22050", op: "风扇开启", port: "—", by: "系统", result: "成功" },
    { time: "2026-06-13 09:18", sn: "CAB-22019", op: "刷新 ICCID", port: "—", by: "系统", result: "成功" },
  ];

  const SWAP_LOGS = [
    {
      id: "csw-1",
      cabinetSn: "CAB-22018",
      userName: "王骑手",
      phone: "13821010001",
      biz: "换电",
      kwh: "0.00",
      flowNo: "46170129",
      status: "success",
      batIn: { sn: "BAT-SH-1011", soc: 61, slot: 4 },
      batOut: { sn: "BAT-SH-1001", soc: 92, slot: 1 },
      durationSec: 40,
      startAt: "2026-09-16 18:13:49",
      endAt: "2026-09-16 18:14:29",
    },
    {
      id: "csw-2",
      cabinetSn: "CAB-22018",
      userName: "周强",
      phone: "13800138001",
      biz: "换电",
      kwh: "0.12",
      flowNo: "46168802",
      status: "success",
      batIn: { sn: "BAT-SH-1018", soc: 22, slot: 7 },
      batOut: { sn: "BAT-SH-1011", soc: 88, slot: 4 },
      durationSec: 36,
      startAt: "2026-09-16 12:04:18",
      endAt: "2026-09-16 12:04:54",
    },
    {
      id: "csw-3",
      cabinetSn: "CAB-22018",
      userName: "赵阳",
      phone: "13092134051",
      biz: "换电",
      kwh: "0.00",
      flowNo: "70000045",
      status: "fail",
      batIn: null,
      batOut: null,
      durationSec: 0,
      startAt: "2026-09-16 18:04:44",
      endAt: "2026-09-16 18:04:44",
      failReason: "仓门未弹开",
    },
    {
      id: "csw-4",
      cabinetSn: "CAB-22018",
      userName: "史建国",
      phone: "18915821617",
      biz: "换电",
      kwh: "0.00",
      flowNo: "46172001",
      status: "doing",
      batIn: { sn: "035211127474", soc: 18, slot: 2 },
      batOut: { sn: "BAT-SH-1001", soc: 96, slot: 1 },
      durationSec: null,
      startAt: "2026-09-16 18:19:02",
      endAt: "",
    },
    {
      id: "csw-5",
      cabinetSn: "CAB-22021",
      userName: "孙骑手",
      phone: "13921010010",
      biz: "换电",
      kwh: "0.08",
      flowNo: "22021088",
      status: "success",
      batIn: { sn: "BAT-SH-1008", soc: 31, slot: 8 },
      batOut: { sn: "BAT-SH-1005", soc: 85, slot: 3 },
      durationSec: 29,
      startAt: "2026-09-16 10:29:40",
      endAt: "2026-09-16 10:30:09",
    },
  ];

  function isUnassigned(c) {
    return !c.site || c.site === "未分配站点";
  }

  function tabOf(c) {
    if (isUnassigned(c)) return "unassigned";
    return c.online ? "online" : "offline";
  }

  function tabCounts(opts) {
    const base = matchCabinets(opts || {});
    const counts = { all: base.length, online: 0, offline: 0, unassigned: 0 };
    base.forEach((c) => {
      if (isUnassigned(c)) counts.unassigned += 1;
      else if (c.online) counts.online += 1;
      else counts.offline += 1;
    });
    return counts;
  }

  function getById(id) {
    return CABINETS.find((c) => c.id === id || c.sn === id) || null;
  }

  function siteCabinetCount(id) {
    if (!id || id === "all") return CABINETS.length;
    if (id === "unassigned") return CABINETS.filter(isUnassigned).length;
    return CABINETS.filter((c) => !isUnassigned(c) && c.site === id).length;
  }

  function siteFilterOptions() {
    const seen = { all: true };
    const rows = [
      {
        id: "all",
        label: "全部站点",
        count: siteCabinetCount("all"),
      },
    ];
    MOVE_SITES.forEach((s) => {
      if (seen[s.id]) return;
      seen[s.id] = true;
      rows.push({
        id: s.id,
        label: s.label,
        count: siteCabinetCount(s.id),
      });
    });
    CABINETS.forEach((c) => {
      const id = isUnassigned(c) ? "unassigned" : c.site;
      if (!id || seen[id]) return;
      seen[id] = true;
      rows.push({
        id: id,
        label: c.site || "未分配站点",
        count: siteCabinetCount(id),
      });
    });
    return rows;
  }

  function matchCabinets(opts) {
    const site = (opts && opts.site) || "all";
    const kw = String((opts && opts.keyword) || "")
      .trim()
      .toLowerCase();
    let list = CABINETS.slice();
    if (site && site !== "all") {
      list = list.filter((c) => {
        if (site === "unassigned") return isUnassigned(c);
        return c.site === site;
      });
    }
    if (kw) {
      list = list.filter((c) => {
        const sn = String(c.sn || "").toLowerCase();
        const siteName = String(c.site || "").toLowerCase();
        const name = String(c.name || "").toLowerCase();
        return sn.indexOf(kw) >= 0 || siteName.indexOf(kw) >= 0 || name.indexOf(kw) >= 0;
      });
    }
    return list;
  }

  function filterCabinets(opts) {
    const tab = (opts && opts.tab) || "all";
    let list = matchCabinets(opts || {});
    if (tab && tab !== "all") {
      list = list.filter((c) => {
        if (tab === "unassigned") return isUnassigned(c);
        if (tab === "online") return !isUnassigned(c) && c.online;
        if (tab === "offline") return !isUnassigned(c) && !c.online;
        return true;
      });
    }
    return list;
  }

  function ownershipLabel(c) {
    if ((c.ownership === "融资" || c.ownership === "租赁") && c.lessorName) {
      return `融资 · ${c.lessorName}（二期）`;
    }
    if (c.ownership === "融资" || c.ownership === "租赁") return "融资（二期）";
    return c.ownership || "自有";
  }

  function portRows(c) {
    if (c.ports && c.ports.length) return c.ports;
    const slots = c.slots || 12;
    const bats = c.bats || [];
    const rows = Array.from({ length: slots }, (_, i) => {
      const bat = bats.find((b) => b.port === i + 1) || null;
      const charging = !!(bat && bat.soc < 95);
      return {
        portNo: i + 1,
        portStatus: bat ? `已插入 · ${bat.sn}` : "没有插上电池",
        serviceType: bat ? "换电" : "—",
        current: bat ? "2.35" : "0.00",
        voltage: bat ? "54.20" : "0.00",
        portServiceStatus: "启用",
        chargedKwh: bat ? ((bat.soc / 100) * 0.96).toFixed(2) : "0.00",
        chargeMinutes: bat ? Math.max(0, Math.round((100 - bat.soc) * 1.2)) : 0,
        chargerOn: charging,
        chargerCurrent: charging ? "5.00" : "0.00",
        chargerVoltage: charging ? "54.00" : "0.00",
        batCurrent: bat ? "0.00" : "0.00",
        batVoltage: bat ? "54.20" : "0.00",
        batVoltageDiff: bat ? "0.02" : "0.00",
        batSoc: bat ? bat.soc : null,
        batHealth: bat ? bat.health : null,
        batCommBoard: bat ? c.commBoardId || "—" : "—",
        batShellCode: bat ? bat.sn.replace("BAT-", "SH") : "—",
        batTempMax: bat ? 32 : null,
        batTempMin: bat ? 28 : null,
        occupied: !!bat,
        batSn: bat ? bat.sn : "",
        locked: false,
        doorOpen: false,
        lockReason: "",
      };
    });
    c.ports = rows;
    return rows;
  }

  function slotSnapshot(c) {
    const ports = portRows(c);
    return ports.map((p) => ({
      no: p.portNo,
      on: p.occupied,
      label: p.occupied ? `${p.portNo}·电` : String(p.portNo),
    }));
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function nowStamp() {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      pad2(d.getMonth() + 1) +
      "-" +
      pad2(d.getDate()) +
      " " +
      pad2(d.getHours()) +
      ":" +
      pad2(d.getMinutes()) +
      ":" +
      pad2(d.getSeconds())
    );
  }

  function occupiedCount(c) {
    return (c.bats || []).length;
  }

  function opsLogs(sn) {
    return OPS_LOGS.filter((r) => !sn || r.sn === sn);
  }

  function pushOpsLog(sn, op, port, result) {
    OPS_LOGS.unshift({
      time: nowStamp(),
      sn,
      op,
      port: port == null || port === "" ? "—" : String(port),
      by: "现场·演示",
      result: result || "成功",
    });
  }

  function getPort(id, portNo) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    const p = portRows(c).find((x) => x.portNo === Number(portNo));
    if (!p) return { error: "仓门不存在", cabinet: c };
    return { cabinet: c, port: p };
  }

  function refreshCabinet(id) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    c.lastRefreshAt = nowStamp();
    pushOpsLog(c.sn, "刷新", "—", c.online ? "成功" : "离线缓存");
    return { cabinet: c };
  }

  function openPort(id, portNo) {
    const found = getPort(id, portNo);
    if (found.error) return found;
    const { cabinet: c, port: p } = found;
    if (!c.online) return { error: "电柜离线，无法开门" };
    if (p.locked) return { error: "仓门已锁定，请先解锁" };
    p.doorOpen = true;
    pushOpsLog(c.sn, "远程开门", p.portNo, "成功");
    return { cabinet: c, port: p };
  }

  function openAllPorts(id) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    if (!c.online) return { error: "电柜离线，无法一键开仓" };
    let n = 0;
    portRows(c).forEach((p) => {
      if (!p.locked) {
        p.doorOpen = true;
        n += 1;
      }
    });
    pushOpsLog(c.sn, "一键开仓", "—", n ? "成功" : "无可用仓门");
    return { cabinet: c, opened: n };
  }

  function lockPort(id, portNo, reason) {
    const why = String(reason || "").trim();
    if (!why) return { error: "请输入锁仓原因" };
    const found = getPort(id, portNo);
    if (found.error) return found;
    const { cabinet: c, port: p } = found;
    p.locked = true;
    p.doorOpen = false;
    p.lockReason = why;
    pushOpsLog(c.sn, "锁定仓门", p.portNo, "成功");
    return { cabinet: c, port: p };
  }

  function unlockPort(id, portNo) {
    const found = getPort(id, portNo);
    if (found.error) return found;
    const { cabinet: c, port: p } = found;
    p.locked = false;
    p.lockReason = "";
    pushOpsLog(c.sn, "解锁仓门", p.portNo, "成功");
    return { cabinet: c, port: p };
  }

  function lockAllPorts(id, reason) {
    const why = String(reason || "").trim();
    if (!why) return { error: "请输入锁仓原因" };
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    portRows(c).forEach((p) => {
      p.locked = true;
      p.doorOpen = false;
      p.lockReason = why;
    });
    pushOpsLog(c.sn, "一键锁定", "—", "成功");
    return { cabinet: c };
  }

  function swapResultText(row) {
    if (row.status === "fail") return row.failReason || "失败";
    const a = row.batIn
      ? `${row.batIn.sn}[${row.batIn.slot}]`
      : "—";
    const b = row.batOut
      ? `${row.batOut.sn}[${row.batOut.slot}]`
      : "—";
    if (row.status === "doing") return `${a}换${b}（进行中）`;
    return `${a}换${b}`;
  }

  function filterSwapLogs(sn, opts) {
    const tab = (opts && opts.tab) || "all";
    const kw = String((opts && opts.keyword) || "").trim().toLowerCase();
    let list = SWAP_LOGS.filter((r) => r.cabinetSn === sn);
    if (tab && tab !== "all") list = list.filter((r) => r.status === tab);
    if (kw) {
      list = list.filter((r) => {
        const bats = `${(r.batIn && r.batIn.sn) || ""} ${(r.batOut && r.batOut.sn) || ""}`;
        return (
          (r.userName || "").toLowerCase().includes(kw) ||
          (r.phone || "").includes(kw) ||
          (r.flowNo || "").includes(kw) ||
          bats.toLowerCase().includes(kw)
        );
      });
    }
    return list;
  }

  function getSwapById(id) {
    return SWAP_LOGS.find((r) => r.id === id) || null;
  }

  function bindSiteOptions() {
    return MOVE_SITES.filter((s) => s.id !== "unassigned");
  }

  function resolveSiteLabel(siteLabel) {
    if (!siteLabel || siteLabel === "unassigned" || siteLabel === "未分配站点") {
      return "未分配站点";
    }
    const hit = MOVE_SITES.find((s) => s.id === siteLabel || s.label === siteLabel);
    return hit ? hit.label : null;
  }

  function moveCabinet(id, siteLabel) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    const next = resolveSiteLabel(siteLabel);
    if (!next) return { error: "站点不存在" };
    const fromUnassigned = isUnassigned(c);
    const toUnassigned = next === "未分配站点";
    if (!fromUnassigned && !toUnassigned) {
      if (c.site === next) return { error: "已在该站点" };
      return { error: "请先解绑当前站点，再绑定新站" };
    }
    if (fromUnassigned && toUnassigned) return { error: "当前未绑定站点" };
    c.site = next;
    if (toUnassigned) {
      c.address = "";
      c.online = false;
    } else {
      c.address = SITE_ADDR[next] || c.address;
    }
    return { cabinet: c, unbound: toUnassigned, bound: !toUnassigned };
  }

  function saveEdit(id, patch) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    if (patch.name != null) c.name = String(patch.name).trim() || c.name;
    if (patch.address != null) c.address = String(patch.address).trim();
    if (patch.deviceStatus) {
      c.deviceStatus = patch.deviceStatus;
      c.serviceStatus = patch.deviceStatus;
    }
    return { cabinet: c };
  }

  function setSwapMode(id, mode) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    if (SWAP_MODES.indexOf(mode) < 0) return { error: "换电模式不合法" };
    c.swapMode = mode;
    return { cabinet: c };
  }

  function setBtType(id, type) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    if (BT_TYPES.indexOf(type) < 0) return { error: "蓝牙类型不合法" };
    c.bluetoothType = type;
    return { cabinet: c };
  }

  function refreshIccid(id) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    c.iccidRefreshedAt = "刚刚";
    return { cabinet: c };
  }

  function bindQr(id) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    c.qrBound = true;
    c.qrReplacedAt = "刚刚";
    return { cabinet: c };
  }

  function togglePortService(id, portNo) {
    const c = getById(id);
    if (!c) return { error: "电柜不存在" };
    const p = portRows(c).find((x) => x.portNo === Number(portNo));
    if (!p) return { error: "端口不存在" };
    p.portServiceStatus = p.portServiceStatus === "启用" ? "停用" : "启用";
    return { port: p };
  }

  global.OperatorAppCabinets = {
    CAB_TABS,
    MOVE_SITES,
    SWAP_MODES,
    BT_TYPES,
    DEVICE_STATUSES,
    REMOTE_CMDS,
    PORT_CMDS,
    SWAP_TABS,
    SWAP_STATUS,
    CABINETS,
    isUnassigned,
    tabOf,
    tabCounts,
    getById,
    siteFilterOptions,
    siteCabinetCount,
    filterCabinets,
    ownershipLabel,
    occupiedCount,
    portRows,
    slotSnapshot,
    opsLogs,
    refreshCabinet,
    openPort,
    openAllPorts,
    lockPort,
    unlockPort,
    lockAllPorts,
    filterSwapLogs,
    getSwapById,
    swapResultText,
    bindSiteOptions,
    moveCabinet,
    saveEdit,
    setSwapMode,
    setBtType,
    refreshIccid,
    bindQr,
    togglePortService,
  };
})(window);
