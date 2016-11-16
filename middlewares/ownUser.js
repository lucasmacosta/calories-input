'use strict';

var guard = require('express-jwt-permissions')();

var config = require('../config'),
    errors = require('../lib/errors');

// Wrapping the middleware into another middleware in order to
// handle access in a different way
module.exports = function (req, res, next) {
  guard.check(req, res, function (error) {
    if (error) {
      return next(new errors.ForbiddenError(error.message, error));
    }

    next();
  });
};
