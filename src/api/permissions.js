var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

function listPermissions(req, res, next) {
 return models.Permissions.getByQuery(req.query)
    .then((col) => {
      res.status(200).json(col.toClientJSON());
    });
}

function listPermissionUsers(req, res, next) {
}

function addPermissionUser(req, res, next) {
}

function deletePermissionUser(req, res, next) {
}

module.exports = {
  listPermissions,
  listPermissionUsers,
  addPermissionUser,
  deletePermissionUser,
};
