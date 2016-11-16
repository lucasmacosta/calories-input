'use strict';

var server = require('../../../server');

describe('Rest API Integration Tests Suite', function () {

  before(function (done) {
    server(done);
  });

  describe('Auth Endpoints Tests', require('./auth'));
  describe('User Endpoints Tests', require('./user'));
  describe('Meal Endpoints Tests', require('./meal'));

});
