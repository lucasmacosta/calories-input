'use strict';

module.exports = function() {
  describe('Create', require('./create'));
  describe('Update', require('./update'));
  describe('Get', require('./get'));
  describe('Delete', require('./delete'));
  describe('Search', require('./search'));
};
