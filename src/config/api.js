const path = require("path");
const src_base_dir = path.dirname(__dirname);

const _abs_path = function(_path) {
  return path.join(src_base_dir, _path);
}

var authCfg = null;

if (process.env.WXXIE_NOWECHAT) {
  authCfg = {
    jwt: {
      module: _abs_path("auth/jwt"),
      permission: [["login_userpass"]]
    }
  };
} else {
  authCfg = {
    jwt: {
      module: _abs_path("auth/jwt"),
      permission: [["login_userpass"]]
    },
    wechat_code: {
      module: _abs_path("auth/wechat_code")
    }
  };
}

module.exports = {
  pagination: {
    users_tasks: [10, 30],
    tasks: [20, 100]
  },
  auth: authCfg
};
