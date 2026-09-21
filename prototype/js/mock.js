/**
 * 运营商 APP · Mock 账号 / 消息
 */
(function (global) {
  const DEMO_ACCOUNTS = [
    {
      phone: "13800000005",
      password: "123456",
      name: "演示员",
      operatorName: "锂电快换",
      identities: [
        { role: "admin", roleLabel: "管理员", dataScope: "all", dataScopeLabel: "全网" },
        {
          role: "staff",
          roleLabel: "员工",
          dataScope: "sites",
          dataScopeLabel: "指定站点 · 浦东骑手驿站",
          siteIds: ["ST-SH-01"],
        },
      ],
    },
    {
      phone: "13900000001",
      password: "123456",
      name: "站点运维小王",
      operatorName: "锂电快换",
      identities: [
        {
          role: "staff",
          roleLabel: "员工",
          dataScope: "sites",
          dataScopeLabel: "指定站点 · 世博换电服务点",
          siteIds: ["ST-SH-02"],
        },
      ],
    },
  ];

  const SYSTEM_MESSAGES = [
    {
      id: "msg-1",
      type: "system",
      title: "欢迎使用锂电快换",
      summary: "欢迎使用锂电快换运营商工作台。",
      body: "本原型交付登录、工作台、待办（含警告）与已上线业务模块。宫格仅展示已开放能力。",
      time: "今天 09:12",
      read: false,
    },
    {
      id: "msg-2",
      type: "system",
      title: "框架更新说明",
      summary: "底栏固定三 Tab，模块通过注册表插拔。",
      body: "后续业务模块接入时：修改 modules.js 注册表并增加页面即可，无需改底栏结构。",
      time: "昨天 18:40",
      read: true,
    },
  ];

  function findAccount(phone, password) {
    return (
      DEMO_ACCOUNTS.find((a) => a.phone === phone && a.password === password) ||
      null
    );
  }

  function findAccountByPhone(phone) {
    return DEMO_ACCOUNTS.find((a) => a.phone === phone) || null;
  }

  global.OperatorAppMock = {
    DEMO_ACCOUNTS,
    SYSTEM_MESSAGES,
    findAccount,
    findAccountByPhone,
  };
})(window);
