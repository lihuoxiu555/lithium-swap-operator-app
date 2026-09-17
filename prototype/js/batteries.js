/**
 * 电池详情 · Mock（订单电池编号进入）
 * 定位 + 远程操作同一页；不下发真实 IoT。
 */
(function (global) {
  const CITY_POI = {
    溧阳: {
      lng: 119.495407,
      lat: 31.433167,
      address: "江苏省常州市溧阳市昆仑南路与东大街交叉口附近",
      pois: [
        { t: "河滨广场", x: 18, y: 42 },
        { t: "翰林苑1区", x: 46, y: 18 },
        { t: "马垫建安大厦", x: 58, y: 52 },
        { t: "溧阳汽车东站", x: 62, y: 78 },
      ],
    },
    昆山: {
      lng: 120.958,
      lat: 31.385,
      address: "江苏省苏州市昆山市前进路商业区附近",
      pois: [
        { t: "前进路", x: 22, y: 30 },
        { t: "中环广场", x: 54, y: 44 },
        { t: "高铁昆山南", x: 70, y: 72 },
      ],
    },
    苏州: {
      lng: 120.585,
      lat: 31.299,
      address: "江苏省苏州市工业园区星湖街附近",
      pois: [
        { t: "星湖街", x: 28, y: 36 },
        { t: "圆融时代", x: 60, y: 48 },
      ],
    },
    浦东: {
      lng: 121.506,
      lat: 31.245,
      address: "上海市浦东新区张杨路骑手驿站附近",
      pois: [
        { t: "张杨路", x: 24, y: 32 },
        { t: "陆家嘴", x: 62, y: 28 },
        { t: "世博园区", x: 48, y: 70 },
      ],
    },
    上海: {
      lng: 121.4737,
      lat: 31.2304,
      address: "上海市中心城区",
      pois: [
        { t: "人民广场", x: 40, y: 40 },
        { t: "外滩", x: 68, y: 36 },
      ],
    },
  };

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function nowText() {
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

  function hashSn(sn) {
    let n = 0;
    const s = String(sn || "");
    for (let i = 0; i < s.length; i++) n = (n * 33 + s.charCodeAt(i)) >>> 0;
    return n;
  }

  function cityKeyFromSite(site) {
    const t = String(site || "");
    if (t.indexOf("溧阳") >= 0) return "溧阳";
    if (t.indexOf("昆山") >= 0) return "昆山";
    if (t.indexOf("苏州") >= 0 || t.indexOf("军盛") >= 0) return "苏州";
    if (t.indexOf("浦东") >= 0 || t.indexOf("陆家嘴") >= 0 || t.indexOf("世博") >= 0) return "浦东";
    return "上海";
  }

  function jitterCoord(base, sn, scale) {
    const h = hashSn(sn);
    const dx = ((h % 80) - 40) / 10000;
    const dy = (((h / 80) | 0) % 80 - 40) / 10000;
    return {
      lng: +(base.lng + dx * (scale || 1)).toFixed(6),
      lat: +(base.lat + dy * (scale || 1)).toFixed(6),
    };
  }

  function pinPercent(city, lng, lat) {
    const c = CITY_POI[city] || CITY_POI["上海"];
    const x = 50 + (lng - c.lng) * 1800;
    const y = 48 - (lat - c.lat) * 1800;
    return {
      x: Math.max(16, Math.min(84, x)),
      y: Math.max(18, Math.min(82, y)),
    };
  }

  const SEED = [
    {
      sn: "035211127474",
      model: "60V 60AH",
      site: "溧阳运营",
      belong: "柜外-用户",
      holder: "史建国 189****1617",
      cabinetSn: "—",
      soc: 89,
      soh: 97,
      online: true,
      sats: 8,
      locateBy: "GPS",
      reportedAt: "2026-09-16 16:27:19",
      dischargeOn: true,
      chargeOn: false,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211148001",
      model: "72V 60AH",
      site: "昆山运营",
      belong: "其他运营商电柜",
      holder: "—",
      cabinetSn: "CAB-KS-01",
      soc: 76,
      soh: 96,
      online: true,
      sats: 9,
      locateBy: "GPS",
      reportedAt: "2026-09-16 17:02:08",
      dischargeOn: true,
      chargeOn: false,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211148000",
      model: "72V 60AH",
      site: "昆山运营",
      belong: "自有电柜",
      holder: "—",
      cabinetSn: "CAB-KS-01",
      soc: 41,
      soh: 94,
      online: true,
      sats: 6,
      locateBy: "GPS",
      reportedAt: "2026-09-16 12:18:40",
      dischargeOn: false,
      chargeOn: true,
      buzzerEnable: false,
      buzzerOn: false,
    },
    {
      sn: "035211101427",
      model: "72V 60AH",
      site: "溧阳运营",
      belong: "自有电柜",
      holder: "—",
      cabinetSn: "溧阳一号柜72",
      soc: 92,
      soh: 98,
      online: true,
      sats: 10,
      locateBy: "GPS",
      reportedAt: "2026-09-16 15:10:59",
      dischargeOn: false,
      chargeOn: true,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211128027",
      model: "60V 60AH",
      site: "昆山运营",
      belong: "柜外-用户",
      holder: "赵阳 130****4051",
      cabinetSn: "—",
      soc: 18,
      soh: 91,
      online: false,
      sats: 0,
      locateBy: "LBS",
      reportedAt: "2026-09-15 21:44:02",
      dischargeOn: true,
      chargeOn: false,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211148864",
      model: "72V 60AH",
      site: "昆山2级",
      belong: "自有电柜",
      holder: "—",
      cabinetSn: "035211101427",
      soc: 64,
      soh: 95,
      online: true,
      sats: 7,
      locateBy: "GPS",
      reportedAt: "2026-09-15 13:03:02",
      dischargeOn: false,
      chargeOn: true,
      buzzerEnable: false,
      buzzerOn: false,
    },
    {
      sn: "035211210001",
      model: "72V 60AH",
      site: "浦东骑手驿站",
      belong: "柜外-用户",
      holder: "王骑手 138****0001",
      cabinetSn: "CAB-22018",
      soc: 96,
      soh: 99,
      online: true,
      sats: 11,
      locateBy: "GPS",
      reportedAt: "2026-09-16 08:30:12",
      dischargeOn: true,
      chargeOn: false,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211210010",
      model: "60V 60AH",
      site: "世博换电服务点",
      belong: "柜外-用户",
      holder: "孙骑手 139****0010",
      cabinetSn: "CAB-22021",
      soc: 88,
      soh: 97,
      online: true,
      sats: 8,
      locateBy: "GPS",
      reportedAt: "2026-09-16 11:20:00",
      dischargeOn: true,
      chargeOn: false,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211210006",
      model: "72V 60AH",
      site: "浦东骑手驿站",
      belong: "柜外-用户",
      holder: "陈骑手 135****0006",
      cabinetSn: "CAB-22018",
      soc: 71,
      soh: 96,
      online: true,
      sats: 5,
      locateBy: "GPS",
      reportedAt: "2026-09-13 19:40:22",
      dischargeOn: true,
      chargeOn: false,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211210012",
      model: "60V 60AH",
      site: "浦东骑手驿站",
      belong: "柜外",
      holder: "—",
      cabinetSn: "—",
      soc: 33,
      soh: 90,
      online: true,
      sats: 4,
      locateBy: "LBS",
      reportedAt: "2026-09-15 22:08:11",
      dischargeOn: true,
      chargeOn: false,
      buzzerEnable: true,
      buzzerOn: false,
    },
    {
      sn: "035211210088",
      model: "72V 60AH",
      site: "浦东骑手驿站",
      belong: "自有电柜",
      holder: "—",
      cabinetSn: "CAB-22018",
      soc: 18,
      soh: 93,
      online: true,
      sats: 6,
      locateBy: "GPS",
      reportedAt: "2026-06-09 08:30:00",
      dischargeOn: false,
      chargeOn: true,
      buzzerEnable: false,
      buzzerOn: false,
    },
    {
      sn: "035211210009",
      model: "60V 60AH",
      site: "世博换电服务点",
      belong: "自有电柜",
      holder: "—",
      cabinetSn: "CAB-22021",
      soc: 24,
      soh: 92,
      online: true,
      sats: 7,
      locateBy: "GPS",
      reportedAt: "2026-06-02 10:15:00",
      dischargeOn: false,
      chargeOn: true,
      buzzerEnable: false,
      buzzerOn: false,
    },
  ];

  const BY_SN = {};
  SEED.forEach((b) => {
    BY_SN[b.sn] = Object.assign({}, b);
  });

  function synthesize(sn) {
    const h = hashSn(sn);
    const city = h % 5 === 0 ? "溧阳" : h % 3 === 0 ? "昆山" : "浦东";
    const online = h % 11 !== 0;
    return {
      sn,
      model: h % 2 === 0 ? "60V 60AH" : "72V 60AH",
      site: city === "浦东" ? "浦东骑手驿站" : city + "运营",
      belong: h % 4 === 0 ? "自有电柜" : h % 4 === 1 ? "柜外-用户" : h % 4 === 2 ? "柜外" : "其他运营商电柜",
      holder: h % 4 === 1 ? "骑手 ****" + String(h % 10000).padStart(4, "0") : "—",
      cabinetSn: h % 4 === 0 || h % 4 === 3 ? "CAB-" + String(10000 + (h % 9000)) : "—",
      soc: 28 + (h % 70),
      soh: 88 + (h % 12),
      online,
      sats: online ? 3 + (h % 10) : 0,
      locateBy: online && h % 5 !== 0 ? "GPS" : "LBS",
      reportedAt: "2026-09-16 12:" + pad2(h % 60) + ":" + pad2((h / 7) % 60),
      dischargeOn: h % 4 !== 0,
      chargeOn: h % 4 === 0,
      buzzerEnable: h % 3 !== 0,
      buzzerOn: false,
    };
  }

  function getBySn(sn) {
    const id = String(sn || "").trim();
    if (!id || id === "—") return null;
    if (!BY_SN[id]) BY_SN[id] = synthesize(id);
    return BY_SN[id];
  }

  function enrich(b) {
    const city = cityKeyFromSite(b.site);
    const base = CITY_POI[city] || CITY_POI["上海"];
    const coord = jitterCoord(base, b.sn);
    const pin = pinPercent(city, coord.lng, coord.lat);
    return Object.assign({}, b, {
      city,
      address: base.address,
      lng: coord.lng,
      lat: coord.lat,
      pinX: pin.x,
      pinY: pin.y,
      pois: base.pois,
      gpsText:
        "GPS:N" +
        coord.lat.toFixed(6) +
        ",E" +
        coord.lng.toFixed(6) +
        "," +
        (b.reportedAt || ""),
    });
  }

  function view(sn) {
    const b = getBySn(sn);
    return b ? enrich(b) : null;
  }

  function toggleDischarge(sn) {
    const b = getBySn(sn);
    if (!b) return null;
    b.dischargeOn = !b.dischargeOn;
    return enrich(b);
  }

  function toggleCharge(sn) {
    const b = getBySn(sn);
    if (!b) return null;
    b.chargeOn = !b.chargeOn;
    return enrich(b);
  }

  function buzzerCmd(sn, cmd) {
    const b = getBySn(sn);
    if (!b) return { ok: false, reason: "not_found" };
    if (cmd === "buzz") {
      b.buzzerOn = true;
      return { ok: true, bat: enrich(b), msg: b.online ? "鸣叫已下发（Mock）" : "设备离线，鸣叫已缓存（Mock）" };
    }
    if (cmd === "stop") {
      b.buzzerOn = false;
      return { ok: true, bat: enrich(b), msg: "已停止鸣叫（Mock）" };
    }
    return { ok: false, reason: "unknown", bat: enrich(b), msg: "未知指令" };
  }

  function refreshLbs(sn) {
    const b = getBySn(sn);
    if (!b) return null;
    b.locateBy = "LBS";
    b.sats = Math.min(12, (b.sats || 0) + 2);
    b.reportedAt = nowText();
    return enrich(b);
  }

  global.OperatorAppBatteries = {
    getBySn,
    view,
    toggleDischarge,
    toggleCharge,
    buzzerCmd,
    refreshLbs,
    nowText,
  };
})(window);
