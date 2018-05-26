var l = require("lodash");

var modelNames = [
  "users",
  "tasks",
    "permissions",
    "brands"
];

exports = module.exports;

function init() {
  modelNames.forEach(function(name) {
    l.extend(exports, require("./" + name));
  });
}

module.exports.init = init;
