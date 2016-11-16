'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Login Tests', function () {

    before(function (done) {
      util.clearDb(done);
    });

    describe('Failure tests', function () {
      beforeEach(function (done) {
        async.series([
          function (callback) {
            util.clearUsers(callback);
          },
          function (callback) {
            util.createUser('test01', 'pass', 'user', callback);
          }
        ], done);
      });

      it('should fail if request is invalid', function (done) {
        request
          .post('http://localhost:3010/login')
          .send({})
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Invalid request' });
            done();
          });
      });

      it('should fail if user does not exists', function (done) {
        request
          .post('http://localhost:3010/login')
          .send({
            username: 'test02',
            password: 'pass'
          })
          .end(function (err, res) {
            err.status.should.equal(401);
            err.response.body.should.eql({ message: 'Invalid credentials' });
            done();
          });
      });

      it('should fail if user exists but password is not valid', function (done) {
        request
          .post('http://localhost:3010/login')
          .send({
            username: 'test01',
            password: 'wrong'
          })
          .end(function (err, res) {
            err.status.should.equal(401);
            err.response.body.should.eql({ message: 'Invalid credentials' });
            done();
          });
      });

    });

    describe('Success tests', function () {
      var user;

      beforeEach(function (done) {
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

      it('should return user if credential are valid', function (done) {
        request
          .post('http://localhost:3010/login')
          .send({
            username: 'test01',
            password: 'pass'
          })
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.token.should.not.be.empty;
            res.body.user._id.should.equal(user.id);
            res.body.user.username.should.equal(user.username);
            res.body.user.role.should.equal(user.role);
            done();
          });
      });

    });

    describe('Token tests', function () {
      var user, clock;

      before(function () {
        clock = sinon.useFakeTimers('Date');
      });

      after(function () {
        clock.restore();
      });

      beforeEach(function (done) {
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

      it('should accept token for further requests', function (done) {
        request
          .post('http://localhost:3010/login')
          .send({
            username: 'test01',
            password: 'pass'
          })
          .end(function (err, res) {
            var userId = res.body.user._id;
            request
              .get('http://localhost:3010/users/' + userId)
              .set('Authorization', 'Bearer ' + res.body.token)
              .end(function (err, res) {
                (err === null).should.be.true;
                res.status.should.equal(200);
                res.body.user._id.should.equal(user.id);
                res.body.user.username.should.equal(user.username);
                res.body.user.role.should.equal(user.role);
                done();
              });
          });
      });

      it('should reject token for further requests if expiracy time has passed', function (done) {
        request
          .post('http://localhost:3010/login')
          .send({
            username: 'test01',
            password: 'pass'
          })
          .end(function (err, res) {
            // Advance time 61 seconds
            clock.tick(61 * 1000);

            var userId = res.body.user._id;
            request
              .get('http://localhost:3010/users/' + userId)
              .set('Authorization', 'Bearer ' + res.body.token)
              .end(function (err, res) {
                err.status.should.equal(401);
                err.response.body.should.eql({ message: 'Token could not be validated: jwt expired' });
                done();
              });
          });
      });

    });

  });
}
