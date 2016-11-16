'use strict';

var userService = require('../services/user');

module.exports.login = function (req, res, next) {
  var params = req.body

  userService.login(params, function (err, token, user) {
    if (err) {
      return next(err);
    }

    res.json({
      token: token,
      user : user
    });
  });
};
