var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

function listPermissions(req, res, next) {
    //console.log("prelimit:"+req.query.limit);
    return models.Permissions.getByQuery(req.query)
    .then((col) => {
      res.status(200).json(col.toClientJSON());
    });
}

function listPermissionUsers(req, res, next) {
    return models.Permission.forge({name: req.params.permissionName}).fetch()
	.then((p) => {
	    return p.listUsers()
		.then((c) => {
		    res.status(200).json(c.toClientJSON());
		});
	})
}

function addPermissionUser(req, res, next) {
    return models.Permission.forge({name: req.params.permissionName}).fetch()
        .then((p) => {
	    return p.addUser(req.body.userId)
	        .then((c) => {
		    res.status(200).json(c.toClientJSON());
		});
	})
}

function deletePermissionUser(req, res, next) {
    return models.Permission.forge({name: req.params.permissionName}).fetch()
        .then((p) => {
	    return p.deleteUser(req.params.userId)
	        .then((c) => {
		    res.status(200).json(c.toClientJSON());
		});
	});
}

module.exports = {
  listPermissions,
  listPermissionUsers,
  addPermissionUser,
  deletePermissionUser,
};
