'use strict';

var winston = require('winston');

var config = require('../config');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      level: config.logger.consoleLevel,
      timestamp: true,
      silent: config.logger.silent
    }),
    new (winston.transports.File)({
      filename: config.logger.logFile,
      silent: config.logger.silent
    })
  ]
});

module.exports = logger;
