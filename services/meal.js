'use strict';

var async    = require('async'),
    Joi      = require('joi'),
    _        = require('lodash'),
    moment   = require('moment'),
    mongoose = require('mongoose');

var config = require('../config'),
    errors = require('../lib/errors'),
    models = require('../models'),
    Meal   = models.Meal,
    User   = models.User;

var createSchema = Joi.object().keys({
  date    : Joi.date().iso().required(),
  comments: Joi.string(),
  calories: Joi.number().min(0).required()
});

var updateSchema = Joi.object().keys({
  date    : Joi.date().iso().required(),
  comments: Joi.string(),
  calories: Joi.number().min(0).required()
});

var searchSchema = Joi.object().keys({
  dateFrom: Joi.date().format('YYYY-MM-DD'),
  dateTo  : Joi.date().format('YYYY-MM-DD'),
  timeFrom: Joi.date().format('HH:mm:ss'),
  timeTo  : Joi.date().format('HH:mm:ss')
});

module.exports.create = function (userId, params, callback) {
  async.waterfall([
    function (callback) {
      // Validate params
      Joi.validate(params, createSchema, function (error, validatedParams) {
        if (error) {
          return callback(new errors.BadRequestError('Invalid request', error));
        }

        callback(null, validatedParams);
      });
    },
    function (params, callback) {
      // Create object
      var meal = new Meal(params);
      meal.user = userId;

      // Save user
      meal.save(function (error) {
        if (error) {
          return callback(new errors.InternalServerError('Error saving meal', error));
        }

        callback(null, meal.toObject());
      });
    }
  ], callback);
};

module.exports.fetch = function (mealId, callback) {
  Meal.findById(mealId, function (error, meal) {
    if (error) {
      return callback(new errors.InternalServerError('Error retrieving meal', error));
    }

    if (! meal) {
      return callback(new errors.NotFoundError('Meal not found'));
    }

    callback(null, meal.toObject());
  });
};

module.exports.update = function (mealId, params, callback) {
  async.waterfall([
    function (callback) {
      // Validate params
      Joi.validate(params, updateSchema, function (error, validatedParams) {
        if (error) {
          return callback(new errors.BadRequestError('Invalid request', error));
        }

        callback(null, validatedParams);
      });
    },
    function (params, callback) {
      Meal.findById(mealId, function (error, meal) {
        if (error) {
          return callback(new errors.InternalServerError('Error retrieving meal', error));
        }

        if (! meal) {
          return callback(new errors.NotFoundError('Meal not found'));
        }

        callback(null, meal, params);
      });
    },
    function (meal, params, callback) {
      meal.date = moment.utc(params.date);
      meal.comments = params.comments;
      meal.calories = params.calories;
      meal.save(function (error) {
        if (error) {
          return callback(new errors.InternalServerError('Error updating meal', error));
        }
        callback(null, meal.toObject());
      });
    }
  ], callback);
};

module.exports.delete = function (mealId, callback) {
  Meal.remove({
    _id: mealId
  }, function (error) {
    if (error) {
      return callback(new errors.InternalServerError('Error deleting meal', error));
    }

    callback(null);
  });
};

module.exports.search = function (userId, params, callback) {
  async.waterfall([
    function (callback) {
      // Validate params
      Joi.validate(params, searchSchema, function (error, validatedParams) {
        if (error) {
          return callback(new errors.BadRequestError('Invalid request', error));
        }

        callback(null, validatedParams);
      });
    },
    function (params, callback) {
      var queryParams = {
        user: mongoose.Types.ObjectId(userId),
      };

      if (params.dateFrom) {
        queryParams.date = {
          $gte: moment.utc(params.dateFrom).startOf('day').toDate()
        };
      }

      if (params.dateTo) {
        if (! queryParams.date) {
          queryParams.date = {};
        }
        queryParams.date.$lte = moment.utc(params.dateTo).endOf('day').toDate();
      }

      // We don't use utc() in this case because Joi already adds the timezone
      var midnight = moment().startOf('day');

      if (params.timeFrom) {
        queryParams.time = {
          $gte: moment(params.timeFrom).diff(midnight, 'seconds')
        };
      }

      if (params.timeTo) {
        if (! queryParams.time) {
          queryParams.time = {};
        }
        queryParams.time.$lte = moment(params.timeTo).diff(midnight, 'seconds');
      }

      // TODO: Add some kind of limit to this query depending on the
      // expected number of meal docs for an user
      Meal.aggregate([
        {
          // Narrow results
          $match: queryParams
        }, {
          // Sort by date descending
          $sort: {
            date: -1
          }
        }, {
          // Group by date (day, month, year), get original docs
          // and sum calories of each group
          $group: {
            _id : {
              day: {
                $dayOfMonth: "$date"
              },
              month: {
                $month: "$date"
              },
              year: {
                $year: "$date"
              }
            },
            meals: {
              $push: "$$ROOT"
            },
            totalCalories: {
              $sum: "$calories"
            }
          }
        }
      ], function (error, results) {
        if (error) {
          return callback(new errors.InternalServerError('Error searching meals', error));
        }

        // Convert _id into a more readable date, then sort by it
        results.forEach(function (day) {
          var dayDate = moment([ day._id.year, day._id.month - 1, day._id.day ]);
          day.date = dayDate.format('YYYY-MM-DD');
          day.meals = day.meals.sort(sortByDateDesc);
        });

        results = results.sort(sortByDateDesc);

        callback(null, results);
      });

    }
  ], callback);
};

var sortByDateDesc = function(a, b) {
  if (a.date > b.date) { return -1; }
  if (a.date < b.date) { return 1; }
  return 0;
};
