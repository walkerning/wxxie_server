var _ = require("lodash");
var bookshelfInst = require("./base");
var Promise = require("bluebird");
var errors = require("../errors");

var User = bookshelfInst.Model.extend({
  tableName: "users",

  defaults: {
    quota: 5
  },

  tasks: function() {
    return this.hasMany("Task");
  },

  permissions: function() {
    return this.belongsToMany("Permission");
  },


  getPermissions: function getPermissions() {
    return this.related("permissions").toJSON();
  },

  getPermissionNames: function getPermissionNames() {
    return this.related("permissions").toAttrList("name");
  },

  getTask: function(task_id) {
    return this.related("tasks")
      .query({ where: { "id": task_id } })
      .fetchOne()
      .then(function(c) {
        if (c == null) {
          return Promise.reject(new errors.NotFoundError());
        }
        return c;
      });
  },

  permittedUpdateAttributes: function permittedUpdateAttributes(contextUser) {
    var perms = contextUser.getPermissionNames();
    var fields = _.difference(this.permittedAttributes(), this.autoAttributes());
    if (_.includes(perms, "user")) {
      // with user management permission
      return fields;
    } else if (contextUser.get("id") == this.get("id")) {
      // contextUser == this
      return _.difference(fields, ["quota"])
    }
    return [];
  }

}, {
  getTaskAndUser: function(user_id, task_id) {
    return this.getById(user_id, {
      fetchOptions: {
        withRelated: ["tasks"]
      }
    })
      .then((user) => {
        return user.getTask(task_id)
        .then((t) => {
          return [user, t];
        });
      });
  }
});

var Users = bookshelfInst.Collection.extend({
  model: User

}, {});


module.exports = {
  User: bookshelfInst.model("User", User),
  Users: bookshelfInst.collection("Users", Users)
}
