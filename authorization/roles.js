'use strict';

var ConnectRoles = require('connect-roles'),
    _            = require('lodash');

var errorResponseMiddleware = require('../middlewares/errorResponse'),
    errors = require('../lib/errors'),
    models = require('../models'),
    User = models.User;

var roles = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // Instead of using this callback to handle errors the library
    // should forward the error to next() to use error middlewares.

    // We resort to return the same response as the error middleware
    var error = new errors.ForbiddenError('Not authorized to perform that action');
    errorResponseMiddleware(error, req, res, function (err) {});
  },
  matchRelativePaths: false
});

// The following are just defined as a convenience to be used
// on other actions or controllers
roles.use('user', function (req) {
  if (req.user.role === 'user') {
    return true;
  }
});

roles.use('usersManager', function (req) {
  if (req.user.role === 'usersManager') {
    return true;
  }
});

roles.use('admin', function (req) {
  if (req.user.role === 'admin') {
    return true;
  }
});

// Check if allowed to access user, either because it's his own
// user or because it has a privileged role
// It uses a mongoose model instance called "userResource" that
// should be retrieved by an earlier middleware
roles.use('access user', function (req) {
  if (req.user._id === req.userResource.id) {
    // User can access its own user
    return true;
  } else if (req.user.role === 'usersManager' && req.userResource.role === 'user') {
    // A users manager can access a regular user
    return true;
  } else if (req.user.role === 'admin') {
    // Admins can do anything on all users
    return true;
  }
});

// Check if allowed to manage a given user because it has a privileged role
// It uses a mongoose model instance called "userResource" that
// should be retrieved by an earlier middleware
roles.use('manage user', function (req) {
  if (req.user.role === 'usersManager' && req.userResource.role === 'user') {
    // A users manager can access a regular user
    return true;
  } else if (req.user.role === 'admin') {
    // Admins can do anything on all users
    return true;
  }
});

// Check if allowed to manage users because it has a privileged role
// It uses a mongoose model instance called "userResource" that
// should be retrieved by an earlier middleware
roles.use('manage users', function (req) {
  if (req.user.role === 'usersManager' || req.user.role === 'admin') {
    // A users manager and admin can manage users
    return true;
  }
});

// Check if allowed to access meal, either because it's his own
// user or because it has a privileged role
// It uses a couple of mongoose model instances called "userResource"
// and "mealResource" that should be retrieved by earlier middlewares
roles.use('access meal', function (req) {
  if (req.mealResource.user.role === 'user') {
    if (req.user._id == req.mealResource.user.id) {
      // User can access its own meals
      return true;
    } else if (req.user.role === 'admin') {
      // Admins can do anything on all users
      return true;
    }
  }
});

// Check if allowed to access meals, either because it's his own
// user or because it has a privileged role
// It uses a couple of mongoose model instances called "userResource"
// and "mealResource" that should be retrieved by earlier middlewares
roles.use('access meals', function (req) {
  if (req.userResource.role === 'user') {
    if (req.user._id === req.userResource.id) {
      // User can access its own meals
      return true;
    } else if (req.user.role === 'admin') {
      // Admins can do anything on all users
      return true;
    }
  }
});

module.exports = roles;
