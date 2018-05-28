var _ = require("lodash");
var Promise = require("bluebird");

var bookshelfInst = require("./base");
var errors = require("../errors");
var Brand = require("./brands").Brand;

var ShoeModel = bookshelfInst.Model.extend({
  tableName:"shoe_models",

  brand: function(){
		return this.belongsTo("Brand");
  },

	tasks: function() {
		return this.hasMany("Task", "shoe_model_id");
	}

});

var ShoeModels = bookshelfInst.Collection.extend({
  model: ShoeModel
},{});

module.exports = {
  ShoeModel: bookshelfInst.model("ShoeModel",ShoeModel),
  ShoeModels: bookshelfInst.collection("ShoeModels",ShoeModels)
}



