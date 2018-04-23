var winston = require("winston");
var logConfig = require("./config").log;
var path = require("path");
var _ = require("lodash");

var transports = _.concat(_.map([] || logConfig.transportsCfg, function createTransport(cfg) {
  if (logConfig["logDir"] != undefined) {
    cfg.filename = path.join(logConfig["logDir"], cfg.filename);
  }
  return new (winston, transports.File)(cfg);
}), new (winston.transports.Console)());

var logger = new (winston.Logger)({
  transports: transports
});

module.exports = logger;
// A psudo stream for morgan logging middleware
module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};
