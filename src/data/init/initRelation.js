var _ = require("lodash");
var before = require("./before");
var Promise = require("bluebird");
var logging = require("../../logging");
var models = require("../../models");

models.Permission.fetchAll()
  .then(function(col) {
    return models.User.forge({
      id: 1
    })
      .fetch()
      .then(function(user) {
        return user.permissions()
          .attach(col.models);
      });
  })
  .then(function() {
    process.exit(0);
  })
  .catch(function(err) {
    logging.error(err);
    process.exit(1);
  });
