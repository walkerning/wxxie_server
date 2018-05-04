var _ = require("lodash");
var path = require("path");
var Promise = require("bluebird");
let fs = Promise.promisifyAll(require('fs'));

var bookshelfInst = require("./base");
var schema = require("../data").schema;
var errors = require("../errors");


var Task = bookshelfInst.Model.extend({
  tableName: "tasks",
  
  user: function() {
    return this.beglongsTo("User", "user_id");
  },

  permittedAttributes: function permittedAttribute() {
    return _.difference(_.keys(schema[this.tableName]), "user_id");
  },

  permittedUpdateAttributes: function permittedUpdateAttributes(contextUser) {
    var perms = contextUser.getPermissionNames();
    var fields = _.difference(this.permittedAttributes(), this.autoAttributes());
    if (_.includes(perms, "task")) {
      // with user management permission
      return fields;
    } else if (contextUser.get("id") == this.get("user_id")) {
      // contextUser == this
      return _.difference(fields, ["answer", "state", "run_time", "start_time", "finish_time", "log"]);
    }
    return [];
  },

  imageDir: function imageDir() {
    var fs_basename = process.env.FS_PIC_BASENAME;
    return path.join(fs_basename, _.toString(this.get("user_id")), _.toString(this.get("id")));
  },

  validateForRun: function validateForRun() {
    if (this.get("state") !== "incomplete") {
      // TODO: multi-language error information?
      return Promise.reject(new errors.ValidationError({ message: "Cannot run this task, because it has been already arranged for running or has finished." }));
    }
    if (!this.get("shoe_model")) {
      return Promise.reject(new errors.ValidationError({ message: "Cannot run this task, because 'shoe_model' field is needed." }));
    }
    // check for filesystem existence. 
    // TODO: different check for different meta_tag or shoe model maybe. Move this check utility to meta handler.
    var fs_path = this.imageDir();
    // return Promise.map(["appear", "tag", "stitch", "pad", "side_tag", "seal"],
    return Promise.map(["appear", "tag"],
                       (n) => {
                         // **TODO**: only support .png now..
                         return fs.statAsync(path.join(fs_path, n + ".png"));
                       })
      .catch((err) => {
        return Promise.reject(new errors.ValidationError({ message: "Cannot run this task, because not all image files are uploaded." }));
      });
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
