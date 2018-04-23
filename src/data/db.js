var knex = require("knex");
var config = require("../config");

var dbConfig = config["database"];
dbConfig.connection.timezone = dbConfig.connection.timezone || "UTC";
dbConfig.connection.charset = dbConfig.connection.charset || "utf8mb4";

var knexInst = knex(dbConfig);

module.exports = knexInst;
