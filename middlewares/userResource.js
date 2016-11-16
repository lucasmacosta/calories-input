'use strict';

var errors = require('../lib/errors'),
    models = require('../models'),
    User = models.User;

// Fetch user indicated in the resource and store it in the "req" object
module.exports = function (req, res, next) {
  User.findById(req.params.userId, function (error, user) {
    if (error) {
      return next(new errors.InternalServerError('Error retrieving user', error));
    }

    if (! user) {
      return next(new errors.NotFoundError('Resource not found'));
    }

    req.userResource = user;
    next();
  });
};
