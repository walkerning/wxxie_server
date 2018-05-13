var _ = require("lodash");

var auth_cfg = require("../config").api.auth;
var consts = require("../consts");
var errors = require("../errors");
var checkRuleConsistent = require("../utils").checkRuleConsistent;

const DEFAULT_AUTH_TYPE = "wechat_code";

const supported_auth_types = _.mapValues(auth_cfg, (cfg) => {
  if (cfg["permission"] === undefined) {
    cfg["permission"] = [[]];
  }
  cfg["module"] = require(cfg["module"]);
  return cfg;
});

function _getHeaderParam(req, name) {
  return req.headers[name.toLowerCase()];
}

function _checkAuthPerm(auth_type, user) {
  var cfg = supported_auth_types[auth_type.toLowerCase()];
  if (!cfg) {
    return false;
  }
  const permNames = user.getPermissionNames();
  return checkRuleConsistent(cfg["permission"], permNames);
}

function onLogin(req, res) {
  const auth_type = _getHeaderParam(req, consts.WX_XIE_HEADER_AUTH) || DEFAULT_AUTH_TYPE;
  const auth_cfg = supported_auth_types[auth_type.toLowerCase()];
  if (!auth_cfg) {
    next(new errors.UnauthorizedError({
      message: `未知认证方式 ${auth_type}`
    }));
    return;
  }
  const module = auth_cfg["module"];
  return module.onLogin(req, res);
}

function auth(req, res, next) {
  const auth_type = _getHeaderParam(req, consts.WX_XIE_HEADER_AUTH) || DEFAULT_AUTH_TYPE;
  const auth_cfg = supported_auth_types[auth_type.toLowerCase()];
  if (!auth_cfg) {
    next(new errors.UnauthorizedError({
      message: `未知认证方式 ${auth_type}`
    }));
    return;
  }
  const module = auth_cfg["module"];
  module.onAuth(req, res, (err) => {
    if (err) {
      next(err);
    } else {
      if (!_checkAuthPerm(auth_type, req.user)) {
        next(new errors.UnauthorizedError({
          message: `此用户不支持 ${auth_type} 认证方式`
        }));
      } else {
        next();
      }
    }
  });
}

auth.unless = function(paths) {
  return function authUnless(req, res, next) {
    if (_.includes(paths, req.path)) {
      return next();
    } else {
      return auth(req, res, next);
    }
  };
};

module.exports = {
  auth,
  onLogin,
  _checkAuthPerm
}
