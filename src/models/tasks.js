var _ = require("lodash");
var bookshelfInst = require("./base");
var Promise = require("bluebird");
var errors = require("../errors");

var Task = bookshelfInst.Model.extend({
  tableName: "tasks",
  
  user: function() {
    return this.beglongsTo("User", "user_id");
  }
}, {})

var Tasks = bookshelfInst.Collection.extend({
  model: Task

}, {
  queriableAttributes: function queriableAttributes() {
    return [];
  }
});

module.exports = {
  Task: bookshelfInst.model("Task", Task),
  Tasks: bookshelfInst.collection("Tasks", Tasks)
}
