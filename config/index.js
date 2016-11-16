'use strict';

var path = require('path'),
    _ = require('lodash');

var env = process.env.NODE_ENV || 'development';

var envConfig = require('./' + _.camelCase('config-' + env));

var config = {
  environment: env
};

config.database = {
  uri    : '',
  options: {
    db: {
      safe: true
    }
  },
  debug  : false
};

config.api = {
  port: 3000
};

config.token = {
  expiresIn  : '7 days',
  secret     : 'secret',
  audience   : 'audience',
  issuer     : 'issuer'
};

config.logger = {
  logFile: path.join(__dirname, '../logs/tests.log'),
  consoleLevel: 'info',
  silent: false
};

config.public = {
  path: '/public'
};

module.exports = _.defaultsDeep(envConfig, config);
