'use strict';

var config = {};

config.database = {
  uri: 'mongodb://localhost/calories-input-test'
};

config.api = {
  port: 3010
};

config.logger = {
  silent: true
};

config.token = {
  expiresIn: '1 minute'
};

module.exports = config;
