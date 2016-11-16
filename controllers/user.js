'use strict';

var userService = require('../services/user');

module.exports.register = function (req, res, next) {
  var params = req.body;

  userService.create(params, false, function (err, user) {
    if (err) {
      return next(err);
    }

    res.json({
      user: user
    });
  });
};

module.exports.list = function (req, res, next) {
  var params = req.query,
      userId = req.user._id;

  userService.search(userId, params, req.userIs('admin'), function (err, results) {
    if (err) {
      return next(err);
    }

    res.json(results);
  });
};

module.exports.get = function (req, res, next) {
  var userId = req.params.userId;

  // req.userResource can be used instead
  userService.fetch(userId, function (err, user) {
    if (err) {
      return next(err);
    }

    res.json({
      user: user
    });
  });
};

module.exports.put = function (req, res, next) {
  var userId = req.params.userId,
      params = req.body;

  // req.userResource can be used instead
  userService.update(userId, params, req.userIs('admin'), function (err, user) {
    if (err) {
      return next(err);
    }

    res.json({
      user: user
    });
  });
};

module.exports.post = function (req, res, next) {
  var params = req.body;

  userService.create(params, req.userIs('admin'), function (err, user) {
    if (err) {
      return next(err);
    }

    res.json({
      user: user
    });
  });
};

module.exports.delete = function (req, res, next) {
  var userId = req.params.userId;

  userService.delete(userId, function (err) {
    if (err) {
      return next(err);
    }

    res.status(204).end();
  });
};
