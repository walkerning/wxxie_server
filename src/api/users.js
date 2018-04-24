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

function infoUser(req, res, next) {
  return models.User.getById(req.params.userId)
    .then(function(user) {
      res.status(200).json(user.toJSON());
    });
}

function listTasks(req, res, next) {
  return models.User.getById(req.params.userId, {
    fetchOptions: {
      withRelated: ["tasks"]
    }
  })
    .then(function(user) {
      res.status(200).json(user.related("tasks").toJSON());
    });
}

function getTask(req, res, next) {
  return models.User.getById(req.params.userId, {
    fetchOptions: {
      withRelated: ["tasks"]
    }
  })
    .then(function(user) {
      return user.getTask(req.params.taskId)
        .then((task) => { 
          res.status(200).json(task.toJSON());
        });
    });
}


module.exports = {
  infoMe: infoMe,
  infoUser: infoUser,
  listTasks: listTasks,
  getTask: getTask
};
