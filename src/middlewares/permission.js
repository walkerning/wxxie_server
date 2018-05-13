var errors = require("../errors");
var checkRuleConsistent = require("../utils").checkRuleConsistent;

module.exports = function permit(...rules) {
  return function(req, res, next) {
    var permNames = req.user.getPermissionNames();
    if (req.user.get("id") == req.params["userId"]) {
      permNames.push("me");
    }
    // judge if current `req.user` statsify all items in some rule of the rules
    if (checkRuleConsistent(rules, permNames)) {
      next();
    } else {
      next(new errors.ForbiddenError());
    }
  };
};
