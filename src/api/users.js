var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

function infoMe(req, res, next) {
  return Promise.resolve(null)
    .then(() => {
      res.status(200).json(req.user.toJSON());
    });
}

function listTasks(req, res, next) {
  return req.user.fetch({ withRelated: ["tasks"] })
    .then(function(user) {
      res.status(200).json(user.related("tasks").toJSON());
    });
}

function getTask(req, res, next) {
  return req.user.fetch({ withRelated: ["tasks"] })
    .then(function(user) {
      return user.related("tasks")
        .query({ where: { "id": req.params.taskId } })
        .fetch()
        .then(function(c) {
          var cjson = c.toJSON();
          if (cjson.length == 0) {
            return Promise.reject(new errors.NotFoundError());
          }
          res.status(200).json(cjson[0]);
        });
    });
}

module.exports = {
  infoMe: infoMe,
  listTasks: listTasks,
  getTask: getTask
};
