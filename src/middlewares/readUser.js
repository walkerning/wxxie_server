var models = require("../models");
var errors = require("../errors");

module.exports = function readUser(req, res, next) {
  if (req.session === undefined) {
    next(new errors.UnauthorizedError());
  } else {
    return models.User.forge({
      openId: req.session.userInfo.openId
    })
      .fetch()
      .then(function loadContextUser(user) {
        if (!user) {
          // Create user
          return models.User.create(req.session.userInfo)
            .then(function(user) {
              req.user = user;
              return next();
            })
            .catch(function(err) {
              return next(err);
            });
        } else {
          req.user = user;
          return next();
        }
      })
      .catch(function(err) {
        return next(new errors.InternalServerError());
      });
  }
};
