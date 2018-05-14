var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
var Promise = require("bluebird");

var errors = require("../errors");
var config = require("../config").jwt;
var models = require("../models");

function createToken(user) {
  return jwt.sign({
    id: user.id,
  }, config.secret, {
    expiresIn: config.expiresIn,
    issuer: config.issuer
  });
}

function onLogin(req, res) {
  var user = req.user;
  res.json({
    user: user.toClientJSON(),
    token: createToken(user)
  });
}

const extractMiddleware = expressJwt(config);

function onAuth(req, res, next) {
  extractMiddleware(req, res, (err) => {
    if (err) {
      next(err);
    } else {
      if (req.auth === undefined) { // extract auth info into req.auth fail
        next(new errors.UnauthorizedError());
      } else {
        models.User.forge({
          id: req.auth.id
        })
          .fetch({ withRelated: ["permissions"] })
          .then((user) => {
            if (!user) {
              next(new errors.UnauthorizedError());
            } else {
              req.user = user;
              next();
            }
          })
          .catch((err) => {
            next(new errors.InternalServerError());
          });
      }
    }
  })
}

module.exports = {
  onLogin,
  onAuth
};
