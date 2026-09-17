/**
 * 运维·站点 · Mock 与辅助
 * 对齐 PC 运营商「站点管理 → 站点信息」（一期）
 * 场费电费 / 站点合伙人 / 站点支出 → 二期入口占位
 */
(function (global) {
  const SITE_STATUS = [
    { id: "all", label: "全部" },
    { id: "在营", label: "在营" },
    { id: "建设中", label: "建设中" },
    { id: "已停用", label: "已停用" },
  ];

  const SITE_TYPES = ["配送站", "写字楼", "渠道专属"];
  const SITE_CITIES = ["上海", "杭州"];
  const PHOTO_MAX = 9;
  const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
  const PHOTO_ACCEPT = ["image/jpeg", "image/png", "image/webp"];
  const DEFAULT_BG = "assets/site-photos/default.svg";
  const SAMPLE_PHOTOS = [
    { id: "ph-demo-01", url: "assets/site-photos/entrance.svg", name: "门头实景.jpg" },
    { id: "ph-demo-02", url: "assets/site-photos/cabinet.svg", name: "柜机近景.jpg" },
    { id: "ph-demo-03", url: "assets/site-photos/default.svg", name: "站点全景.jpg" },
  ];

  function clonePhotos(list) {
    return (list || [])
      .filter((p) => p && p.url)
      .map((p) => ({ id: p.id, url: p.url, name: p.name || "实景.jpg" }));
  }

  function photoList(site) {
    return clonePhotos(site && site.photos);
  }

  function photoCover(site) {
    const list = photoList(site);
    return list[0] || null;
  }

  /** 锂电快换（PC Mock 主体 OP-SX）名下站点 */
  const SITES = [
    {
      id: "ST-SH-01",
      name: "浦东骑手驿站",
      city: "上海",
      address: "上海市浦东新区张杨路1588号",
      lng: 121.5275,
      lat: 31.2304,
      type: "配送站",
      cabinets: 3,
      batteries: 36,
      status: "在营",
      waitingCount: 2,
      channelDedicated: false,
      publicOpen: true,
      photos: SAMPLE_PHOTOS.map((p) => ({ ...p })),
    },
    {
      id: "ST-SH-02",
      name: "世博换电服务点",
      city: "上海",
      address: "上海市浦东新区世博大道1368号",
      lng: 121.4892,
      lat: 31.1901,
      type: "配送站",
      cabinets: 1,
      batteries: 12,
      status: "在营",
      waitingCount: 0,
      channelDedicated: false,
      publicOpen: true,
      photos: [],
    },
    {
      id: "ST-SH-JD",
      name: "京东物流专属站",
      city: "上海",
      address: "上海市浦东新区康桥路888号",
      lng: 121.589,
      lat: 31.142,
      type: "渠道专属",
      cabinets: 4,
      batteries: 24,
      status: "在营",
      waitingCount: 1,
      channelDedicated: true,
      publicOpen: false,
      visibilityMode: "whitelist_only",
      photos: [{ id: "ph-jd-01", url: "assets/site-photos/entrance.svg", name: "专属站入口.jpg" }],
    },
    {
      id: "ST-SH-05",
      name: "张江筹备站",
      city: "上海",
      address: "上海市浦东新区张江路2000号",
      lng: null,
      lat: null,
      type: "写字楼",
      cabinets: 0,
      batteries: 0,
      status: "建设中",
      waitingCount: 0,
      channelDedicated: false,
      publicOpen: true,
      photos: [],
    },
    {
      id: "ST-SH-LG",
      name: "临港偏远站",
      city: "上海",
      address: "上海市浦东新区临港大道1888号",
      lng: 121.923,
      lat: 30.893,
      type: "配送站",
      cabinets: 2,
      batteries: 18,
      status: "在营",
      waitingCount: 0,
      channelDedicated: false,
      publicOpen: true,
      remoteHint: true,
      photos: [
        { id: "ph-lg-01", url: "assets/site-photos/cabinet.svg", name: "临港柜机.jpg" },
        { id: "ph-lg-02", url: "assets/site-photos/entrance.svg", name: "临港入口.jpg" },
      ],
    },
    {
      id: "ST-HZ-01",
      name: "萧山旧仓站",
      city: "杭州",
      address: "杭州市萧山区通惠南路88号",
      lng: 120.27,
      lat: 30.18,
      type: "配送站",
      cabinets: 1,
      batteries: 0,
      status: "已停用",
      waitingCount: 0,
      channelDedicated: false,
      publicOpen: true,
      photos: [],
    },
  ];

  function getSiteById(id) {
    return SITES.find((s) => s.id === id) || null;
  }

  function openRangeLabel(site) {
    if (site.channelDedicated || site.publicOpen === false) {
      return { short: "渠道专用", detail: "仅白名单可见 · 不对公众开放" };
    }
    return { short: "公众开放", detail: "地图/附近站点对公众可见" };
  }

  function formatCoord(site) {
    if (site.lng == null || site.lat == null || site.lng === "" || site.lat === "") {
      return "";
    }
    return `${site.lng}, ${site.lat}`;
  }

  function parseCoords(lngRaw, latRaw) {
    const lngS = String(lngRaw ?? "").trim();
    const latS = String(latRaw ?? "").trim();
    if (!lngS && !latS) return { lng: null, lat: null };
    if (!lngS || !latS) return { error: "经度与纬度需同时填写，或全部留空" };
    const lng = Number(lngS);
    const lat = Number(latS);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return { error: "坐标须为有效数字" };
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return { error: "经度范围 -180~180，纬度范围 -90~90" };
    }
    return { lng, lat };
  }

  const CITY_CENTERS = {
    上海: { lng: 121.4737, lat: 31.2304 },
    杭州: { lng: 120.1551, lat: 30.2741 },
  };

  /** 无定位 API 时的演示设备坐标（GCJ-02），与浦东张杨路原针可区分 */
  const DEMO_DEVICE = {
    lng: 121.5055,
    lat: 31.2368,
    address: "上海市浦东新区陆家嘴环路1000号",
    city: "上海",
  };

  const MAP_POIS = [
    {
      q: ["南京路", "南京", "和平区", "天津"],
      address: "天津市和平区南京路31号",
      lng: 117.2009,
      lat: 39.1173,
    },
    {
      q: ["张杨路", "浦东骑手", "驿站"],
      address: "上海市浦东新区张杨路1588号",
      lng: 121.5275,
      lat: 31.2304,
      city: "上海",
    },
    {
      q: ["陆家嘴环路", "当前位置", "设备定位"],
      address: "上海市浦东新区陆家嘴环路1000号",
      lng: 121.5055,
      lat: 31.2368,
      city: "上海",
    },
    {
      q: ["世博", "世博大道"],
      address: "上海市浦东新区世博大道1368号",
      lng: 121.4892,
      lat: 31.1901,
      city: "上海",
    },
    {
      q: ["康桥", "京东"],
      address: "上海市浦东新区康桥路888号",
      lng: 121.589,
      lat: 31.142,
      city: "上海",
    },
    {
      q: ["张江"],
      address: "上海市浦东新区张江路2000号",
      lng: 121.605,
      lat: 31.205,
      city: "上海",
    },
    {
      q: ["临港"],
      address: "上海市浦东新区临港大道1888号",
      lng: 121.923,
      lat: 30.893,
      city: "上海",
    },
    {
      q: ["萧山", "通惠"],
      address: "杭州市萧山区通惠南路88号",
      lng: 120.27,
      lat: 30.18,
      city: "杭州",
    },
    {
      q: ["西湖", "龙井"],
      address: "杭州市西湖区龙井路1号",
      lng: 120.129,
      lat: 30.227,
      city: "杭州",
    },
    {
      q: ["人民广场", "人民大道"],
      address: "上海市黄浦区人民大道200号",
      lng: 121.4737,
      lat: 31.2304,
      city: "上海",
    },
  ];

  const MAP_SCALE = {
    1: { metric: "1000 米", imperial: "4000 英尺" },
    2: { metric: "500 米", imperial: "2000 英尺" },
    3: { metric: "200 米", imperial: "800 英尺" },
    4: { metric: "100 米", imperial: "400 英尺" },
  };

  function clampMapZoom(z) {
    const n = Number(z) || 2;
    return Math.min(4, Math.max(1, n));
  }

  function cityCenter(city) {
    return CITY_CENTERS[city] || CITY_CENTERS["上海"];
  }

  function mapView(form, zoom) {
    const parsed = parseCoords(form && form.lng, form && form.lat);
    const hasPin = parsed.lng != null && !parsed.error;
    const center = hasPin
      ? { lng: parsed.lng, lat: parsed.lat }
      : cityCenter(form && form.city);
    return { center, hasPin, zoom: clampMapZoom(zoom) };
  }

  function outOfChina(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  function transformLat(lng, lat) {
    let ret =
      -100 +
      2 * lng +
      3 * lat +
      0.2 * lat * lat +
      0.1 * lng * lat +
      0.2 * Math.sqrt(Math.abs(lng));
    ret +=
      ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) /
      3;
    ret +=
      ((20 * Math.sin(lat * Math.PI) + 40 * Math.sin((lat / 3) * Math.PI)) * 2) / 3;
    ret +=
      ((160 * Math.sin((lat / 12) * Math.PI) +
        320 * Math.sin((lat * Math.PI) / 30)) *
        2) /
      3;
    return ret;
  }

  function transformLng(lng, lat) {
    let ret =
      300 +
      lng +
      2 * lat +
      0.1 * lng * lng +
      0.1 * lng * lat +
      0.1 * Math.sqrt(Math.abs(lng));
    ret +=
      ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) /
      3;
    ret +=
      ((20 * Math.sin(lng * Math.PI) + 40 * Math.sin((lng / 3) * Math.PI)) * 2) / 3;
    ret +=
      ((150 * Math.sin((lng / 12) * Math.PI) +
        300 * Math.sin((lng / 30) * Math.PI)) *
        2) /
      3;
    return ret;
  }

  function wgs84ToGcj02(lng, lat) {
    lng = Number(lng);
    lat = Number(lat);
    if (!Number.isFinite(lng) || !Number.isFinite(lat) || outOfChina(lng, lat)) {
      return { lng: +lng.toFixed(6), lat: +lat.toFixed(6) };
    }
    const a = 6378245;
    const ee = 0.00669342162296594323;
    let dLat = transformLat(lng - 105, lat - 35);
    let dLng = transformLng(lng - 105, lat - 35);
    const radLat = (lat / 180) * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
    dLng = (dLng * 180) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
    return { lng: +(lng + dLng).toFixed(6), lat: +(lat + dLat).toFixed(6) };
  }

  function inferCity(lng, lat) {
    let best = "上海";
    let bestD = Infinity;
    Object.keys(CITY_CENTERS).forEach((name) => {
      const c = CITY_CENTERS[name];
      const d = Math.abs(c.lng - lng) + Math.abs(c.lat - lat);
      if (d < bestD) {
        bestD = d;
        best = name;
      }
    });
    return bestD < 2 ? best : "上海";
  }

  function fromDeviceCoords(lng, lat, cityHint) {
    const parsed = parseCoords(lng, lat);
    if (parsed.error) return parsed;
    const city = inferCity(parsed.lng, parsed.lat) || cityHint || "上海";
    return {
      lng: +Number(parsed.lng).toFixed(6),
      lat: +Number(parsed.lat).toFixed(6),
      address: reverseGeocode(parsed.lng, parsed.lat, city),
      city,
    };
  }

  function reverseGeocode(lng, lat, city) {
    let best = null;
    let bestD = Infinity;
    MAP_POIS.forEach((p) => {
      const d = Math.abs(p.lng - lng) + Math.abs(p.lat - lat);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    });
    if (best && bestD < 0.02) return best.address;
    const c = city || "上海";
    return `${c}市（${Number(lng).toFixed(4)}, ${Number(lat).toFixed(4)}）`;
  }

  function parseCoordQuery(raw) {
    const s = String(raw || "").trim();
    const m = s.match(/^(-?\d+(?:\.\d+)?)\s*[,，\s]\s*(-?\d+(?:\.\d+)?)$/);
    if (!m) return null;
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a >= 70 && a <= 140 && b >= 3 && b <= 55) return parseCoords(a, b);
    if (b >= 70 && b <= 140 && a >= 3 && a <= 55) return parseCoords(b, a);
    return parseCoords(a, b);
  }

  function searchMap(query, city) {
    const q = String(query || "").trim();
    if (!q) return { error: "请输入地址或经纬度" };
    const coord = parseCoordQuery(q);
    if (coord) {
      if (coord.error) return coord;
      return {
        lng: coord.lng,
        lat: coord.lat,
        address: reverseGeocode(coord.lng, coord.lat, city),
      };
    }
    const hit = MAP_POIS.find((p) =>
      p.q.some((k) => q.includes(k) || k.includes(q))
    );
    if (hit) {
      return {
        lng: hit.lng,
        lat: hit.lat,
        address: hit.address,
        city: hit.city,
      };
    }
    const center = cityCenter(city);
    const lng = +(center.lng + 0.006).toFixed(4);
    const lat = +(center.lat + 0.003).toFixed(4);
    const street = q.replace(/市$/, "");
    return {
      lng,
      lat,
      address: `${city || "上海"}市${street}${/号|路|街|巷$/.test(street) ? "" : "附近"}`,
    };
  }

  function tapMapToCoord(xRatio, yRatio, form, zoom) {
    const view = mapView(form, zoom);
    const span = 0.018 / view.zoom;
    const lng = view.center.lng + (xRatio - 0.5) * span * 2;
    const lat = view.center.lat - (yRatio - 0.5) * span * 1.15;
    const next = {
      lng: +lng.toFixed(4),
      lat: +lat.toFixed(4),
    };
    next.address = reverseGeocode(next.lng, next.lat, form && form.city);
    return next;
  }

  function filterSites(opts) {
    const { status, keyword } = opts || {};
    const kw = (keyword || "").trim();
    return SITES.filter((s) => {
      if (status && status !== "all" && s.status !== status) return false;
      if (kw) {
        const hay = `${s.name}${s.id}${s.address}${s.city}`;
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }

  function statusCounts() {
    const c = { all: SITES.length, 在营: 0, 建设中: 0, 已停用: 0 };
    SITES.forEach((s) => {
      if (c[s.status] != null) c[s.status] += 1;
    });
    return c;
  }

  function saveSite(form, siteId) {
    const name = String(form.name || "").trim();
    const address = String(form.address || "").trim();
    if (!name || !address) return { error: "请填写站点名称与地址" };
    const coords = parseCoords(form.lng, form.lat);
    if (coords.error) return { error: coords.error };

    const isDedicatedType = (form.type || "配送站") === "渠道专属";
    const publicType = form.type === "写字楼" ? "写字楼" : "配送站";

    if (!siteId || siteId === "new") {
      const seq = String(SITES.length + 1).padStart(2, "0");
      const id = "ST-SH-A" + seq;
      const row = {
        id,
        name,
        city: form.city || "上海",
        address,
        lng: coords.lng,
        lat: coords.lat,
        type: isDedicatedType ? "渠道专属" : publicType,
        cabinets: 0,
        batteries: 0,
        status: form.status || "在营",
        waitingCount: 0,
        channelDedicated: isDedicatedType,
        publicOpen: !isDedicatedType,
        visibilityMode: isDedicatedType ? "whitelist_only" : undefined,
        photos: clonePhotos(form.photos).slice(0, PHOTO_MAX),
      };
      SITES.unshift(row);
      return { site: row, created: true };
    }

    const site = getSiteById(siteId);
    if (!site) return { error: "站点不存在" };
    if (site.channelDedicated) {
      site.address = address;
      site.status = form.status || site.status;
      site.lng = coords.lng;
      site.lat = coords.lat;
      site.photos = clonePhotos(form.photos).slice(0, PHOTO_MAX);
    } else {
      site.name = name;
      site.city = form.city || site.city;
      site.address = address;
      site.lng = coords.lng;
      site.lat = coords.lat;
      site.type = isDedicatedType ? "渠道专属" : publicType;
      site.status = form.status || site.status;
      if (isDedicatedType) {
        site.channelDedicated = true;
        site.publicOpen = false;
        site.visibilityMode = "whitelist_only";
      }
      site.photos = clonePhotos(form.photos).slice(0, PHOTO_MAX);
    }
    return { site, created: false };
  }

  global.OperatorAppSites = {
    SITE_STATUS,
    SITE_TYPES,
    SITE_CITIES,
    PHOTO_MAX,
    PHOTO_MAX_BYTES,
    PHOTO_ACCEPT,
    DEFAULT_BG,
    SAMPLE_PHOTOS,
    SITES,
    getSiteById,
    openRangeLabel,
    formatCoord,
    parseCoords,
    clonePhotos,
    photoList,
    photoCover,
    filterSites,
    statusCounts,
    saveSite,
    CITY_CENTERS,
    DEMO_DEVICE,
    MAP_SCALE,
    clampMapZoom,
    mapView,
    searchMap,
    tapMapToCoord,
    reverseGeocode,
    wgs84ToGcj02,
    inferCity,
    fromDeviceCoords,
  };
})(window);
