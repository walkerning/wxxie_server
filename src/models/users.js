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
  }
}, {});

var Users = bookshelfInst.Collection.extend({
  model: User

}, {});


module.exports = {
  User: bookshelfInst.model("User", User),
  Users: bookshelfInst.collection("Users", Users)
}
