const _session = require('wafer-node-session');
const RedisStore = require('connect-redis')(_session);
const redis = require("redis").createClient();

module.exports = _session({
    appId: process.env.WXXIE_APP_ID,
    appSecret: process.env.WXXIE_APP_SECRET,
    loginPath: "/auth",
    store: new RedisStore({ host: "localhost", port: 6379, client: redis })
});
