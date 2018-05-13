var _ = require("lodash");
const path = require("path");
const src_base_dir = path.dirname(__dirname);

function getAbsPath(_path) { // get abs path from path relative to src_base_dir
  return path.join(src_base_dir, _path);
}

function checkRuleConsistent(rules, permNames) {
  return _.some(rules, function(rule, ind) {
    var diffs = _.difference(rule, permNames);
    return diffs.length === 0;
  });
}

module.exports = {
  getAbsPath,
  checkRuleConsistent
}
