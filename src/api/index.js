var express = require("express");
var errors = require("../errors");
var permit = require("../middlewares/permission");
// api methods
var users = require("./users");
var tasks = require("./tasks");

var apiRouter = express.Router();

function catchError(apiFunc) {
  return function(req, res, next) {
    try {
      return apiFunc(req, res, next)
        .catch(function(err) {
          next(err);
        });
    } catch ( err ) {
      next(new errors.InternalServerError({
        stack: err
      }));
    }
  };
}

apiRouter.get("/users/me", catchError(users.infoMe));

apiRouter.get("/users/:userId/tasks", permit(["me"]), catchError(users.listTasks));

apiRouter.get("/users/:userId/tasks/:taskId", permit(["me"]), catchError(users.getTask));

apiRouter.post("/users/:userId/tasks", permit(["me"]), catchError(tasks.createTask));

apiRouter.put("/users/:userId/tasks/:taskId", permit(["me"]), catchError(tasks.updateTask));

apiRouter.put("/users/:userId/tasks/:taskId/run", permit(["me"]), catchError(tasks.runTask));

apiRouter.post("/users/:userId/tasks/:taskId/files", permit(["me"]), catchError(tasks.uploadTaskFile));

apiRouter.get("/users/:userId/tasks/:taskId/files/:fileType", permit(["me"]), catchError(tasks.downloadTaskFile));

// TODO: after task run, should we use admin API, or directly access the database and send notification... It seems using admin API will be a more scalable way, with well-centralized control... To realize admin page, permission system, must be introduced

module.exports = apiRouter;
