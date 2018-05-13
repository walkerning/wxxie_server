// init the tables;
var _ = require("lodash");
var before = require("./before");
var Promise = require("bluebird");
var logging = require("../../logging");
var models = require("../../models");

var initData = {
  User: [
    {
      userName: "root"
      nickName: "rootNickName",
      password: "ASTARTPASSWORD",
      gender: 3,
      openId: "____afakeopenid____",
      email: "root@localhost.com",
      phone: "18888888888"
    }
  ],
  Permission: [
    {
      name: "login_userpass",
      description: "是否可用用户名密码登录"
    },
    {
      name: "auth_jwt",
      description: "是否可用JWT token认证"
    },
    {
      name: "user",
      description: "用户管理权限"
    },
    {
      name: "brand",
      description: "品牌/鞋型管理权限"
    },
    {
      name: "task",
      description: "任务管理权限"
    },
    {
      name: "permission",
      description: "权限管理权限"
    },
  ],
};

function initTables() {
  return Promise.mapSeries(_.keys(initData), function initDatum(dataName) {
    return Promise.mapSeries(initData[dataName], function initInfo(info) {
      return models[dataName].create(info, null)
        .then(function(item) {
          logging.info("Created " + dataName.toLowerCase() + ": "
                       + item.get("id") + " - " + item.get("name"));
        });
    })
      .then(function() {
        logging.info("Table " + dataName + " initialized!");
      });
  });
}

initTables().then(function() {
  logging.info("All tables initialized!");
  process.exit(0);
}).catch(function(error) {
  logging.error("Failure when initializing tables:", error);
  process.exit(1);
});
