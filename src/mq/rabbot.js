var rabbot = require("rabbot");
var fs = require("fs");
var config = require("../config").mq;

rabbot.log([
  { level: "warn", stream: process.stdout},
  { level: "debug", stream: fs.createWriteStream("/var/run/wxxie_server_mq.log"), objectMode: true }
]);

module.exports = rabbot.configure(config)
  .then(() => {
    rabbot.on("unreachable", function () {
      console.log("connection failure reached the limit!!!");
      // process.exit();
    })
    return rabbot;
  });
