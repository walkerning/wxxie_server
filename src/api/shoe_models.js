var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

function listShoeModels(req, res, next) {
    return models.Brand.getById(req.params.brandId, {
	fetchOptions: {
	    withRelated: ["shoemodels"]
	}
    })
	.then((br) => {
	    res.status(200).json(br.related("shoemodels").toClientJSON());
	});
}

function addShoeModel(req, res, next) {
    var body = req.body;
    body["brand_id"] = req.params.brandId;
    body["state"] = "no";
    return models.ShoeModel.create(body)
        .then((shoeModel) => {
	    res.status(200).json(shoeModel.toClientJSON());
	});
}

function getShoeModel(req, res, next){
    return models.Brand.getShoeModel(req.params.brandId, req.params.shoemodelId)
        .then((sm) => {
	    res.status(200).json(sm.toClientJSON());
	});
}

function updateShoeModel(req, res, next) {
    console.log(req.params)
    return models.Brand.getShoeModel(req.params.brandId, req.params.shoemodelId)
        .then((sm) => {
	    return sm.update(req.body, req.user)
		.then(()=>{
		    return sm.fetch()
			.then(()=>{
			    res.status(200).json(sm.toClientJSON());
			});
		});
	});
}

function deleteShoeModel(req, res, next) {
    return models.Brand.getShoeModel(req.params.brandId, req.params.shoemodelId)
        .then((sm) => {
	    return sm.destroy()
		.then(() => {
		    res.status(204).json({}).end();
		});
	});
}

module.exports = {
  listShoeModels,
  addShoeModel,
  getShoeModel,
  updateShoeModel,
  deleteShoeModel
};
