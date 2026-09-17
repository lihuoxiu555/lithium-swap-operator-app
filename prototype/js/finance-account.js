/**
 * 财务 · 账户
 * 口径对齐 PC 一期：收款账户 + 提现申请（APP 称提现明细）
 * 可提现 = 已清分 − 已提现 − 待审/处理中；融资待还不扣（二期）
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

  const RECEIVE = {
    bound: true,
    bankAccountName: "上海锂电快换科技有限公司",
    bankAccount: "1219000066088820",
    bankName: "招商银行",
    bankBranch: "招商银行上海分行营业部",
    bankCode: "308290003113",
    corpBoundAt: "2026-04-12 11:20",
    updatedBy: "管理员",
    updatedByRole: "运营商",
    custody: "已签署",
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
      receive: RECEIVE,
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

  function applyWithdraw(amountRaw) {
    const snap = snapshot();
    if (!snap.receive.bound) return { ok: false, msg: "未绑定收款账户不可提现" };
    if (snap.frozen > 0) return { ok: false, msg: "已有待审核提现" };
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, msg: "请输入大于 0 的提现金额" };
    }
    if (amount > snap.withdrawable + 0.009) {
      return { ok: false, msg: "不得超过可提现余额 " + yuan(snap.withdrawable) };
    }
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const ts =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate()) +
      " " +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes());
    const rec = snap.receive;
    const row = {
      id: "WD-MOCK-" + seq++,
      amount: +amount.toFixed(2),
      status: "待审核",
      applyTime: ts,
      reviewTime: "",
      reviewedBy: "",
      withdrawTime: "",
      sourceLabel: rec.bankName + " · " + maskBank(rec.bankAccount),
      payeeName: rec.bankAccountName,
      payeeAccount: rec.bankAccount,
      payeeBank: rec.bankName,
      payeeBranch: rec.bankBranch,
      payeeCode: rec.bankCode,
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
    yuan,
    maskBank,
    dash,
  };
})(window);
