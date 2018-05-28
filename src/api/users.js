var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

function infoMe(req, res, next) {
  return Promise.resolve(null)
    .then(() => {
      res.status(200).json(req.user.toClientJSON());
    });
}

function infoUser(req, res, next) {
  return models.User.getById(req.params.userId)
    .then(function(user) {
      res.status(200).json(user.toClientJSON());
    });
}

function addUser(req, res, next) {
  return models.User.create(req.body)
    .then((user) => {
      res.status(200).json(user.toClientJSON());
    })
    .catch((err) => {
      return next(err);
    });
}

function updateUser(req, res, next){
    return models.User.getById(req.params.userId)
	.then((r) => {
	    var user = r;
	    return user.update(req.body, req.user)
		.then(() => {
		    return user.fetch()
			.then(() => {
			    res.status(200).json(user.toClientJSON());
			});
		});
	});
}

function listUsers(req, res, next) {
  return models.Users.getByQuery(req.query)
    .then((col) => {
      res.status(200).json(col.toClientJSON());
    });
}

function listTasks(req, res, next) {
  return models.User.getById(req.params.userId, {
    fetchOptions: {
      withRelated: ["tasks"]
    }
  })
    .then(function(user) {
      res.status(200).json(user.related("tasks").toClientJSON());
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
          res.status(200).json(task.toClientJSON());
        });
    });
}


module.exports = {
    infoMe,
    infoUser,
    addUser,
    updateUser,
    listTasks,
    getTask,
    listUsers
};
