const _session = require('wafer-node-session');
const RedisStore = require('connect-redis')(_session);
const redis = require("redis").createClient();

var models = require("../models");
var errors = require("../errors");

const waferMiddleware = _session({
    appId: process.env.WXXIE_APP_ID,
    appSecret: process.env.WXXIE_APP_SECRET,
    loginPath: "/login_wechat_code",
    store: new RedisStore({ host: "localhost", port: 6379, client: redis })
});

function onAuth(req, res, next) {
  waferMiddleware(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    if (req.session === undefined) {
      next(new errors.UnauthorizedError());
    } else {
      return models.User.forge({
        openId: req.session.userInfo.openId
      })
        .fetch({
          withRelated: ["permissions"]
        })
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
  });
}

module.exports = {
  onAuth
}
