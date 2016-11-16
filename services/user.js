'use strict';

var async = require('async'),
    Joi   = require('joi'),
    jwt   = require('jsonwebtoken'),
    _     = require('lodash');

var config = require('../config'),
    errors = require('../lib/errors'),
    models = require('../models'),
    User   = models.User,
    Meal   = models.Meal;

var loginSchema = Joi.object().keys({
  username: Joi.string().min(1).required(),
  password: Joi.string().min(1).required()
});

var createSchema = Joi.object().keys({
  username: Joi.string().min(1).required(),
  password: Joi.string().min(1).required(),
  name    : Joi.string().min(1).required(),
  role    : Joi.string().valid([ 'admin', 'user', 'usersManager' ]),
  settings: Joi.object().keys({
    caloriesPerDay: Joi.number().min(0)
  })
});

var updateSchema = Joi.object().keys({
  password: Joi.string().min(1),
  name    : Joi.string().min(1).required(),
  role    : Joi.string().valid([ 'admin', 'user', 'usersManager' ]),
  settings: Joi.object().keys({
    caloriesPerDay: Joi.number().min(0)
  })
});

var searchSchema = Joi.object().keys({
  page : Joi.number().min(1).default(1),
  count: Joi.number().min(1).max(50).default(10)
});

module.exports.login = function (params, callback) {
  async.waterfall([
    function (callback) {
      // Validate params
      Joi.validate(params, loginSchema, function (error, validatedParams) {
        if (error) {
          return callback(new errors.BadRequestError('Invalid request', error));
        }

        callback(null, validatedParams);
      });
    },
    function (params, callback) {
      // Get user and check its password
      User.findOne({
        username: params.username
      }, function (error, user) {
        if (error) {
          return callback(new errors.InternalServerError('Error retrieving user', error));
        }

        if (! (user && user.checkPassword(params.password))) {
          return callback(new errors.UnauthorizedError('Invalid credentials'));
        }

        callback(null, user);
      });
    },
    function (user, callback) {
      var payload = user.toSafeObject();

      // Get JWT token
      jwt.sign(payload, config.token.secret, {
        expiresIn: config.token.expiresIn,
        // These two fields are not used right now but later can be
        // used to determine granted permissions and expire tokens
        audience : config.token.audience,
        issuer   : config.token.issuer
      }, function (error, token) {
        if (error) {
          return callback(new errors.InternalServerError('Error generating token', error));
        }

        callback(null, token, payload);
      });
    }
  ], callback);
};

module.exports.create = function (params, roleAllowed, callback) {
  async.waterfall([
    function (callback) {
      // Validate params
      Joi.validate(params, createSchema, function (error, validatedParams) {
        if (error) {
          return callback(new errors.BadRequestError('Invalid request', error));
        }

        // Fix role if not allowed to set it
        if (! (roleAllowed && validatedParams.role)) {
          validatedParams.role = 'user';
        }

        callback(null, validatedParams);
      });
    },
    function (params, callback) {
      // Create object
      var user = new User(_.omit(params, [ 'password' ]));
      if (! user.settings) {
        // Set defaults
        user.settings = {};
      }
      // Set salt and password
      user.salt = User.generateSalt();
      user.hashedPassword = User.encryptPassword(params.password, user.salt);

      // Save user
      user.save(function (error) {
        if (error) {
          if (error.code && (error.code === 11000 || error.code === 11001)) {
            return callback(new errors.BadRequestError('Username already exists'));
          } else {
            return callback(new errors.InternalServerError('Error saving user', error));
          }
        }

        callback(null, user.toSafeObject());
      });
    }
  ], callback);
};

module.exports.fetch = function (userId, callback) {
  User.findById(userId, function (error, user) {
    if (error) {
      return callback(new errors.InternalServerError('Error retrieving user', error));
    }

    if (! user) {
      return callback(new errors.NotFoundError('User not found'));
    }

    callback(null, user.toSafeObject());
  });
};

module.exports.update = function (userId, params, roleAllowed, callback) {
  async.waterfall([
    function (callback) {
      // Validate params
      Joi.validate(params, updateSchema, function (error, validatedParams) {
        if (error) {
          return callback(new errors.BadRequestError('Invalid request', error));
        }

        // Remove role if not allowed
        if (! roleAllowed) {
          delete validatedParams.role;
        }

        callback(null, validatedParams);
      });
    },
    function (params, callback) {
      if (params.password) {
        // Set salt and password
        params.salt = User.generateSalt();
        params.hashedPassword = User.encryptPassword(params.password, params.salt);

        delete params.password;
      }

      User.findOneAndUpdate({
        _id: userId
      }, params, {
        new: true
      }, function (error, user) {
        if (error) {
          if (error.code && (error.code === 11000 || error.code === 11001)) {
            return callback(new errors.BadRequestError('Username already exists'));
          } else {
            return callback(new errors.InternalServerError('Error updating user', error));
          }
        }
        callback(null, user.toSafeObject());
      });
    }
  ], callback);
};

module.exports.delete = function (userId, callback) {
  async.parallel([
    function (callback) {
      User.remove({
        _id: userId
      }, callback);
    },
    function (callback) {
      Meal.remove({
        user: userId
      }, callback);
    }
  ], function (error) {
    if (error) {
      return callback(new errors.InternalServerError('Error deleting user', error));
    }

    callback(null);
  });
};

module.exports.search = function (userId, params, allRoles, callback) {
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
        _id: {
          $ne: userId
        }
      };
      if (! allRoles) {
        queryParams.role = 'user';
      }

      async.parallel({
        users: function (callback) {
          User.find(queryParams)
            .limit(params.count)
            .skip((params.page - 1) * params.count)
            .sort('username')
            .select('-salt -hashedPassword')
            .exec(function (error, users) {
              if (error) {
                return callback(new errors.InternalServerError('Error searching users', error));
              }

              callback(null, users);
            });
        },
        count: function (callback) {
          User.find(queryParams)
            .count(function (error, count) {
              if (error) {
                return callback(new errors.InternalServerError('Error counting users', error));
              }

              callback(null, count);
            });
        }
      }, callback);

    }
  ], callback);
};
