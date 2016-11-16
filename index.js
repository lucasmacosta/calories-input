'use strict';

var server = require('./server');

server(function (error) {
  if (error) {
    return process.exit(1);
  }
});