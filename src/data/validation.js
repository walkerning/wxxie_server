var _ = require("lodash");
var util = require("util");
var Promise = require('bluebird');
var assert = require('assert');
var validator = require("validator");
var schema = require("./schema");
var errors = require("../errors");

function assertString(input) {
  assert(typeof input === 'string', 'Validator js validates strings only');
}

// extends has been removed in validator >= 5.0.0, need to monkey-patch it back in
validator.extend = function(name, fn) {
  validator[name] = function() {
    var args = Array.prototype.slice.call(arguments);
    assertString(args[0]);
    return fn.apply(validator, args);
  };
};

validator.extend("isBetween", function isBetween(strVal, mini, maxi) {
  var val = _.toInteger(strVal);
  return val <= maxi && val >= mini;
});

validator.extend("isMinimum", function isBetween(strVal, mini) {
  var val = _.toInteger(strVal);
  return val >= mini;
});

validator.extend("isPhone", function isPhone(strVal) {
  // FIXME: Do we need different locale for phone? I think it's unneccesary
  var locale = "zh-CN";
  return validator.isMobilePhone(strVal, locale);
});

function validateSchema(tableName, model, autoAttrs) {
  var columns = _.keys(schema[tableName]);
  var validationErrors = [];
  // **TODO**: end validate when get one error
  _.each(columns, function validateColumn(columnKey) {
    var log = "";
    var strVal = _.toString(model[columnKey]);
    //
    if (schema[tableName][columnKey].hasOwnProperty("nullable")
      && schema[tableName][columnKey].nullable !== true
      && !_.includes(autoAttrs, columnKey)) {
      if (validator.isEmpty(strVal)) {
        log = util.format("%s.%s cannot be blank.", tableName, columnKey);
        validationErrors.push(new errors.ValidationError({
          message: log,
          context: tableName + "." + columnKey
        }));
      }
    }
    if (validator.isEmpty(strVal)) {
      return;
    }
    // validate boolean columns
    if (model.hasOwnProperty(columnKey) && schema[tableName][columnKey].hasOwnProperty("type")
      && schema[tableName][columnKey].type === "bool") {
      if (!(validator.isBoolean(strVal) || validator.isEmpty(strVal))) {
        log = util.format("%s.%s must be boolean.", tableName, columnKey);
        validationErrors.push(new errors.ValidationError({
          message: log,
          context: tableName + "." + columnKey
        }));
      }
    }
    if (model[columnKey] !== null && model[columnKey] !== undefined) {
      // check length
      if (schema[tableName][columnKey].hasOwnProperty("maxlength")) {
        if (!validator.isLength(strVal, 0, schema[tableName][columnKey].maxlength)) {
          log = util.format("%s.%s exceed max length.", tableName, columnKey);
          validationErrors.push(new errors.ValidationError({
            message: log,
            context: tableName + "." + columnKey
          }));
        }
      }
      // check validations objects
      if (schema[tableName][columnKey].hasOwnProperty("validations")) {
        validationErrors = validationErrors.concat(validate(strVal, columnKey, tableName));

      }
      // check type
      if (schema[tableName][columnKey].hasOwnProperty("type")) {
        if (schema[tableName][columnKey].type === "integer" && !validator.isInt(strVal)) {
          log = util.format("%s.%s is not integer.", tableName, columnKey);
          validationErrors.push(new errors.ValidationError({
            message: log,
            context: tableName + "." + columnKey
          }));
        }
      }
    }
  });

  if (validationErrors.length !== 0) {
    // Reject using the first validation error.
    return Promise.reject(validationErrors[0]);
    // return Promise.reject(new errors.ValidationError({
    //   errors: validationErrors
    // }));
  }
  return Promise.resolve();
}

function validate(value, key, tableName) {
  var validations = schema[tableName][key].validations;
  var validationErrors = [];
  value = _.toString(value);

  _.each(validations, function each(validationOptions, validationName) {
    var goodResult = true;

    if (_.isBoolean(validationOptions)) {
      goodResult = validationOptions;
      validationOptions = [];

    } else if (!_.isArray(validationOptions)) {
      validationOptions = [validationOptions];

    }

    validationOptions.unshift(value);

    // equivalent of validator.isSomething(option1, option2)
    if (validator[validationName].apply(validator, validationOptions) !== goodResult) {
      var log = util.format("%s.%s(%s) %s %j validation failed.", tableName, key, value,
                            validationName, _.slice(validationOptions, 1));
      validationErrors.push(new errors.ValidationError({
        message: log,
        context: tableName + "." + key,
        log: log
      }));
    }
    validationOptions.shift();

  }, this);

  return validationErrors;
}
;

module.exports = {
  validateSchema: validateSchema,
  validate: validate
};
