/**
 * 工作台警告 · 对齐 PC「我的设备 → 设备告警」
 * 首页分组：高温 / 设备异常
 * 换电柜异常类型为封闭枚举（C-03）
 */
(function (global) {
  const ALERT_GROUPS = [
    { id: "overheat", title: "高温", icon: "温" },
    { id: "fault", title: "设备异常", icon: "异" },
  ];

  /** 常规换电柜异常 · 封闭枚举（与 PC 任务-设备告警 一致） */
  const ALERT_TYPES = [
    {
      id: "cabinet_overtemp",
      label: "柜体过温",
      group: "overheat",
      severity: "高",
      source: "IoT 传感器",
    },
    {
      id: "cabinet_offline",
      label: "换电柜离线",
      group: "fault",
      severity: "高",
      source: "IoT 心跳超时",
    },
    {
      id: "eject_fail",
      label: "未正常弹电池",
      group: "fault",
      severity: "高",
      source: "IoT 换电结果",
    },
    {
      id: "eject_wrong_slot",
      label: "弹错格口",
      group: "fault",
      severity: "高",
      source: "IoT 换电结果",
    },
    {
      id: "door_fault",
      label: "门禁异常",
      group: "fault",
      severity: "中",
      source: "IoT 仓门状态",
    },
  ];

  const ALERT_TYPE_LABEL = ALERT_TYPES.reduce((acc, t) => {
    acc[t.id] = t.label;
    return acc;
  }, {});

  function getTypeMeta(id) {
    return ALERT_TYPES.find((t) => t.id === id) || null;
  }

  function typesOf(groupId) {
    if (!groupId || groupId === "all") return ALERT_TYPES.slice();
    return ALERT_TYPES.filter((t) => t.group === groupId);
  }

  const ALERTS = [
    {
      id: "AL-005",
      group: "overheat",
      alertType: "cabinet_overtemp",
      subtype: "柜体过温",
      severity: "高",
      deviceSn: "CAB-22021",
      site: "世博换电服务点",
      status: "待处理",
      message: "仓内 62℃，超过阈值 55℃",
      swapOrderId: null,
      raisedAt: "今天 13:08",
    },
    {
      id: "AL-001",
      group: "fault",
      alertType: "eject_fail",
      subtype: "未正常弹电池",
      severity: "高",
      deviceSn: "CAB-22018",
      site: "浦东骑手驿站",
      status: "待处理",
      message: "换电结束未检测到电池弹出（格口 7）",
      swapOrderId: "SW260620001",
      raisedAt: "今天 14:33",
    },
    {
      id: "AL-008",
      group: "fault",
      alertType: "eject_wrong_slot",
      subtype: "弹错格口",
      severity: "高",
      deviceSn: "CAB-22018",
      site: "浦东骑手驿站",
      status: "待处理",
      message: "应弹格口 4，实际弹出格口 7",
      swapOrderId: "SW260620088",
      raisedAt: "今天 14:02",
    },
    {
      id: "AL-004",
      group: "fault",
      alertType: "cabinet_offline",
      subtype: "换电柜离线",
      severity: "高",
      deviceSn: "CAB-22019",
      site: "浦东骑手驿站",
      status: "待处理",
      message: "心跳超时 25 分钟",
      swapOrderId: "SW2606140912",
      raisedAt: "今天 09:15",
    },
    {
      id: "AL-007",
      group: "fault",
      alertType: "door_fault",
      subtype: "门禁异常",
      severity: "中",
      deviceSn: "CAB-22050",
      site: "临港偏远站",
      status: "处理中",
      message: "3 号仓门状态异常",
      swapOrderId: null,
      raisedAt: "昨天 22:05",
      handledBy: "站点运维小王",
    },
  ];

  function getGroupMeta(id) {
    return ALERT_GROUPS.find((g) => g.id === id) || null;
  }

  function getAlertById(id) {
    return ALERTS.find((a) => a.id === id) || null;
  }

  function byDeviceSn(sn) {
    return ALERTS.filter((a) => a.deviceSn === sn);
  }

  function isOpen(a) {
    return a.status === "待处理" || a.status === "处理中";
  }

  function pendingOf(groupId, typeId) {
    return ALERTS.filter((a) => {
      if (!isOpen(a)) return false;
      if (groupId && groupId !== "all" && a.group !== groupId) return false;
      if (typeId && typeId !== "all" && a.alertType !== typeId) return false;
      return true;
    });
  }

  function typeSummaries(groupId) {
    return typesOf(groupId).map((t) => ({
      id: t.id,
      label: t.label,
      group: t.group,
      severity: t.severity,
      count: pendingOf(groupId, t.id).length,
    }));
  }

  function summaries(opts) {
    if (opts && opts.forceEmpty) return [];
    return ALERT_GROUPS.map((g) => {
      const list = pendingOf(g.id);
      return {
        id: g.id,
        title: g.title,
        icon: g.icon,
        count: list.length,
        preview: list[0] ? `${list[0].subtype} · ${list[0].site}` : "暂无",
      };
    }).filter((s) => s.count > 0);
  }

  function totalCount(opts) {
    return summaries(opts).reduce((n, s) => n + s.count, 0);
  }

  function claimAlert(id) {
    const a = getAlertById(id);
    if (!a) return { error: "告警不存在" };
    if (!isOpen(a)) return { error: "该告警已关闭" };
    a.status = "处理中";
    a.handledBy = "演示员";
    return { alert: a };
  }

  function closeAlert(id) {
    const a = getAlertById(id);
    if (!a) return { error: "告警不存在" };
    if (a.status === "已关闭") return { error: "该告警已关闭" };
    a.status = "已关闭";
    a.handledBy = a.handledBy || "演示员";
    a.handleNote = "现场确认（原型）";
    return { alert: a };
  }

  global.OperatorAppAlerts = {
    ALERT_GROUPS,
    ALERT_TYPES,
    ALERT_TYPE_LABEL,
    ALERTS,
    getGroupMeta,
    getTypeMeta,
    typesOf,
    typeSummaries,
    getAlertById,
    byDeviceSn,
    pendingOf,
    summaries,
    totalCount,
    claimAlert,
    closeAlert,
  };
})(window);
