var _ = require("lodash");
var errors = require("../errors");

module.exports = function permit(...rules) {
  return function(req, res, next) {
    // **FIXME**: For now, the permission system is not implemented...
    // var permNames = req.user.getPermissionNames();
    var permNames = [];
    if (req.user.get("id") == req.params["userId"]) {
      permNames.push("me");
    }
    // judge if current `req.user` statsify all items in some rule of the rules
    if (_.some(rules, function(rule, ind) {
        var diffs = _.difference(rule, permNames);
        return diffs.length === 0;
      })) {
      next();
    } else {
      next(new errors.ForbiddenError());
    }
  };
};
