var _ = require("lodash");
var path = require("path");
var Promise = require("bluebird");
var shell = require("shelljs");
var sanitize = require("sanitize-filename");
var fs = Promise.promisifyAll(require("fs"));
var multiparty = Promise.promisifyAll(require('multiparty'), {
  multiArgs: true
});

var models = require("../models");
var logging = require("../logging")
var errors = require("../errors");
var rabbot_prom = require("../mq/rabbot");
var mq_cfg = require("../config").mq;

function createTask(req, res, next) {
  return models.User.getById(req.params.userId, {
    fetchOptions: {
      withRelated: ["tasks"]
    }
  })
    .then(function(user) {
      var quota = user.get("quota");
      var now_num = user.related("tasks").toJSON().length;
      if (now_num >= quota) {
        return Promise.reject(new errors.ValidationError({ message: `Quota exceed, you can only create ${quota} (now ${now_num})` }))
      }
    })
    .then(() => {
      return models.Task.create({
        user_id: req.params.userId,
        meta_tag: req.body["meta_tag"],
        state: "incomplete",
        task_name: "Task untitled" // default task name
      });
    })
    .then(function(task) {
      res.status(201).json(task.toJSON());
    });
}

function updateTask(req, res, next) {
  return models.User.getTaskAndUser(req.params.userId, req.params.taskId)
    .then((r) => {
      var [user, task] = r;
      if (task.get("state") !== "incomplete") {
        // TODO: multi-language?
        return Promise.reject(new errors.ValidationError({ message: "Cannot modify this task, because it has been already arranged for running or has finished." }));
      }
      return task.update(req.body, req.user)
        .then(() => {
          return task.fetch()
            .then(() => {
              res.status(200).json(task.toJSON());
            });
        });
    })
}

function runTask(req, res, next) {
  return models.User.getTaskAndUser(req.params.userId, req.params.taskId)
    .then((r) => {
      var [user, task] = r;
      return task.validateForRun()
        .then(() => {
          console.log("PUT the task into the queue!")
          var start = Promise.resolve(null);
          if (req.body.form_id) {
            start = task.update({ form_id: req.body.form_id }, req.user, true)
          }
          start = start.then(() => {
            return rabbot_prom.then((rabbot) => {
              return rabbot.publish(mq_cfg["exchanges"][0]["name"], {
                type: "wxxie.detectMessage",
                contentType: "application/json",
                routingKey: "",
                body: {
                  user_id: user.get("id"),
                  task_id: task.get("id"),
                  meta_tag: task.get("meta_tag"),
                  shoe_model: task.get("shoe_model"),
                  imgdir: task.imageDir()
                }
                // **TODO**: gracefully handle timeout
                // expiresAfter: 10000,
                // timeout: 10000
              });
            });
          });
          return start.then((mq_r) => {
            var now = new Date();
            return task.update({"state": "waiting", "run_time": now}, req.user, true)
              .then((task) => {
                // **TODO**: PUT the task meta information
                res.status(200).json(task.toJSON());
              });
          });
        });
    })
}

function uploadTaskFile(req, res, next) {
  return models.User.getTaskAndUser(req.params.userId, req.params.taskId)
    .then((r) => {
      var [user, task] = r;
      var form = new multiparty.Form();
      return form.parseAsync(req)
        .catch((err) => {
          // FIXME: validation error or internal server error?
          logging.error(err);
          return Promise.reject(new errors.BadRequestError({
            message: "File upload request fail.",
            stack: err
          }));
        })
          .then((arr) => {
            var [fields, {file: [files]}] = arr;
            var type_name = fields["type"][0];
            console.log("fields: ", fields, "files: ", files, "typename: ", type_name)

            var fs_path = task.imageDir();
            if (!fs.existsSync(fs_path)) {
              shell.mkdir("-p", fs_path);
            }
            // TODO: use a handler to do this check.
            if (!_.includes(["appear", "tag", "stitch", "pad", "side_tag", "seal", "tongue"], type_name)) {
              return Promise.reject(new errors.ValidationError({ message: "'type' field should be in ['appear', 'tag', 'stitch', 'pad', 'side_tag', 'seal', 'tongue'] "}));
            }
            // TODO: filesystem error?
            return fs.renameAsync(files["path"], path.join(fs_path, type_name + ".png"))
              .then(() => {
                res.status(200).json();
              })
              .catch((err) => {
                // FIXME: validation error or internal server error?
                logging.error(err);
                return Promise.reject(new errors.InternalServerError({
                  message: "File upload request fail.",
                  stack: err
                }));
              });
          });
    });
}

function downloadTaskFile(req, res, next) {
  return models.User.getTaskAndUser(req.params.userId, req.params.taskId)
    .then((r) => {
      var [user, task] = r;
      var fs_basename = process.env.FS_PIC_BASENAME;
      var type_name = req.params.fileType;
      // **TODO**: this meta information should be loaded from a config file
      if (!_.includes(["appear", "tag", "stitch", "pad", "side_tag", "seal", "tongue"], type_name)) {
        return Promise.reject(new errors.ValidationError({ message: "'type' field should be in ['appear', 'tag', 'stitch', 'pad', 'side_tag', 'seal', 'tongue'] "}));
      }
      var fname = sanitize(type_name + ".png");
      var fs_path = path.join(fs_basename, _.toString(task.get("user_id")), _.toString(task.get("id")), fname);
      console.log(fs_path)
      return fs.statAsync(fs_path)
        .then(() => {
          return new Promise((resolve, reject) => {
            res.download(fs_path, fname, (err) => {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          });
        })
        .catch((err) => {
          res.status(204).end()
        });
    });
}

module.exports = {
  createTask: createTask,
  updateTask: updateTask,
  runTask: runTask,
  uploadTaskFile: uploadTaskFile,
  downloadTaskFile: downloadTaskFile
};
