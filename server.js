'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var config = require('./config'),
    logger = require('./util/logger'),
    roles = require('./authorization/roles');

module.exports = function (callback) {
  var app = express();

  app.set('x-powered-by', false);

  // Set required third party middlewares
  app.use(bodyParser.json());

  // Path for static files
  app.use(express.static(__dirname + config.public.path));

  app.use(roles.middleware());

  // Include models
  var db = require('./models');

  // Include routes
  require('./routes')(app);

  // If no route handled the request then this one will be used
  app.use(require('./middlewares/notFound'));

  // Error handlers are special cases of middlewares
  app.use(require('./middlewares/errorResponse'));

  mongoose.set('debug', config.database.debug);

  mongoose.connect(config.database.uri, config.database.options, function (error) {
    if (error) {
      logger.error('ERROR connecting to: ' + config.database.uri + '. ' + error);
      callback('Error connecting to database');
    }

    logger.info('Successfully connected to: ' + config.database.uri);

    // Start express server
    app.listen(config.api.port, function () {
      logger.info('Started Calories Input API server on port ' + config.api.port);
      callback(null);
    });
  });
}
