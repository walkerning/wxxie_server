// init the tables;
var _ = require("lodash");
var before = require("./before");
var Promise = require("bluebird");
var logging = require("../../logging");
var models = require("../../models");

var initData = {
  User: [
    {
      name: "root",
      nickName: "球球君A",
      gender: 1,
      openId: "____afakeopenid____",
      email: "root@localhost.com",
      phone: "18888888888"
    }
  ],
  Permission: [
    {
      name: "run",
      description: "Create and run tasks."
    },
    {
      name: "user",
      description: "User management permission."
    },
    {
      name: "task",
      description: "Task management permission."
    },
    {
      name: "permission",
      description: "Permission management permission."
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
