'use strict';

var logger = require('../util/logger'),
    errors = require('../lib/errors');

module.exports = function (err, req, res, next) {
  logger.error(err, err.error);

  if (err instanceof errors.ApiError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal server error' })
  }
};
