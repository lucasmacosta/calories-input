'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Register Tests', function () {

    before(function (done) {
      util.clearDb(done);
    });

    describe('Failure tests', function () {
      var user;

      before(function (done) {
        async.series([
          function (callback) {
            util.clearUsers(callback);
          },
          function (callback) {
            util.createUser('test01', 'pass', 'user', function (err, newUser) {
              user = newUser;
              callback(err);
            });
          }
        ], done);
      });

      it('should fail if request is invalid', function (done) {
        request
          .post('http://localhost:3010/register')
          .send({})
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Invalid request' });
            done();
          });
      });

      it('should fail if user already exists', function (done) {
        request
          .post('http://localhost:3010/register')
          .send({
            username: 'test01',
            password: 'other',
            name: 'Test 01'
          })
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Username already exists' });
            done();
          });
      });

    });

    describe('Success tests', function () {
      before(function (done) {
        util.clearUsers(done);
      });

      it('should return user if registration succeeded', function (done) {
        request
          .post('http://localhost:3010/register')
          .send({
            username: 'test01',
            password: 'other',
            name: 'Test 01'
          })
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(res.body.user._id, function (err, user) {
              res.body.user._id.should.equal(user.id);
              res.body.user.username.should.equal(user.username);
              res.body.user.role.should.equal('user');
              res.body.user.role.should.equal(user.role);
              done();
            });
          });
      });

      it('should ignore role param and create only regular users', function (done) {
        request
          .post('http://localhost:3010/register')
          .send({
            username: 'test02',
            password: 'other',
            name: 'Test 02',
            role: 'admin'
          })
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(res.body.user._id, function (err, user) {
              res.body.user._id.should.equal(user.id);
              res.body.user.username.should.equal(user.username);
              res.body.user.role.should.equal('user');
              res.body.user.role.should.equal(user.role);
              done();
            });
          });
      });

    });

  });
}
