var _ = require("lodash");
var Promise = require("bluebird");
var bcrypt = require("bcryptjs");
var bcryptGenSalt = Promise.promisify(bcrypt.genSalt);
var bcryptHash = Promise.promisify(bcrypt.hash);
var bcryptCompare = Promise.promisify(bcrypt.compare);

var bookshelfInst = require("./base");
var errors = require("../errors");
var validationCfg = require("../config").validation;

// Validate the plain password.
function validatePassword(password) {
  // FIXME: Lack detailed information
  return validationCfg.passwordValidator.validate(password);
}

function generatePasswordHash(password) {
  return bcryptGenSalt().then(function(salt) {
    return bcryptHash(password, salt);
  });
}

var User = bookshelfInst.Model.extend({
  tableName: "users",

  defaults: {
    quota: 50
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
  },

  // For password authentication
  // A password checker that return a promise.
  isPasswordCorrect: function isPasswordCorrect(plainPass, hashedPass) {
    if (!plainPass || !hashedPass) {
      return Promise.reject(new errors.ValidationError({
        message: "Password required for operation."
      }));
    }

    return bcryptCompare(plainPass, hashedPass)
      .then(function(matched) {
        if (matched) {
          return;
        }
        return Promise.reject(new errors.ValidationError({
          message: "Password incorrect."
        }));
      });
  },

  onSaving: function(newPage, attrs, options) {
    bookshelfInst.Model.prototype.onSaving.apply(this, arguments);

    if (this.isNew()) {
      // if openId exists, userName not exists, set userName to openId
      console.log(this.get("userName"), this.get("openId"))
      if (!this.get("userName") && this.get("openId")) {
        this.set("userName", String(this.get("openId")));
      }
    }
    if (this.get("password") && (this.isNew() || this.hasChanged("password"))) {
      this.set("password", String(this.get("password")));
      if (!validatePassword(this.get("password"))) {
        return Promise.reject(new errors.ValidationError({
          message: "Illegal `password`."
        }));
      }
      return generatePasswordHash(this.get("password"))
        .then((hash) => {
          this.set("password", hash);
        });
    }
    return;
  }
}, {
  secretAttributes: function secretAttributes() {
    return ["password"];
  },

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
