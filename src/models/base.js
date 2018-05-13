var Promise = require("bluebird");
var _ = require("lodash");
var bookshelf = require("bookshelf");
var util = require("util");
var db = require("../data").db;
var schema = require("../data").schema;
var validation = require("../data").validation;
var errors = require("../errors");
var logging = require("../logging")

var bookshelfInst;

bookshelfInst = bookshelf(db);
bookshelfInst.plugin("registry");
bookshelfInst.plugin("pagination");

// Helpers
function _getJSONAttrList(json, attrName) {
  if (_.isString(attrName)) {
    return json[attrName];
  } else if (_.isArray(attrName)) {
    return _.map(attrName, function(name) {
      return json[attrName];
    });
  }
}

bookshelfInst.Model = bookshelfInst.Model.extend({
  // `hasTimestamps` will make bookshelf handle created_at and updated_at properties automatically.
  hasTimestamps: true,

  // Helpers for permissions, validations and permitted attributes(for filtering)
  _isUnique: function(spec) {
    return spec.hasOwnProperty("unique") && spec.unique == true;
  },

  assertUnique: function() {
    var self = this;
    return Promise.map(_.keys(_.pickBy(schema[this.tableName], this._isUnique)), function validateColumn(key) {
      if (self.hasChanged(key)) {
        return self.constructor
          .query("where", key, "=", self.get(key))
          .fetch()
          .then(function(existing) {
            if (existing) {
              return Promise.reject(new errors.ValidationError({
                message: "Illegal `" + key + "`: Duplicated. `" + self.get(key) + "` already exists."
              }));
            }
            return Promise.resolve();
          });
      } else {
        return Promise.resolve();
      }
    });
  },

  permittedAttributes: function permittedAttribute() {
    return _.keys(schema[this.tableName]);
  },

  permittedUpdateAttributes: function permittedUpdateAttribute() {
    // Default: return all non-auto attributes
    return _.difference(this.permittedAttributes(), this.autoAttributes());
  },

  autoAttributes: function autoAttributes() {
    return [
      "id",
      "created_at",
      "updated_at"
    ]
  },

  // `initialize` - constructor for model creation
  initialize: function initialize() {
    this.on("saving", function onSaving() {
      var self = this;
      var args = arguments;

      return Promise.resolve(self.onSaving.apply(self, args))
        .then(function validated() {
          return Promise.resolve(self.onValidate.apply(self, args));
        })
        .then(function uniqued() {
          return self.assertUnique();
        });
    });
  },

  // Database interaction event handling
  onValidate: function onValidate() {
    return validation.validateSchema(this.tableName, this.toJSON(), this.autoAttributes());
  },


  onSaving: function onSaving(newObj, attr, options) {
    // Remove any properties which don't belong on the model
    this.attributes = this.pick(this.permittedAttributes());
  },


  // Operation methods used by API.
  /** 
   * @returns {Promise<Model>}
   */
  update: function update(body, context_user, nocheck) {
    var newBody = body;
    if (!nocheck) {
      var newBody = _.pick(body, this.permittedUpdateAttributes(context_user));
    }
    if (_.isEmpty(newBody)) {
      // Avoid unneccessary update to `updated_at` field.
      return Promise.resolve(null);
    }
    return this.save(newBody, {});
  },

  toClientJSON: function toClientJSON(options) {
    options = options || {};
    options["omitPivot"] = true;
    var json = _.omitBy(_.omit(this.toJSON(options), this.constructor.secretAttributes()), _.isNull);
    return json;
  }
}, {
  secretAttributes: function secretAttributes() {
    return [];
  },
  /**
   * @returns {Promise<Model>}
   */
  getById: function getById(id, options, idname) {
    if (options !== undefined) {
      var fetchOpt = options.fetchOptions;
    }
    var idname = idname || "id";
    var query = {};
    query[idname] = id;
    return this.forge(query)
      .fetch(fetchOpt)
      .then(function(mod) {
        if (!mod && (options === undefined || options.noreject !== true)) {
          return Promise.reject(new errors.NotFoundError({
            message: util.format("%s: `id`(%s) not exists.", this.constructor.prototype.tableName, id)
          }));
        } else {
          return mod;
        }
      });
  },

  /** 
   * @returns {Promise<Model>}
   */
  create: function create(body) {
    return this.forge(body).save({}, {
      method: "insert"
    });
  }
});

bookshelfInst.Collection = bookshelfInst.Collection.extend({
  initialize: function initialize() {
    this.on("fetching", this.onFetching);
  },

  // Database interaction event handling
  onFetching: function onFetching(models, columns, options) {
    _.mergeWith(options, {}, function(dstValue, srcValue) {
      if (_.isArray(dstValue)) {
        return _.union(dstValue, srcValue);
      }
    });
  },

  // Operation methods used by API.
  toAttrList: function toAttrList(attrName) {
    return _.map(this.toJSON(), (json) => _getJSONAttrList(json, attrName));
  },

  toClientJSON: function toClientJSON(options) {
    options = _.merge({
      omitPivot: true,
    }, options);
    return _.invokeMap(this.models, 'toClientJSON', options).filter(_.negate(_.isNull));
  },

}, {
  queriableAttributes: function queriableAttributes() {
    return ["id"];
  },

  // Operation methods used by API.
  /** 
   * @returns {Promise<Collection>}
   */
  getByQuery: function getByQuery(query, options) {
    if (options !== undefined) {
      var fetchOpt = options.fetchOptions;
    }
    return this.forge()
      .query({
        where: _.pick(query, this.queriableAttributes())
      })
      .fetch(fetchOpt);
  }
});

module.exports = bookshelfInst;
