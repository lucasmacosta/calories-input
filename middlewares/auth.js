'use strict';

var jwt = require('express-jwt');

var config = require('../config'),
    errors = require('../lib/errors');

var jwtMiddleware = jwt({
  secret  : config.token.secret,
  // These two fields are not used right now but later can be
  // used to determine granted permissions and expire tokens
  audience: config.token.audience,
  issuer  : config.token.issuer
});

// Wrapping the middleware into another middleware in order to
// handle errors in a different way
module.exports = function (req, res, next) {
  jwtMiddleware(req, res, function (error) {
    if (error) {
      return next(new errors.UnauthorizedError('Token could not be validated: ' + error.message, error));
    }

    next();
  });
};
