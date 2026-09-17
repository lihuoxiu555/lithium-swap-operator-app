/**
 * 评审右侧 · 本页字段与设定
 * 口径对齐 docs/字段口径-对齐PC一期.md · decision-032
 */
(function (global) {
  function S(partial) {
    return Object.assign(
      {
        title: "",
        source: "PC 一期",
        fields: [],
        stats: [],
        enums: [],
        empty: "—",
        error: "—",
        roles: "管理员 / 员工无差异",
        note: "",
      },
      partial
    );
  }

  const SPECS = {
    login: S({
      title: "登录",
      source: "框架",
      fields: [
        { name: "手机号", def: "11 位大陆号；演示 13800000005" },
        { name: "密码", def: "演示 123456" },
        { name: "协议勾选", def: "未勾选不可登录" },
      ],
      empty: "空手机号/密码拦截",
      error: "非 11 位、错密、未勾选协议",
      roles: "登录后按账号出身份",
    }),
    pickRole: S({
      title: "选择身份",
      source: "框架",
      fields: [
        { name: "管理员", def: "经营/财务类宫格可见" },
        { name: "员工", def: "按 modules.js roles 裁剪" },
      ],
      empty: "单身份账号跳过本页",
      roles: "双身份才出现",
    }),
    workbench: S({
      title: "工作台",
      source: "框架 + 经营口径 decision-036 / 037",
      stats: [
        { name: "换电次数", def: "completed_at；成功+失败。单位次。与图表「换电订单数」同口径" },
        { name: "换电人数", def: "区间内成功换电骑手去重。单位人。≠活跃用户（活跃还含服务中未换电且未冻结）" },
        { name: "套餐收入", def: "paid_at；C 端实付。单位元。不含退款、占用费、额度池、清分" },
      ],
      fields: [
        { name: "分组", def: "经营 / 运维 / 财务 / 其他。经营含换电订单、经营统计、设备统计；运维含站点、电柜管理。无「运营」组" },
        { name: "宫格", def: "只读 modules.js；仅 status=ready 展示。placeholder 不进宫格" },
        { name: "摘要槽", def: "固定今日三卡：换电次数 / 换电人数 / 套餐收入。无时间筛。点整区进经营统计" },
        { name: "Mock", def: "86 次 / 18 人 / 4,690 元" },
      ],
      enums: ["今日：[今日0点,明日0点)"],
      empty: "空宫格场景：「暂无可用应用」；摘要为 0 仍展示 0",
      roles: "管理员与员工摘要同数；员工不见财务待办入口；宫格按角色裁",
    }),
    todosHub: S({
      title: "待办 Tab",
      source: "PC 一期待办 + 告警五类",
      fields: [
        { name: "待办", def: "退款待审 / 逾期持电 / 渠道商充值申请（左）" },
        { name: "警告", def: "高温 / 设备异常（右）；与待办同行" },
        { name: "消息", def: "排在待办+警告下方，不是第四 Tab" },
      ],
      enums: ["柜体过温", "换电柜离线", "未正常弹电池", "弹错格口", "门禁异常"],
      empty: "队列为 0 时角标隐藏",
      roles: "员工仅「逾期持电」+ 警告；无退款/充值",
    }),
    todos: S({
      title: "待办队列",
      source: "PC 一期退款 / 逾期 / 渠道充值",
      fields: [
        { name: "退款策略", def: "全额 / 部分 / 仅退押金 / 拒绝；中途完结无仅退押金" },
        { name: "逾期", def: "个人套餐逾期 / 人天池占用；催还不离队" },
        { name: "渠道充值", def: "人天采购 / 设备月租 / 激活码 / 保证金凭证" },
      ],
      empty: "处理后离队；空列表无项",
      error: "部分退超可退上限拦截；拒绝须填原因",
      roles: "员工直链退款/充值 toast「无待办权限」",
    }),
    "todos:refund": S({
      title: "退款待审 · 详情",
      source: "PC 一期退款管理",
      fields: [
        { name: "可退上限", def: "全额带入且金额只读" },
        { name: "部分退款", def: "可改实退，不可超上限" },
        { name: "仅退押金", def: "中途完结不出现" },
      ],
      empty: "—",
      error: "超可退上限；拒绝无原因",
      roles: "仅管理员",
    }),
    "todos:overdue": S({
      title: "逾期持电 · 详情",
      source: "PC 一期逾期管理",
      fields: [
        { name: "电池", def: "可点进电池详情" },
        { name: "占用费 / 人天池", def: "个人逾期看占用费；渠道看人天池" },
        { name: "操作", def: "催还 toast；模拟还电不改列表状态" },
      ],
      roles: "管理员 / 员工均可",
    }),
    "todos:recharge": S({
      title: "渠道充值 · 详情",
      source: "PC 一期渠道结算",
      fields: [
        { name: "类型", def: "人天采购 / 设备月租 / 激活码 / 保证金凭证" },
        { name: "操作", def: "确认到账 / 驳回" },
      ],
      roles: "仅管理员",
    }),
    alerts: S({
      title: "警告列表",
      source: "PC 一期柜异常五类",
      fields: [
        { name: "筛选项", def: "柜体过温 / 换电柜离线 / 未正常弹电池 / 弹错格口 / 门禁异常" },
        { name: "编码", def: "cabinet_overtemp / cabinet_offline / eject_fail / eject_wrong_slot / door_fault" },
      ],
      enums: ["无「电池过温」"],
      empty: "暂无警告",
      note: "未正常弹电池 / 弹错格口详情带关联换电单",
    }),
    "alerts:detail": S({
      title: "警告详情",
      source: "PC 一期柜异常",
      fields: [
        { name: "处置", def: "接单、关闭；关闭后角标减少" },
        { name: "关联单", def: "弹仓两类展示换电单号" },
      ],
      roles: "管理员 / 员工均可",
    }),
    messages: S({
      title: "系统消息",
      source: "框架",
      fields: [{ name: "列表", def: "类型 / 摘要 / 时间；未读红点" }],
      empty: "暂无消息",
    }),
    msgDetail: S({
      title: "消息详情",
      source: "框架",
      fields: [{ name: "正文", def: "只读；返回待办 Tab 或我的" }],
    }),
    mine: S({
      title: "我的",
      source: "框架",
      fields: [
        { name: "所属运营商", def: "锂电快换" },
        { name: "账号 / 关于", def: "次页只读" },
      ],
    }),
    about: S({
      title: "关于",
      source: "框架",
      fields: [{ name: "产品名", def: "锂电快换，无「绿色出行」" }],
    }),
    account: S({
      title: "账号信息",
      source: "框架",
      fields: [
        { name: "手机号", def: "当前会话号" },
        { name: "角色", def: "管理员 / 员工" },
      ],
    }),
    placeholder: S({
      title: "模块占位",
      source: "框架",
      fields: [{ name: "文案", def: "本模块暂未开放；禁止假 KPI" }],
      empty: "本页即空态",
    }),
    leaseOrders: S({
      title: "换电订单",
      source: "PC 一期换电单 + APP 现场状态机",
      fields: [
        { name: "卡片规则", def: "一用户最新一单；先用户信息后订单；无类型/状态 Tab" },
        { name: "权益来源", def: "个人套餐 / 渠道人天" },
        { name: "个人·用户信息", def: "套餐（SKU 文案）、租金、押金、到期/剩余或逾期" },
        { name: "人天·用户信息", def: "渠道商、额度池、团队、已分配/已消耗/个人剩余、今日资格" },
        { name: "订单区", def: "订单编号、站点、电池编号（可点）、机柜、时间、备注" },
        { name: "问题角标", def: "已欠费 / 待还电 / 待确认 / 暂存中；欠费与待还电红框" },
      ],
      enums: ["个人状态：待确认 / 使用中 / 暂存中 / 已欠费 / 已结束", "人天另有待还电"],
      empty: "暂无换电订单",
      error: "扫码 toast「请手动输入，扫码暂未开放」",
      note: "列表状态机是现场用的，不换成 PC 的成功/失败。操作有问题才点。",
    }),
    leaseSub: S({
      title: "换电订单 · 次页",
      source: "APP 现场操作",
      fields: [{ name: "次页", def: "按当前操作出：计费 / 支付 / 更换 / 合同 / 结束等" }],
      empty: "记录类无数据「暂无记录」",
      error: "表单缺必填不可提交",
    }),
    sites: S({
      title: "站点列表",
      source: "PC 一期站点信息",
      fields: [
        { name: "搜索", def: "名称 / 编号 / 地址" },
        { name: "卡片", def: "城市、类型、开放范围、柜/电、封面图或「未上传」" },
      ],
      enums: ["类型：配送站 / 写字楼 / 渠道专属", "状态：在营 / 建设中 / 已停用"],
      empty: "无匹配站点",
      roles: "员工无新增/编辑",
    }),
    "sites:detail": S({
      title: "站点详情",
      source: "PC 一期站点信息",
      fields: [
        { name: "基础", def: "编号、地址、坐标、柜/电、等待中、开放范围" },
        { name: "实景", def: "最多 9 张；无图用系统默认背景" },
        { name: "二期能力", def: "详情不展示场费电费 / 站点合伙人 / 站点支出" },
      ],
      empty: "无图=默认背景",
      roles: "员工只读",
    }),
    "sites:form": S({
      title: "站点新增 / 编辑",
      source: "PC 一期站点信息",
      fields: [
        { name: "必填", def: "名称 + 详细地址" },
        { name: "类型", def: "配送站 / 写字楼 / 渠道专属" },
        { name: "坐标", def: "地图选点或「选择当前位置」；未选点也可保存。设备定位转 GCJ-02" },
        { name: "选择当前位置", def: "点击才取定位；写入针点/坐标/详细地址。拒绝权限不回填" },
        { name: "实景", def: "最多 9 张；单张 ≤5MB；jpg/png/webp" },
      ],
      enums: ["营业状态：在营 / 建设中 / 已停用"],
      empty: "可「填入示例实景」",
      error: "缺名称/地址；格式错或超 5MB toast；定位拒绝「未获得定位权限」；超时「定位超时」",
      roles: "仅管理员；渠道专属站名称/城市/类型只读",
    }),
    bizStats: S({
      title: "经营统计",
      source: "PC 总览规格（菜单二期，口径一期）",
      stats: [
        { name: "在线站点", def: "在营且 ≥1 台柜在线且未停用。快照" },
        { name: "在线电柜", def: "online=true 且设备状态≠停用。快照" },
        { name: "在线电池", def: "电池 online；否则随所在柜。快照" },
        { name: "有效个人用户", def: "未结束个人单去重，含冻结。5 人（冻结中：1 人）。有效≠活跃" },
        { name: "有效渠道用户", def: "未结束人天单去重，含待还电。快照" },
      ],
      fields: [
        { name: "时间两层", def: "KPI/繁忙标签=此刻；图表才跟所选自然月" },
        { name: "自然月", def: "上海时区；年份从 2026 起；当前年仅到演示当月" },
        { name: "主体", def: "仅当前运营商；不按站点拆金额" },
      ],
      note: "不做站点收入、用电量进 KPI。完整边界见字段口径 decision-036。",
    }),
    "bizStats:charts": S({
      title: "经营统计 · 图表",
      source: "PC 总览规格",
      stats: [
        { name: "套餐购买金额", def: "paid_at；C 端实付。不含退款、占用费、额度池、清分" },
        { name: "换电订单数", def: "completed_at；成功+失败。不含进行中" },
        { name: "活跃用户", def: "区间去重；剔除冻结/完结。≠有效用户" },
        { name: "套餐新购", def: "paid_at 的套餐/次卡订单数，含复购" },
        { name: "新增用户", def: "本主体首次开通的自然日；改号/解冻不计" },
      ],
      enums: ["自然月：所选年月的自然日抽样", "年份：2026 起"],
      empty: "本期 Mock 有柱",
      note: "年月选择器：‹ 年份 › + 1–12 月。每图双柱：彩色=本期，灰柱=去年同期同月（同比）。切月时页顶 KPI 不变。无当日换电分时。",
    }),
    "bizStats:busy": S({
      title: "经营统计 · 站点繁忙度",
      source: "PC 站点经营分析",
      stats: [
        { name: "繁忙度", def: "实时。高：等待≥3 或占用≥85%；中：等待≥1 或≥60%；否则低" },
        { name: "占用", def: "≈ 柜内电池 / 仓口" },
        { name: "高峰 / 最忙", def: "当天成功换电。APP 不做历史统计日回放" },
      ],
      fields: [
        { name: "时间", def: "无图表时间筛。标签实时，高峰取当天" },
        { name: "不做", def: "站点收入、用户主站、用电量" },
      ],
      empty: "无站点行则空列表",
    }),
    deviceStats: S({
      title: "设备统计",
      source: "PC 总览规格",
      stats: [
        { name: "柜机", def: "总数 = 在线 + 离线 + 停用；在线 = online true；停用 = 设备状态停用" },
        { name: "电池", def: "总数 / 在线 / 离线 / 在柜 / 柜外-用户 / 柜外。12 = 10 + 2" },
        { name: "站点", def: "在营 / 建设中 / 已停用" },
        { name: "仓口", def: "占用 ≈ 柜内电池数" },
      ],
      empty: "0 值灰字占位，不隐藏",
      note: "手机页只留数字格子；公式在本栏。电池 3+3 格。**无告警电柜组**；柜异常见待办 Tab·警告、电柜详情·本柜告警。",
    }),
    cabinets: S({
      title: "电柜列表",
      source: "PC 一期换电柜",
      fields: [
        { name: "搜索", def: "关键字匹配 SN、站点名称、电柜名称（包含即可）。与站点下拉同时生效" },
        { name: "站点筛", def: "下拉精确筛选：全部站点 / 各站 / 未分配。每项括号=该站电柜台数（全量，不随搜索变）" },
        { name: "卡片", def: "名称、启用/停用、通电、在线/离线、SN、站点、仓口、在柜电池、上次换电。未分配另标" },
        { name: "操作", def: "历史记录 / 换电记录 / 编辑（仅管理员）" },
      ],
      enums: ["Tab：全部 / 在线 / 离线 / 未分配", "通电：已通电绿 / 未通电红", "网络：在线绿 / 离线红"],
      empty: "筛空「暂无电柜」。选京东物流专属站本期无柜",
      roles: "员工列表无编辑",
    }),
    "cabinets:detail:cabinet": S({
      title: "电柜详情 · 电柜信息",
      source: "PC 一期换电柜详情",
      fields: [
        { name: "展示", def: "名称、启用、在线、SN、在柜电池、通电、已用电量、站点、地址" },
        { name: "操作", def: "刷新 / 一键开仓 / 锁定" },
      ],
      enums: ["通电：已通电 / 未通电"],
      error: "离线开仓 toast「电柜离线，无法开门」",
    }),
    "cabinets:detail:slots": S({
      title: "电柜详情 · 格口信息",
      source: "PC 一期仓口",
      fields: [
        { name: "每仓", def: "电量 / 开关 / 锁定 / 电池编号（可进详情）" },
        { name: "操作", def: "开门确认；锁定须填原因" },
      ],
      empty: "空仓电池「—」",
      error: "空锁仓原因不可提交",
    }),
    "cabinets:detail:basic": S({
      title: "电柜详情 · 基础信息",
      source: "PC 一期换电柜详情",
      fields: [
        { name: "台账", def: "设备编号、二维码、通讯板、ICCID、名称、类型、通电、服务状态、版本、可换规格、已用电量、地址、SN、站点、权属、换电模式、蓝牙、城市、仓口、在线、上次换电" },
        { name: "权属", def: "自有；融资标二期" },
        { name: "换电模式", def: "正常换电 / MQTT离线换电 / 蓝牙换电" },
      ],
      empty: "未绑定二维码「未绑定」",
      roles: "移柜仅管理员",
    }),
    "cabinets:detail:charge": S({
      title: "电柜详情 · 充电服务设置",
      source: "PC 一期（原型有）",
      fields: [
        { name: "四项", def: "每格口充电签约比例、换电保留格口、专享已签约、共享已签约" },
      ],
      empty: "保存回本 Tab",
    }),
    "cabinets:detail:more": S({
      title: "电柜详情 · 其他设置",
      source: "PC 一期告警 + 二期运维",
      fields: [
        { name: "更多运维", def: "通断电/风扇/重启等，标二期" },
        { name: "本柜告警", def: "五类柜异常" },
        { name: "组成 / 历史 / 换电记录", def: "组成二期可浏览" },
      ],
      empty: "暂无本柜告警",
    }),
    "cabinets:move": S({
      title: "移柜",
      source: "PC 一期换电柜",
      fields: [
        { name: "已绑站", def: "只可解绑。须确认。不能直接改到另一站" },
        { name: "未分配", def: "选择站点后确认绑定" },
      ],
      error: "已绑站时改绑 toast「请先解绑当前站点，再绑定新站」",
      roles: "仅管理员",
    }),
    "cabinets:edit": S({
      title: "编辑电柜",
      source: "PC 一期",
      fields: [
        { name: "可改", def: "设备名称、投放地址、设备状态" },
        { name: "站点", def: "已绑站：只读 + 解绑确认。未分配：选站 + 绑定确认。禁止 A 站直接改 B 站" },
      ],
      error: "未解绑就绑定：「请先解绑当前站点，再绑定新站」",
      roles: "仅管理员",
    }),
    "cabinets:charge": S({
      title: "充电服务设置表单",
      source: "PC 一期",
      fields: [
        { name: "签约", def: "比例、保留格口、专享/共享已签约" },
      ],
    }),
    "cabinets:opslog": S({
      title: "历史记录",
      source: "PC 一期操作留痕",
      fields: [{ name: "行", def: "操作、结果、端口、操作人、时间" }],
      empty: "暂无记录",
    }),
    "cabinets:swaplog": S({
      title: "机柜换电记录",
      source: "PC 一期换电流水",
      fields: [
        { name: "搜索", def: "用户名 / 手机号 / 电池编号" },
        { name: "卡片", def: "电柜 SN、业务、能耗、业务流程码、换入/换出电池、还电/取电格口、用时、开始/结束、换电结果" },
      ],
      enums: ["Tab：全部 / 成功 / 进行中 / 失败"],
      empty: "暂无换电记录",
    }),
    "cabinets:swapDetail": S({
      title: "换电记录详情",
      source: "PC 一期换电流水",
      fields: [{ name: "电池编号", def: "可点进电池详情" }],
    }),
    "cabinets:compose": S({
      title: "电柜组成",
      source: "二期可浏览",
      fields: [{ name: "模块 / 格口快照", def: "有电格口高亮；一期不交付" }],
    }),
    "cabinets:qr": S({
      title: "电柜二维码",
      source: "PC 一期",
      fields: [{ name: "绑定状态", def: "已绑定 / 未绑定" }],
    }),
    "cabinets:snapshot": S({
      title: "柜体快照",
      source: "二期",
      fields: [{ name: "快照", def: "演示浏览，不接真实遥测" }],
    }),
    userList: S({
      title: "用户管理",
      source: "PC 一期用户",
      fields: [
        { name: "身份", def: "用户编号、姓名、手机号、身份证号" },
        { name: "实名认证", def: "已实名 / 未实名。未通过不进本列表" },
        { name: "服务状态", def: "服务中 / —" },
        { name: "电池押金", def: "实付 / 渠道担保 / —" },
        { name: "押金状态", def: "在押 / —" },
        { name: "个人套餐", def: "未结束个人单型号或挂名 +「生效」；无则 —" },
        { name: "渠道额度", def: "未结束人天单「渠道 · 剩余 N 人天（池号）」" },
        { name: "当前持有电池", def: "未结束单上的电池编号，可点可复制" },
      ],
      empty: "暂无用户；空值一律「—」，禁止 null",
      note: "只读查号，不可改手机号（平台处理）。不做紧急电话、性别、用户渠道、手机认证、认证方式。无门店筛。",
    }),
    userSms: S({
      title: "短信验证码",
      source: "运营现场",
      fields: [
        { name: "卡片", def: "手机号、发送状态、验证码（点复制）、用户、身份证号、公司名称、创建时间" },
      ],
      enums: ["发送成功"],
      empty: "暂无验证码记录；空姓名「—」",
    }),
    userPay: S({
      title: "用户支付记录",
      source: "PC 一期资金实收",
      fields: [
        { name: "卡片", def: "流水号、类型、关联单、套餐、站点、收款主体、商户号、实收、手续费、入账、通道、时间" },
      ],
      enums: ["Tab：套餐支付 / 逾期占用费 / 退款", "类型：套餐支付 / 电池占用费 / 退款出款"],
      empty: "暂无支付记录",
      note: "占用费全额进运营商、不进清分。不做额度池采购、预支付、待审核。",
    }),
    financeAccount: S({
      title: "账户",
      source: "PC 一期收款账户 + 提现申请",
      stats: [
        { name: "账户总金额", def: "已清分 − 已提现。= 可提现 + 冻结中。此刻快照" },
        { name: "冻结中", def: "待审核 / 审核通过 / 处理中的提现金额合计" },
        { name: "可提现", def: "已清分 − 已提现 − 冻结中。一期不扣融资待还" },
      ],
      fields: [
        { name: "收款账户", def: "唯一招行对公卡：开户名称、卡号（脱敏）、开户银行、开户支行、联行号、绑定时间、托管协议。转出户" },
        { name: "提现明细", def: "工单、金额、申请时间、转入卡、状态。点进详情" },
      ],
      enums: ["今日 Mock：总金额 ¥40,480.00 / 冻结中 ¥3,000.00 / 可提现 ¥37,480.00", "状态：待审核 / 已提现 / 已驳回"],
      empty: "无工单「暂无提现明细」；有待审时点发起提现 toast「已有待审核提现」",
      error: "未绑定收款账户不可提现；可提现=0 不可申请",
      roles: "仅管理员。员工宫格不可见，直链 toast「无权限」",
      note: "变更收款账户、改转入他行卡留 PC。金额≠套餐购买金额（那是 C 端实付）。",
    }),
    "financeAccount:apply": S({
      title: "账户 · 发起提现",
      source: "PC 一期提现工单",
      fields: [
        { name: "提现金额", def: ">0 且 ≤ 可提现" },
        { name: "转出", def: "只读，收款账户" },
        { name: "转入", def: "APP 锁同收款账户；改其他对公卡请在 PC" },
      ],
      error: "超可提现 / 已有待审 / 未绑卡 → toast，不提交",
      roles: "仅管理员",
    }),
    "financeAccount:detail": S({
      title: "账户 · 提现明细",
      source: "PC 一期提现申请表",
      fields: [
        { name: "工单字段", def: "金额、申请时间、转出、转入开户名称/卡号/银行/支行/联行号、审核、到账时间、驳回原因" },
      ],
      empty: "未知工单「未找到该工单」",
    }),
    batteryDetail: S({
      title: "电池详情",
      source: "PC 一期电池位置 + APP 现场遥控",
      fields: [
        { name: "位置", def: "自有电柜 / 其他运营商电柜 / 柜外 / 柜外-用户" },
        { name: "健康", def: "SOC%；SOH%" },
        { name: "遥控", def: "放电、充电开关；蜂鸣器仅鸣叫/停止" },
        { name: "定位", def: "LBS / 详细地址；导航·轨迹 toast「暂未开放」；无分享" },
      ],
      empty: "无效编号「未找到该电池」",
      error: "无编号不可点",
      note: "遥控与定位是 APP 现场页，不回写 PC。",
    }),
    _fallback: S({
      title: "本页",
      source: "框架",
      fields: [{ name: "说明", def: "随中间手机页切换本栏" }],
    }),
  };

  const LEASE_SUB = {
    billing: "订单计费记录",
    pay: "订单支付记录",
    replace_log: "更换记录",
    extend_log: "订单延期记录",
    contract: "订单合同",
    end: "结束订单",
    abnormal_end: "异常结束",
    replace_battery: "电池更换",
    park: "暂存订单",
    park_pickup: "暂存取电",
    gift_days: "赠送天数",
    confirm: "确认订单",
  };

  function resolveKey(state) {
    if (!state) return "login";
    const sc = state.screen;
    if (sc === "leaseSub") {
      const t = state.lease && state.lease.sub && state.lease.sub.type;
      return t ? "leaseSub:" + t : "leaseSub";
    }
    if (sc === "daypoolSub" || sc === "daypoolOrders") return "leaseOrders";
    if (sc === "sites") {
      const v = (state.sites && state.sites.view) || "list";
      return v === "list" ? "sites" : "sites:" + v;
    }
    if (sc === "cabinets") {
      const v = (state.ops && state.ops.cabView) || "list";
      if (v === "list") return "cabinets";
      if (v === "detail") {
        return "cabinets:detail:" + ((state.ops && state.ops.cabDetailTab) || "cabinet");
      }
      return "cabinets:" + v;
    }
    if (sc === "bizStats") {
      return "bizStats:" + ((state.ops && state.ops.bizTab) || "charts");
    }
    if (sc === "userList") return "userList";
    if (sc === "todos") {
      if (state.todos && state.todos.view === "detail" && state.todos.type) {
        return "todos:" + state.todos.type;
      }
      return "todos";
    }
    if (sc === "alerts") {
      return state.alerts && state.alerts.view === "detail" ? "alerts:detail" : "alerts";
    }
    if (sc === "todosHub") return "todosHub";
    if (sc === "financeAccount") {
      const v = (state.finance && state.finance.view) || "home";
      if (v === "apply") return "financeAccount:apply";
      if (v === "detail") return "financeAccount:detail";
      return "financeAccount";
    }
    return sc || "login";
  }

  function getSpec(state) {
    const key = resolveKey(state);
    if (SPECS[key]) return Object.assign({ key: key }, SPECS[key]);
    if (key.indexOf("leaseSub:") === 0) {
      const type = key.slice(9);
      const title = LEASE_SUB[type] || "换电订单 · 次页";
      return Object.assign({ key: key }, SPECS.leaseSub, { title: title });
    }
    return Object.assign({ key: key }, SPECS._fallback, { title: key });
  }

  global.OperatorAppPageSpecs = { SPECS, resolveKey, getSpec };
})(window);
