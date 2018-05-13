var consts = require("../consts");
var errors = require("../errors");
var auth = require("../auth");
var checkRuleConsistent = require("../utils").checkRuleConsistent;

const DEFAULT_LOGIN_TYPE = "userpass";
const supported_login_types = {
  userpass: {
    module: require("./userpass"),
    permission: [["login_userpass"]]
  }
};

function _getHeaderParam(req, name) {
  return req.headers[name.toLowerCase()];
}

function _checkLoginPerm(login_type, user) {
  var cfg = supported_login_types[login_type.toLowerCase()];
  if (!cfg) {
    return false;
  }
  const permNames = user.getPermissionNames();
  return checkRuleConsistent(cfg["permission"]||[[]], permNames);
}

function login(req, res, next) {
  console.log(req.headers);
  const login_type = _getHeaderParam(req, consts.WX_XIE_HEADER_LOGIN) || DEFAULT_LOGIN_TYPE;
  const auth_type = _getHeaderParam(req, consts.WX_XIE_HEADER_AUTH);
  if (!login_type) {
    next(new errors.BadRequestError({
      message: `请求头里没有找到 ${consts.WX_XIE_HEADER_LOGIN}`
    }))
    return
  }
  if (!auth_type) {
    next(new errors.BadRequestError({
      message: `请求头里没有找到 ${consts.WX_XIE_HEADER_AUTH}`
    }))
    return
  }
  const login_cfg = supported_login_types[login_type.toLowerCase()];
  if (!login_cfg) {
    next(new errors.UnauthorizedError({
      message: `未知登录方式 ${login_type}`
    }));
  }
  const module = login_cfg["module"];
  return module.getUser(req)
    .then((user) => {
      if (_checkLoginPerm(login_type, user)) {
        if (auth._checkAuthPerm(auth_type, user)) {
          return user;
        } else {
          return Promise.reject(new errors.UnauthorizedError({
            message: `此用户不支持 ${auth_type} 认证方式`
          }));
        }
      } else {
        return Promise.reject(new errors.UnauthorizedError({
          message: `此用户不支持 ${login_type} 登录方式`
        }));
      }
    })
    .then((user) => {
      return module.authUser(req, user)
        .then((u) => { req.user = u; });
    })
    .then((user) => {
      return auth.onLogin(req, res);
    })
    .then(() => {
      next();
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  login
}
