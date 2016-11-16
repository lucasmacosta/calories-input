'use strict';

var async = require('async'),
    jwt = require('jsonwebtoken');

var config = require('../../../config'),
    models = require('../../../models'),
    Meal = models.Meal,
    User = models.User;

module.exports.clearDb = function(callback) {
  async.series([
    function(callback){
      User.remove({}, callback);
    },
    function(callback){
      Meal.remove({}, callback);
    }
  ], callback);
};

module.exports.clearUsers = function(callback) {
  User.remove({}, callback);
};

module.exports.createUser = function(username, password, role, callback) {
  var user = new User();
  user.username = username;
  user.settings = {};
  user.salt = User.generateSalt();
  user.hashedPassword = User.encryptPassword(password, user.salt);
  user.role = role;

  // Save user
  user.save(callback);
};

module.exports.createMeal = function(date, comments, calories, user, callback) {
  var meal = new Meal();
  meal.date = date;
  meal.comments = comments;
  meal.calories = calories;
  meal.user = user;

  // Save meal
  meal.save(callback);
};

module.exports.getUser = function(userId, callback) {
  User.findById(userId, callback);
};

module.exports.getMeal = function(mealId, callback) {
  Meal.findById(mealId, callback);
};

module.exports.getToken = function(user, callback) {
  var payload = user.toSafeObject();

  // Get JWT token
  jwt.sign(payload, config.token.secret, {
    expiresIn: config.token.expiresIn,
    // These two fields are not used right now but later can be
    // used to determine granted permissions and expire tokens
    audience : config.token.audience,
    issuer   : config.token.issuer
  }, callback);
};

module.exports.createUserAndToken = function(username, password, role, callback) {
  var user; 

  async.series([
    function (callback) {
      module.exports.createUser(username, password, role, function (err, newUser) {
        user = newUser;
        callback(err, newUser);
      });
    },
    function (callback) {
      module.exports.getToken(user, callback);
    }
  ], function (err, results) {
    if (err) {
      return callback(err);
    }
    callback(null, results[0], results[1])
  });
};
