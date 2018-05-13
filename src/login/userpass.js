var _ = require("lodash");
var Promise = require("bluebird");
var errors = require("../errors");
var models = require("../models");

function getUserByUserName(req) {
  if (req.body.userName === undefined || req.body.userName === null || !req.body.password) {
    return Promise.reject(new errors.BadRequestError({
      message: "`userName`/`password` field is required."
    }));
  }
  return models.User.forge({
    userName: req.body.userName
  })
    .fetch({ withRelated: ["permissions"] })
    .then(function(user) {
      if (!user) {
        return Promise.reject(new errors.UnauthorizedError({
          message: "User does not exists."
        }));
      } else {
        return user;
      }
    })
    .catch(function(err) {
      return Promise.reject(new errors.InternalServerError(
        {
          message: err
        }
      ));
    });
}

function authUserPass(req, user) {
  return user.isPasswordCorrect(req.body.password, user.get("password"))
    .then(() => {
      return user;
    })
    .catch((err) => {
      return Promise.reject(new errors.UnauthorizedError({
        message: err.message
      }));
    });
}

module.exports = {
  getUser: getUserByUserName,
  authUser: authUserPass
};
