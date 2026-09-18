/**
 * 财务 · 账户
 * 收款账户（进件子商户 · 基本不变）与提现账户（对公结算 · 可单独维护）分离
 * 口径对齐 PC 一期 + docs/运营商提现规则.md
 */
(function (global) {
  const WD_TABS = [
    { id: "all", label: "全部" },
    { id: "pending", label: "待审核" },
    { id: "done", label: "已提现" },
    { id: "reject", label: "已驳回" },
  ];

  const PENDING_STATUSES = ["待审核", "审核通过", "处理中"];

  const CLEARED = 52480;

  /** 收款账户：平台进件子商户，运营商收入入账户，APP 只读 */
  const COLLECT = {
    bound: true,
    receiveBank: "招商银行",
    receiveName: "上海锂电快换科技有限公司",
    merchantNo: "190000039V",
    storeNo: "SH000001",
    purpose: "运营商收入收款、骑手押金代管收款",
    bankAccountName: "上海锂电快换科技有限公司",
    bankAccount: "1219000066088820",
    bankName: "招商银行",
    bankBranch: "招商银行上海分行营业部",
    bankCode: "308290003113",
    corpBoundAt: "2026-04-12 11:20",
    custody: "已签署",
  };

  /** 提现账户：对公结算账户，钱打到这张卡，APP 可变更 */
  let SETTLE = {
    bankAccountName: "上海锂电快换科技有限公司",
    bankAccount: "1219000066088820",
    bankName: "招商银行",
    bankBranch: "招商银行上海分行营业部",
    bankCode: "308290003113",
    updatedAt: "2026-04-12 11:20",
  };

  const WITHDRAWALS = [
    {
      id: "WD-260917",
      amount: 3000,
      status: "待审核",
      applyTime: "2026-09-17 09:18",
      reviewTime: "",
      reviewedBy: "",
      withdrawTime: "",
      sourceLabel: "招商银行 · 1219 **** **** 8820",
      payeeName: "上海锂电快换科技有限公司",
      payeeAccount: "1219000066088820",
      payeeBank: "招商银行",
      payeeBranch: "招商银行上海分行营业部",
      payeeCode: "308290003113",
      rejectReason: "",
    },
    {
      id: "WD-260902",
      amount: 8000,
      status: "已提现",
      applyTime: "2026-09-02 10:02",
      reviewTime: "2026-09-02 10:40",
      reviewedBy: "平台财务",
      withdrawTime: "2026-09-02 11:05",
      sourceLabel: "招商银行 · 1219 **** **** 8820",
      payeeName: "上海锂电快换科技有限公司",
      payeeAccount: "1219000066088820",
      payeeBank: "招商银行",
      payeeBranch: "招商银行上海分行营业部",
      payeeCode: "308290003113",
      rejectReason: "",
    },
    {
      id: "WD-260815",
      amount: 4000,
      status: "已提现",
      applyTime: "2026-08-15 14:20",
      reviewTime: "2026-08-15 15:00",
      reviewedBy: "平台财务",
      withdrawTime: "2026-08-15 15:28",
      sourceLabel: "招商银行 · 1219 **** **** 8820",
      payeeName: "上海锂电快换科技有限公司",
      payeeAccount: "1219000066088820",
      payeeBank: "招商银行",
      payeeBranch: "招商银行上海分行营业部",
      payeeCode: "308290003113",
      rejectReason: "",
    },
    {
      id: "WD-260801",
      amount: 2000,
      status: "已驳回",
      applyTime: "2026-08-01 11:06",
      reviewTime: "2026-08-01 16:12",
      reviewedBy: "平台财务",
      withdrawTime: "",
      sourceLabel: "招商银行 · 1219 **** **** 8820",
      payeeName: "上海锂电快换科技有限公司",
      payeeAccount: "1219000066088820",
      payeeBank: "招商银行",
      payeeBranch: "招商银行上海分行营业部",
      payeeCode: "308290003113",
      rejectReason: "转入卡户名与营业执照不一致",
    },
  ];

  let seq = 1;

  function dash(v) {
    if (v == null || v === "") return "—";
    return String(v);
  }

  function yuan(n) {
    return (
      "¥" +
      Number(n || 0).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function maskBank(no) {
    const d = String(no || "").replace(/\s/g, "");
    if (d.length < 8) return dash(d);
    return d.slice(0, 4) + " **** **** " + d.slice(-4);
  }

  function maskMerchant(no) {
    const d = String(no || "");
    if (d.length <= 4) return dash(d);
    return "****" + d.slice(-4);
  }

  function nowStamp() {
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

  function sumBy(pred) {
    return WITHDRAWALS.filter(pred).reduce((s, w) => s + Number(w.amount || 0), 0);
  }

  function snapshot() {
    const withdrawn = sumBy((w) => w.status === "已提现");
    const frozen = sumBy((w) => PENDING_STATUSES.indexOf(w.status) >= 0);
    const total = Math.max(0, +(CLEARED - withdrawn).toFixed(2));
    const withdrawable = Math.max(0, +(CLEARED - withdrawn - frozen).toFixed(2));
    return {
      cleared: CLEARED,
      withdrawn: +withdrawn.toFixed(2),
      frozen: +frozen.toFixed(2),
      total: +total.toFixed(2),
      withdrawable,
      collect: COLLECT,
      settle: SETTLE,
      hasPending: frozen > 0,
    };
  }

  function list(tab) {
    const rows = WITHDRAWALS.slice();
    if (tab === "pending") return rows.filter((w) => PENDING_STATUSES.indexOf(w.status) >= 0);
    if (tab === "done") return rows.filter((w) => w.status === "已提现");
    if (tab === "reject") return rows.filter((w) => w.status === "已驳回");
    return rows;
  }

  function get(id) {
    return WITHDRAWALS.find((w) => w.id === id) || null;
  }

  function settleFormDefaults() {
    return {
      bankAccountName: SETTLE.bankAccountName || "",
      bankAccount: SETTLE.bankAccount || "",
      bankName: SETTLE.bankName || "",
      bankBranch: SETTLE.bankBranch || "",
      bankCode: SETTLE.bankCode || "",
    };
  }

  function updateSettle(form) {
    const name = String(form.bankAccountName || "").trim();
    const account = String(form.bankAccount || "").replace(/\s/g, "");
    const bank = String(form.bankName || "").trim();
    const branch = String(form.bankBranch || "").trim();
    const code = String(form.bankCode || "").replace(/\s/g, "");
    if (!name || name.length < 2) return { ok: false, msg: "请填写开户名称" };
    if (!/^\d{8,32}$/.test(account)) return { ok: false, msg: "银行卡号须为 8～32 位数字" };
    if (!bank) return { ok: false, msg: "请填写开户银行" };
    if (!branch) return { ok: false, msg: "请填写开户支行" };
    if (code && !/^\d{12}$/.test(code)) return { ok: false, msg: "联行号须为 12 位数字" };
    SETTLE = {
      bankAccountName: name,
      bankAccount: account,
      bankName: bank,
      bankBranch: branch,
      bankCode: code,
      updatedAt: nowStamp(),
    };
    return { ok: true, settle: SETTLE };
  }

  function applyWithdraw(amountRaw) {
    const snap = snapshot();
    if (!snap.collect.bound) return { ok: false, msg: "未绑定收款账户不可提现" };
    if (snap.hasPending) return { ok: false, msg: "已有待审核提现" };
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, msg: "请输入大于 0 的提现金额" };
    }
    if (amount > snap.withdrawable + 0.009) {
      return { ok: false, msg: "不得超过可提现余额 " + yuan(snap.withdrawable) };
    }
    const col = snap.collect;
    const st = snap.settle;
    const row = {
      id: "WD-MOCK-" + seq++,
      amount: +amount.toFixed(2),
      status: "待审核",
      applyTime: nowStamp(),
      reviewTime: "",
      reviewedBy: "",
      withdrawTime: "",
      sourceLabel: col.bankName + " · " + maskBank(col.bankAccount),
      payeeName: st.bankAccountName,
      payeeAccount: st.bankAccount,
      payeeBank: st.bankName,
      payeeBranch: st.bankBranch,
      payeeCode: st.bankCode,
      rejectReason: "",
    };
    WITHDRAWALS.unshift(row);
    return { ok: true, id: row.id };
  }

  global.OperatorAppFinance = {
    WD_TABS,
    snapshot,
    list,
    get,
    applyWithdraw,
    updateSettle,
    settleFormDefaults,
    yuan,
    maskBank,
    maskMerchant,
    dash,
  };
})(window);
