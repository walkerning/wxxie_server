#!/usr/bin/env node

var fs = require("fs");
var util = require("util");
var yaml = require("js-yaml")
var amqp = require("amqplib/callback_api");
var models = require("../src/models");
models.init();

var cfg = yaml.safeLoad(fs.readFileSync(process.argv[2]));
// **TODO**: move this to a config file too
uri = util.format("amqp://%s:%s@%s:%d/", cfg["user"], cfg["pass"], cfg["host"], cfg["port"]);
amqp.connect(uri, function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = cfg["queue_name"];
    
    ch.assertQueue(q, cfg["queue_cfg"]);
    ch.prefetch(cfg["queue_limit"]);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      var res = JSON.parse(msg.content.toString());
      console.log(" [x] Received", res);
      ch.ack(msg);
      models.User.getTaskAndUser(res["user_id"], res["task_id"]).then((r) => {
        var [u, t] = r;
        t.update(res, null, true)
          .then(() => {
            console.log("update info for user %d task %d", res["user_id"], res["task_id"])
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }, {noAck: false});
  });
});
