var app = require("./app");
var config = require("./config").server;
var logging = require("./logging");


app.listen(config.port, config.host, undefined, function() {
  logging.info("Starting server at " + config.port);
});

