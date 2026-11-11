/**
 * 运营商主体 · 业务城市 / 数据权限范围（与 PC 运营商主体配置同源口径）
 */
(function (global) {
  const OPERATOR_ID = "OP-SX";
  const OPERATOR_NAME = "绿色出行";

  /** @type {string[]} 已开通业务城市；新增站点时可扩展 */
  let BIZ_CITIES = ["上海", "杭州", "溧阳", "苏州"];

  function listBizCities() {
    return [...BIZ_CITIES];
  }

  /**
   * 站点落城即开通：新城市纳入运营商数据权限
   * @param {string} city
   */
  function registerBizCity(city) {
    const c = String(city || "").trim();
    if (!c) return { added: false, city: c };
    if (BIZ_CITIES.includes(c)) return { added: false, city: c };
    BIZ_CITIES.push(c);
    BIZ_CITIES.sort((a, b) => a.localeCompare(b, "zh-CN"));
    return { added: true, city: c, cities: listBizCities() };
  }

  function adminDataScopeLabel() {
    return `全网 · ${BIZ_CITIES.join("、")}`;
  }

  global.OperatorAppOperatorScope = {
    OPERATOR_ID,
    OPERATOR_NAME,
    listBizCities,
    registerBizCity,
    adminDataScopeLabel,
  };
})(typeof window !== "undefined" ? window : globalThis);
