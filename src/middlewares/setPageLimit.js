module.exports = function setPageLimit(dlimit = 10, maxLimit = 100) {
    return function(req, res, next) {
	var query = req.query;
	// default offset is `0`; default limit is `limit`
	var query_offset = parseInt(query["offset"]);
	var offset = isNaN(query_offset) ? 0 : Math.max(query_offset, 0);

	var query_limit = parseInt(query["limit"]);
	var limit = isNaN(query_limit) ? dlimit : Math.max(Math.min(query_limit, maxLimit), 0);
	req.query.offset = offset;
	req.query.limit = limit;
	next();
    }
}
