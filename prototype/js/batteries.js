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

  /** 电池管理列表 · 对齐 manage-app 字段 */
  const MGMT_EXTRA = {
    "BPACK7257026091700031": {
      shellCode: "BSHEL00850RRD26082600010",
      sn: "BPACK7257026091700031",
      model: "72V57Ah",
      spec: "72V57Ah",
      site: "—",
      online: true,
      soc: 88,
      cabinetSn: "—",
      slot: "—",
      enabled: true,
      hasValidLoc: false,
      businessNo: "DC2026102013211359221477737",
      locationText: "未知",
      soh: 100,
    },
    "342500011": {
      shellCode: "342500011",
      sn: "342500011",
      model: "72V57Ah",
      spec: "72V57Ah",
      site: "—",
      online: true,
      soc: 88,
      cabinetSn: "—",
      slot: "—",
      enabled: true,
      hasValidLoc: true,
      businessNo: "DC2026102013211359221477737",
      locationText: "未知",
      soh: 100,
      dischargeOn: true,
      chargeOn: true,
    },
  };

  Object.keys(MGMT_EXTRA).forEach((sn) => {
    const row = MGMT_EXTRA[sn];
    if (!BY_SN[sn]) {
      BY_SN[sn] = Object.assign(
        {
          belong: "柜外",
          holder: "—",
          sats: 8,
          locateBy: "LBS",
          reportedAt: "2026-10-20 13:21:13",
          buzzerEnable: true,
          buzzerOn: false,
        },
        row
      );
    } else {
      Object.assign(BY_SN[sn], row);
    }
  });

  SEED.forEach((b) => {
    if (!b.shellCode) {
      b.shellCode = "BSHEL" + String(hashSn(b.sn)).slice(0, 8).toUpperCase() + b.sn.slice(-6);
    }
    if (!b.spec) b.spec = b.model.replace(/\s/g, "");
    if (b.enabled == null) b.enabled = true;
    if (b.businessNo == null) {
      b.businessNo = "DC" + hashSn(b.sn) + b.sn.slice(-4);
    }
    if (b.locationText == null) b.locationText = b.belong || "未知";
    if (b.slot == null) b.slot = b.cabinetSn && b.cabinetSn !== "—" ? "—" : "—";
    if (b.hasValidLoc == null) b.hasValidLoc = b.online && b.sats > 0;
  });

  function allForManage() {
    return Object.keys(BY_SN).map((sn) => enrich(getBySn(sn)));
  }

  function siteOptions() {
    const set = new Set();
    allForManage().forEach((b) => {
      if (b.site && b.site !== "—") set.add(b.site);
    });
    return ["全部站点", ...Array.from(set).sort()];
  }

  function filterManageList(opts) {
    const kw = String(opts.keyword || "")
      .trim()
      .toLowerCase();
    const site = opts.site || "全部站点";
    const online = opts.online || "全部在线状态";
    return allForManage().filter((b) => {
      if (site !== "全部站点" && b.site !== site) return false;
      if (online === "在线" && !b.online) return false;
      if (online === "离线" && b.online) return false;
      if (!kw) return true;
      const hay = [
        b.shellCode,
        b.sn,
        b.model,
        b.spec,
        b.businessNo,
        b.cabinetSn,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(kw);
    });
  }

  function refreshDeviceStatus(sn) {
    const b = getBySn(sn);
    if (!b) return null;
    b.reportedAt = nowText();
    b.online = true;
    b.sats = Math.max(b.sats || 0, 6);
    return enrich(b);
  }

  function setDischargeCharge(sn, dischargeOn, chargeOn) {
    const b = getBySn(sn);
    if (!b) return null;
    b.dischargeOn = dischargeOn;
    b.chargeOn = chargeOn;
    return enrich(b);
  }

  function toggleDischargeChargeLinked(sn) {
    const b = getBySn(sn);
    if (!b) return null;
    const next = !(b.dischargeOn && b.chargeOn);
    b.dischargeOn = next;
    b.chargeOn = next;
    return enrich(b);
  }

  function renderManagePage(mgmt, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const list = filterManageList(mgmt);
    const sites = siteOptions();
    const onlineOpts = ["全部在线状态", "在线", "离线"];
    const siteOpts = sites
      .map(
        (s) =>
          `<option value="${escapeAttr(s)}"${mgmt.site === s ? " selected" : ""}>${escapeHtml(
            s
          )}</option>`
      )
      .join("");
    const onlineSelect = onlineOpts
      .map(
        (o) =>
          `<option value="${escapeAttr(o)}"${mgmt.online === o ? " selected" : ""}>${escapeHtml(
            o
          )}</option>`
      )
      .join("");
    const cards = list.length
      ? list
          .map((b) => {
            const title = b.shellCode || b.sn;
            return `<article class="bat-mgmt-card">
              <div class="bat-mgmt-card-hd">
                <button type="button" class="bat-mgmt-code" data-action="battery-open" data-sn="${escapeAttr(
                  b.sn
                )}">${escapeHtml(title)}</button>
                <button type="button" class="bat-mgmt-copy" data-action="copy-text" data-text="${escapeAttr(
                  title
                )}">复制</button>
                <span class="bat-mgmt-badge${b.enabled ? "" : " off"}">${b.enabled ? "启用" : "停用"}</span>
              </div>
              <div class="bat-mgmt-kv">
                <div><span>SN</span><em>${escapeHtml(b.sn)}</em></div>
                <div><span>电池型号</span><em>${escapeHtml(b.model)}</em></div>
                <div><span>电池规格</span><em>${escapeHtml(b.spec || b.model)}</em></div>
                <div><span>站点</span><em>${escapeHtml(b.site)}</em></div>
                <div><span>在线状态</span><em class="${b.online ? "ok" : "off"}">${b.online ? "在线" : "离线"}</em></div>
                <div><span>电量</span><em>${b.soc}%</em></div>
                <div><span>当前电柜</span><em>${escapeHtml(b.cabinetSn)}</em></div>
              </div>
              <button type="button" class="bat-mgmt-detail" data-action="battery-open" data-sn="${escapeAttr(
                b.sn
              )}">查看详情 <span aria-hidden="true">›</span></button>
            </article>`;
          })
          .join("")
      : `<div class="empty-full"><div class="icon">🔋</div>暂无匹配电池</div>`;

    return `
      <div class="bat-mgmt-page">
        <div class="bat-mgmt-header">
          <button type="button" class="bat-mgmt-back" data-action="bat-mgmt-back" aria-label="返回">‹</button>
          <h1>电池管理</h1>
          <div class="bat-mgmt-header-spacer"></div>
        </div>
        <div class="bat-mgmt-search">
          <input id="bat-mgmt-kw" type="search" placeholder="请输入壳体码/通讯板编码/提手码/SN" value="${escapeAttr(
            mgmt.keyword || ""
          )}" />
          <button type="button" class="bat-mgmt-query" data-action="bat-mgmt-search">查询</button>
        </div>
        <div class="bat-mgmt-filters">
          <label class="bat-mgmt-select">
            <select id="bat-mgmt-site" data-action="bat-mgmt-site">${siteOpts}</select>
          </label>
          <label class="bat-mgmt-select">
            <select id="bat-mgmt-online">${onlineSelect}</select>
          </label>
        </div>
        <div class="bat-mgmt-list">${cards}</div>
      </div>`;
  }

  function renderDetailMgmt(b, state, ctx) {
    const { escapeHtml, escapeAttr } = ctx;
    const locTab = state.locTab || "lbs";
    const locTabs = [
      ["lbs", "LBS定位"],
      ["addr", "详细地址"],
      ["nav", "导航"],
      ["track", "轨迹"],
    ]
      .map(
        ([id, label]) =>
          `<button type="button" class="bat-loc-btn${locTab === id ? " active" : ""}" data-action="battery-loc-tab" data-tab="${id}">${escapeHtml(
            label
          )}</button>`
      )
      .join("");
    const mapBlock = b.hasValidLoc
      ? `<div class="bat-map bat-map-compact" role="img" aria-label="位置示意">
          <div class="bat-pin" style="left:${b.pinX}%;top:${b.pinY}%"><span>⚡</span></div>
          <div class="bat-gps">${escapeHtml(b.gpsText)}</div>
        </div>`
      : `<div class="bat-map-empty"><span class="bat-map-empty-icon" aria-hidden="true">📄</span><p>暂无有效定位</p></div>`;
    const linkedOn = b.dischargeOn && b.chargeOn;
    const displayId = b.shellCode && b.shellCode !== b.sn ? b.shellCode : b.sn;

    return `
      <div class="lease-page bat-page bat-page-mgmt">
        <div class="bat-mgmt-header bat-detail-hd">
          <button type="button" class="bat-mgmt-back" data-action="battery-back" aria-label="返回">‹ 返回</button>
          <h1>电池详情</h1>
          <div class="bat-mgmt-header-spacer"></div>
        </div>
        <div class="bat-body">
          <section class="bat-card bat-id bat-id-mgmt">
            <div class="bat-id-sn bat-id-sn-center">
              <strong>${escapeHtml(displayId)}</strong>
              <button type="button" class="bat-mgmt-copy" data-action="copy-text" data-text="${escapeAttr(
                displayId
              )}">复制</button>
            </div>
            <p class="bat-id-sub">${escapeHtml(b.spec || b.model)}</p>
            <div class="bat-metrics bat-metrics-mgmt">
              <div><small>剩余电量</small><em>${b.soc}%</em></div>
              <div><small>网络状态</small><em class="${b.online ? "ok" : "off"}">${b.online ? "在线" : "离线"}</em></div>
            </div>
            <p class="bat-report">位置最后上报 ${escapeHtml(b.reportedAt || "—")}</p>
            <button type="button" class="bat-mgmt-refresh" data-action="battery-refresh">刷新设备状态</button>
          </section>

          <section class="bat-card">
            <div class="bat-sec-hd"><i></i>远程操作</div>
            <p class="bat-linkage-hint">充放电联动：任一开关会同时控制充电与放电</p>
            <button type="button" class="bat-switch-row" data-action="battery-discharge-linked" aria-pressed="${linkedOn ? "true" : "false"}">
              <span>放电开关</span>
              <span class="bat-sw-tag ${b.dischargeOn ? "on" : "off"}">${b.dischargeOn ? "开启" : "关闭"}</span>
              <span class="lease-switch${b.dischargeOn ? " is-on" : ""}"></span>
            </button>
            <button type="button" class="bat-switch-row" data-action="battery-charge-linked" aria-pressed="${linkedOn ? "true" : "false"}">
              <span>充电开关</span>
              <span class="bat-sw-tag ${b.chargeOn ? "on" : "off"}">${b.chargeOn ? "开启" : "关闭"}</span>
              <span class="lease-switch${b.chargeOn ? " is-on" : ""}"></span>
            </button>
            <div class="bat-buzz-hd">蜂鸣器 · ${b.buzzerOn ? "周期鸣叫中" : "关闭"}</div>
            <div class="bat-buzz bat-buzz-mgmt">
              <button type="button" class="bat-buzz-btn hot" data-action="battery-buzzer" data-cmd="buzz">开启周期蜂鸣</button>
              <button type="button" class="bat-buzz-btn" data-action="battery-buzzer" data-cmd="stop">停止周期蜂鸣</button>
            </div>
            <p class="bat-buzz-note">停止不撤回已发送的蜂鸣命令。</p>
          </section>

          <section class="bat-card bat-map-card">
            <div class="bat-sec-hd"><i></i>定位</div>
            <div class="bat-loc-acts">${locTabs}</div>
            <p class="bat-loc-hint">查询最后有效位置，不触发设备重新定位。</p>
            ${mapBlock}
          </section>

          <section class="bat-card">
            <div class="bat-sec-hd"><i></i>资产</div>
            <div class="bat-asset-kv">
              <div><span>健康度</span><em>${b.soh}%</em></div>
              <div><span>业务编号</span><em>${escapeHtml(b.businessNo || "—")}</em></div>
              <div><span>所属站点</span><em>${escapeHtml(b.site)}</em></div>
              <div><span>位置</span><em>${escapeHtml(b.locationText || b.belong || "未知")}</em></div>
              <div><span>持有人</span><em>${escapeHtml(b.holder)}</em></div>
              <div><span>型号</span><em>${escapeHtml(b.model)}</em></div>
              <div><span>电池规格</span><em>${escapeHtml(b.spec || b.model)}</em></div>
              <div><span>所在电柜</span><em>${escapeHtml(b.cabinetSn)}</em></div>
              <div><span>格口</span><em>${escapeHtml(b.slot || "—")}</em></div>
            </div>
          </section>
        </div>
      </div>`;
  }

  global.OperatorAppBatteries = {
    getBySn,
    view,
    toggleDischarge,
    toggleCharge,
    toggleDischargeChargeLinked,
    setDischargeCharge,
    buzzerCmd,
    refreshLbs,
    refreshDeviceStatus,
    filterManageList,
    siteOptions,
    renderManagePage,
    renderDetailMgmt,
    nowText,
  };
})(window);
