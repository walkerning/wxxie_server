var _ = require("lodash");

module.exports = function setPageLimit(limit = 10, maxLimit = 100) {
  return function(req, res, next) {
    var query = req.query;
    // default offset is `0`; default limit is `limit`
    var offset = _.isInteger(query["offset"]) ? Math.max(query["offset"], 0) : 0;
    var limit = _.isInteger(query["limit"]) ? Math.max(Max.min(query["limit"], maxLimit), 0) : limit;
    req.query.offset = offset;
    req.query.limit = limit;
    next();
  }
}
