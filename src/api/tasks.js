var _ = require("lodash");
var path = require("path");
var Promise = require("bluebird");
var shell = require("shelljs");
var fs = Promise.promisifyAll(require("fs"));
var multiparty = Promise.promisifyAll(require('multiparty'), {
  multiArgs: true
});

var models = require("../models");
var logging = require("../logging")
var errors = require("../errors");

function createTask(req, res, next) {
  return models.Task.create({
    user_id: req.params.userId,
    meta_tag: req.body["meta_tag"],
    state: "incomplete"
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
          // **TODO**: Put the task meta info into queue
          console.log("**TODO**: PUT the task into the queue!")
          var now = new Date();
          return task.update({"state": "waiting", "run_time": now}, req.user, true)
            .then((task) => {
              // **TODO**: PUT the task meta information
              res.status(200).json(task.toJSON());
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

            var fs_basename = process.env.FS_PIC_BASENAME;
            var fs_path = path.join(fs_basename, _.toString(task.get("user_id")), _.toString(task.get("id")));
            if (!fs.existsSync(fs_path)) {
              shell.mkdir("-p", fs_path);
            }
            // TODO: use a handler to do this check.
            if (!_.includes(["appear", "tag", "stitch", "pad", "side_tag", "seal"], type_name)) {
              return Promise.reject(new errors.ValidationError({ message: "'type' field should be in ['appear', 'tag', 'stitch', 'pad', 'side_tag', 'seal'] "}));
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

module.exports = {
  createTask: createTask,
  updateTask: updateTask,
  runTask: runTask,
  uploadTaskFile: uploadTaskFile
};
