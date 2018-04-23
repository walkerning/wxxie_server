var Promise = require("bluebird");
var argv = require("minimist")(process.argv.slice(2));
var logging = require("../logging");
var commands = require("./commands");
var schema = require("./schema");
var _ = require("lodash");

var tableNames = schema["tableNames"];

function dropTables(names) {
  return Promise.mapSeries(_.reverse(_.clone(names)), function dropTable(tableName) {
    return commands.dropTable(tableName);
  });
}

function createTables(names) {
  return Promise.mapSeries(names, function createTable(tableName) {
    logging.info("Creating table: " + tableName);
    return commands.createTable(tableName);
  });
}

var start = Promise.resolve(null);
var names = tableNames;
if (argv.names) {
  names = argv.names.split(",");
}
if (argv.reinit) {
  start = dropTables(names)
    .then(function() {
      logging.info("All tables droped");
    })
    .catch(function(error) {
      logging.error("Failure when dropping tables: ", error);
      process.exit(1);
    });
}

start.then(function() {
  return createTables(names).then(function() {
    logging.info("All tables created!");
    process.exit(0);
  })
    .catch(function(error) {
      logging.error("Failure when creating tables: ", error);
      process.exit(1);
    });
});

