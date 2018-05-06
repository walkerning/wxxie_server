const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const logging = require("./logging");
const models = require("./models");
const apiRouter = require("./api");
const wafer = require("./middlewares/wafer")
const readUserMiddleware = require("./middlewares/readUser");

models.init();

var app = express();

// PLUGIN: enable CORS requests. **TODO**: only for development, all
// cross-domain requests are enabled
app.use(cors());

// PLUGIN: log requests
app.use(morgan("dev", {
  "stream": logging.stream
}));

// PLUGIN: securing application from some attacks
app.use(helmet());

// PLUGIN: gzip compression, compacting the json responses
app.use(compression());

// PLUGIN: JSON body parser: parse JSON payload into `req.body` attribute
app.use(bodyParser.json());

// PLUGIN: wafer for authenticate user with wechat server
app.use(wafer);

// PLUGIN: set user: fetch the database, set `req.user` attribute to the context user
app.use("/api/v1", readUserMiddleware);

// ROUTES: api routes
app.use("/api/v1", apiRouter);

// The unify error handler. 
// @TODO: improve the error system
if (app.get("env") == "development" || app.get("env") == "test") {
  app.use("/", function(err, req, res, next) {
    // FIXME: although now we keep the consistence of
    // our error objects towards the error object of jwt-express.
    // There is a chance that future middlewares will have different error
    // object difinition... it's really a mess
    if (!err) {
      // For 404
      err = new errors.NotFoundError();
    }
    var message = err.message;
    if (err.code == "ER_DUP_ENTRY") {
      message = "Create resource fail, duplicated entry exists.";
      err.status = 400;
    }
    logging.error("error: ", err);
    console.log(err);
    if (err.status >= 100 && err.status < 600) {
      res.status(err.status);
    } else {
      res.status(500);
    }
    res.set({
      "Cache-Control": "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    });
    res.json({
      message: message,
      name: err.name,
      trace: err
    });
  });
} else {
  app.use("/", function(err, req, res, next) {
    if (!err) {
      // For 404
      err = new errors.NotFoundError();
    }
    console.log(err);
    var message = err.message;
    if (err.code == "ER_DUP_ENTRY") {
      err = new errors.ValidationError({
        message: "Create resource fail, duplicated entry exists."
      });
    }
    if (err.status >= 100 && err.status < 600) {
      res.status(err.status);
    } else {
      res.status(500);
    }
    res.set({
      "Cache-Control": "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    });
    res.json({
      message: err.message,
      name: err.name
    });
  });
}

module.exports = app;
