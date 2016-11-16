'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Create Tests', function () {

    before(function (done) {
      util.clearDb(done);
    });

    describe('Failure tests', function () {
      var user, userToken, usersManager, usersManagerToken;

      before(function (done) {
        async.series([
          function (callback) {
            util.clearUsers(callback);
          },
          function (callback) {
            util.createUserAndToken('user', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('usersManager', 'pass', 'usersManager', callback);
          }
        ], function (err, results) {
          if (err) {
            return done(err);
          }

          user = results[1][0];
          userToken = results[1][1];
          usersManager = results[2][0];
          usersManagerToken = results[2][1];

          done();
        });
      });

      it('should fail if request is invalid', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({})
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Invalid request' });
            done();
          });
      });

      it('should fail if trying to create a user with a non-privileged role', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'test01',
            password: 'other',
            name: 'Test 01'
          })
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if user already exists', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'user',
            password: 'pass',
            name: 'User'
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Username already exists' });
            done();
          });
      });

    });

    describe('Success tests', function () {
      var admin, adminToken, usersManager, usersManagerToken;

      before(function (done) {
        async.series([
          function (callback) {
            util.clearUsers(callback);
          },
          function (callback) {
            util.createUserAndToken('admin', 'pass', 'admin', callback);
          },
          function (callback) {
            util.createUserAndToken('usersManager', 'pass', 'usersManager', callback);
          }
        ], function (err, results) {
          if (err) {
            return done(err);
          }

          admin = results[1][0];
          adminToken = results[1][1];
          usersManager = results[2][0];
          usersManagerToken = results[2][1];

          done();
        });
      });

      it('should create a regular user when using an admin token', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'user01',
            password: 'pass',
            name: 'User 01',
            role: 'user'
          })
          .set('Authorization', 'Bearer ' + adminToken)
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

      it('should default to create a regular user when using an admin token', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'user02',
            password: 'pass',
            name: 'User 02'
          })
          .set('Authorization', 'Bearer ' + adminToken)
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

      it('should create a regular user when using an users manager token', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'user03',
            password: 'pass',
            name: 'User 03'
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
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

      it('should ignore role and create a regular user when using an users manager token', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'user04',
            password: 'pass',
            name: 'User 04',
            role: 'usersManager'
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
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

      it('should create a users manager when using an admin token', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'usersManager01',
            password: 'pass',
            name: 'Users Manager 01',
            role: 'usersManager'
          })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(res.body.user._id, function (err, user) {
              res.body.user._id.should.equal(user.id);
              res.body.user.username.should.equal(user.username);
              res.body.user.role.should.equal('usersManager');
              res.body.user.role.should.equal(user.role);
              done();
            });
          });
      });

      it('should create an admin when using an admin token', function (done) {
        request
          .post('http://localhost:3010/users')
          .send({
            username: 'admin01',
            password: 'pass',
            name: 'Admin 01',
            role: 'admin'
          })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(res.body.user._id, function (err, user) {
              res.body.user._id.should.equal(user.id);
              res.body.user.username.should.equal(user.username);
              res.body.user.role.should.equal('admin');
              res.body.user.role.should.equal(user.role);
              done();
            });
          });
      });

    });

  });
}
