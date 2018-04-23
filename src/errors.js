var _ = require("lodash");

class Error {
  constructor(infos) {
    _.merge(this, infos);
  }
}
;

class ValidationError extends Error {
  constructor(infos) {
    super(_.merge({
      status: 400,
      name: "ValidationError",
      message: "The request failed validation."
    }, infos));
  }
}
;

class BadRequestError extends Error {
  constructor(infos) {
    super(_.merge({
      status: 400,
      name: "BadRequestError",
      message: "Bad request!"
    }, infos));
  }
}
;

class UnauthorizedError extends Error {
  constructor(infos) {
    super(_.merge({
      status: 401,
      name: "UnauthorizedError",
      message: "The request is unauthenticated."
    }, infos));
  }
}
;

class ForbiddenError extends Error {
  constructor(infos) {
    super(_.merge({
      status: 403,
      name: "ForbiddenError",
      message: "Forbidden",
    }, infos));
  }
}
;

class InternalServerError extends Error {
  constructor(infos) {
    super(_.merge({
      status: 500,
      name: "InternalServerError",
      message: "Oops, something goes bad."
    }, infos));
  }
}
;

class NotFoundError extends Error {
  constructor(infos) {
    super(_.merge({
      status: 404,
      name: "NotFoundError",
      message: "Oops, this url is missing."
    }, infos));
  }
}
;

var errors = {
  BadRequestError: BadRequestError,
  ValidationError: ValidationError,
  UnauthorizedError: UnauthorizedError,
  InternalServerError: InternalServerError,
  NotFoundError: NotFoundError,
  ForbiddenError: ForbiddenError
};

module.exports = errors;
