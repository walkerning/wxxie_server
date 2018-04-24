var _ = require("lodash");
var Promise = require("bluebird");
var bookshelfInst = require("./base");
var errors = require("../errors");
var User = require("./users").User;


var Permission = bookshelfInst.Model.extend({
  tableName: "permissions",

  users: function users() {
    return this.belongsToMany("User");
  },

  // Operation methods used by API.
  listUsers: function listUsers() {
    return this.fetch({
      withRelated: ["users"]
    })
      .then(function(perm) {
        return perm.related("users");
      });
  },

  addUser: function addUser(userId) {
    var self = this;
    var userId = _.toInteger(userId);
    return this.listUsers()
      .then(function(col) {
        if (_.includes(col.toAttrList("id"), userId)) {
          return Promise.reject(new errors.ValidationError({
            message: "This user already have the permission."
          }));
        } else {
          return User.getById(userId, {
            noreject: true
          })
            .then(function(user) {
              if (!user) {
                return Promise.reject(new errors.ValidationError({
                  message: "This user does not exists."
                }));
              } else {
                return self.users().attach(user);
              }
            });
        }
      });
  },

  deleteUser: function deleteUser(userId) {
    return this.users().detach(userId);
  }
});

var Permissions = bookshelfInst.Collection.extend({
  model: Permission
}, {
  queriableAttributes: function queriableAttributes() {
    return ["id",
      "name"];
  },
});

module.exports = {
  Permission: bookshelfInst.model("Permission", Permission),
  Permissions: bookshelfInst.collection("Permissions", Permissions)
};
