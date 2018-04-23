var express = require("express");
var errors = require("../errors");
var permit = require("../middlewares/permission");
// api methods
var users = require("./users");

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

module.exports = apiRouter;
