var knexInst = require("./db");
var schema = require("./schema");
var _ = require("lodash");

function dropTable(tableName) {
  return knexInst.schema.dropTableIfExists(tableName);
}

function _default_iname(type, tableName, columns) {
  var prefix = null;
  if (type === "primary") {
    prefix = "PK";
  } else if (type === "unique") {
    prefix = "UX";
  } else if (type === "index") {
    prefix = "IX";
  } else {
    prefix = "OTHER"
  }
  if (!_.isArray(columns)) columns = columns ? [columns] : [];    
  return prefix + "_" + tableName + '_' + columns.join('_');
}

function createTable(tableName) {
  return knexInst.schema.createTable(tableName, function(table) {
    var column;
    var columnKeys = _.keys(schema[tableName]);
    var composite_primarys = []
    var composite_uniques = {}
    var composite_indexes = {}

    _.each(columnKeys, function(key) {
      if (schema[tableName][key].type === "text" && schema[tableName][key].hasOwnProperty("fieldtype")) {
        column = table[schema[tableName][key].type](key, schema[tableName][key].fieldtype);
      } else if (schema[tableName][key].type === "string" && schema[tableName][key].hasOwnProperty("maxlength")) {
        column = table[schema[tableName][key].type](key, schema[tableName][key].maxlength);
      } else {
        column = table[schema[tableName][key].type](key);
      }
      if (schema[tableName][key].hasOwnProperty("nullable") && schema[tableName][key].nullable === true) {
        column.nullable();
      } else {
        column.notNullable();
      }
      if (schema[tableName][key].hasOwnProperty("primary")) {
        var iname = _.isString(schema[tableName][key].primary) ? schema[tableName][key].primary : _default_iname("primary", tableName, key);
          column.primary(iname);
      }
      if (schema[tableName][key].hasOwnProperty("composite_primary") && schema[tableName][key].composite_primary === true) {
        composite_primarys.push(key);
      }
      if (schema[tableName][key].hasOwnProperty("composite_unique")) {
        var {name, order} = schema[tableName][key].composite_unique;
        if (composite_uniques.hasOwnProperty(name)) {
          composite_uniques[name].push({key, order});
        } else {
          composite_uniques[name] = [{key, order}];
        }
      }
      if (schema[tableName][key].hasOwnProperty("composite_index")) {
        var {name, order} = schema[tableName][key].composite_index;
        if (composite_uniques.hasOwnProperty(name)) {
          composite_indexes[name].push({key, order});
        } else {
          composite_indexes[name] = [{key, order}];
        }
      }
      if (schema[tableName][key].hasOwnProperty("unique")) {
        var iname = _.isString(schema[tableName][key].unique) ? schema[tableName][key].unique : _default_iname("unique", tableName, key);
        column.unique(iname);
      }
      if (schema[tableName][key].hasOwnProperty("index")) {
        var iname = _.isString(schema[tableName][key].unique) ? schema[tableName][key].unique : _default_iname("index", tableName, key);
        column.index(iname);
      }
      if (schema[tableName][key].hasOwnProperty("unsigned") && schema[tableName][key].unsigned) {
        column.unsigned();
      }
      if (schema[tableName][key].hasOwnProperty("references")) {
        column.references(schema[tableName][key].references);
      }
      if (schema[tableName][key].hasOwnProperty("onDelete")) {
        column.onDelete(schema[tableName][key].onDelete);
      }
      if (schema[tableName][key].hasOwnProperty("defaultTo")) {
        column.defaultTo(schema[tableName][key].defaultTo);
      }
    });
    if (composite_primarys.length > 0) {
      table.primary(composite_primarys);
    }
    _.each(_.keys(composite_uniques), function (k) {
      var columns = _.map(_.sortBy(composite_uniques[k], "order"), (o) => { return o["key"]; });
      k = _.isString(k) ? k : _default_iname("unique", tableName, columns);
      table.unique(columns, k);
    });
    _.each(_.keys(composite_indexes), function (k) {
      var columns = _.map(_.sortBy(composite_indexes[k], "order"), (o) => { return o["key"]; });
      k = _.isString(k) ? k : _default_iname("index", tableName, columns);
      table.index(columns, k);
    });
  });
}

module.exports = {
  createTable: createTable,
  dropTable: dropTable
};
