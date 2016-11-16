'use strict';

var errors = require('../lib/errors'),
    models = require('../models'),
    Meal = models.Meal;

// Fetch user indicated in the resource and store it in the "req" object
module.exports = function (req, res, next) {
  Meal
    .findOne({
      _id: req.params.mealId,
      user: req.params.userId
    })
    .populate('user')
    .exec(function (error, meal) {
      if (error) {
        return next(new errors.InternalServerError('Error retrieving meal', error));
      }

      if (! meal) {
        return next(new errors.NotFoundError('Resource not found'));
      }

      req.mealResource = meal;
      next();
    });
};
