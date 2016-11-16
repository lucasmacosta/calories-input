'use strict';

var mealService = require('../services/meal');

module.exports.list = function (req, res, next) {
  var params = req.query,
      userId = req.params.userId;

  mealService.search(userId, params, function (err, days) {
    if (err) {
      return next(err);
    }

    res.json({
      days: days
    });
  });
};

module.exports.get = function (req, res, next) {
  var mealId = req.params.mealId;

  // req.userResource can be used instead
  mealService.fetch(mealId, function (err, meal) {
    if (err) {
      return next(err);
    }

    res.json({
      meal: meal
    });
  });
};

module.exports.put = function (req, res, next) {
  var mealId = req.params.mealId,
      params = req.body;

  // req.userResource can be used instead
  mealService.update(mealId, params, function (err, meal) {
    if (err) {
      return next(err);
    }

    res.json({
      meal: meal
    });
  });
};

module.exports.post = function (req, res, next) {
  var params = req.body,
      userId = req.params.userId;

  mealService.create(userId, params, function (err, meal) {
    if (err) {
      return next(err);
    }

    res.json({
      meal: meal
    });
  });
};

module.exports.delete = function (req, res, next) {
  var mealId = req.params.mealId;

  mealService.delete(mealId, function (err) {
    if (err) {
      return next(err);
    }

    res.status(204).end();
  });
};
