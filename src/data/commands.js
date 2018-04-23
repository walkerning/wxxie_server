var knexInst = require("./db");
var schema = require("./schema");
var _ = require("lodash");

function dropTable(tableName) {
  return knexInst.schema.dropTableIfExists(tableName);
}

function createTable(tableName) {
  return knexInst.schema.createTable(tableName, function(table) {
    var column;
    var columnKeys = _.keys(schema[tableName]);
    var composite_primarys = []
    var composite_uniques = {}

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
      if (schema[tableName][key].hasOwnProperty("primary") && schema[tableName][key].primary === true) {
        column.primary();
      }
      if (schema[tableName][key].hasOwnProperty("composite_primary") && schema[tableName][key].composite_primary === true) {
        composite_primarys.push(key);
      }
      if (schema[tableName][key].hasOwnProperty("composite_unique")) {
        uni_grp = schema[tableName][key].composite_unique;
        if (composite_uniques.hasOwnProperty(uni_grp)) {
          composite_uniques[uni_grp].push(key);
        } else {
          composite_uniques[uni_grp] = [key];
        }
      }
      if (schema[tableName][key].hasOwnProperty("unique") && schema[tableName][key].unique) {
        column.unique();
      }
      if (schema[tableName][key].hasOwnProperty("index") && schema[tableName][key].index) {
        column.index();
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
      table.unique(composite_uniques[k]);
    });
  });
}

module.exports = {
  createTable: createTable,
  dropTable: dropTable
};
