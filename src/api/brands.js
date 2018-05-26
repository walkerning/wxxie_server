var _ = require("lodash");
var Promise = require("bluebird");
var models = require("../models");
var errors = require("../errors");

function listBrands(req, res, next) {
    return models.Brands.getByQuery(req.query)
        .then((col) => {
	    res.status(200).json(col.toClientJSON());
	});
}

function addBrand(req, res, next) {
    return models.Brand.create(req.body)
        .then((brand) => {
	    res.status(200).json(brand.toClientJSON());
	})
        .catch((err) => {
	    return next(err);
	});
}

function getBrand(req, res, next) {
    return models.Brand.getById(req.params.brandId)
        .then(function(brand) {
	    res.status(200).json(brand.toClientJSON());
	});
    //console.log("test module");
}

function updateBrand(req, res, next) {
    return models.Brand.getById(req.params.brandId)
        .then((r) => {
	    var brand = r;
	    return brand.update(req.body, req.brand)
		.then(()=>{
		    return brand.fetch()
			.then(()=>{
			    res.status(200).json(brand.toClientJSON());
			});
		});

	});
}

function deleteBrand(req, res, next) {
    return models.Brand.getById(req.params.brandId)
	.then((r) => {
	    var brand = r;
	    return new models.Brand({id: req.params.brandId}).destroy()
		.then((brand) => {
		    res.status(200).json(brand.toClientJSON());
		});
	});
}

module.exports = {
  listBrands,
  addBrand,
  getBrand,
  updateBrand,
  deleteBrand
};
