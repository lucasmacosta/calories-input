'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Update Tests', function () {

    before(function (done) {
      util.clearDb(done);
    });

    describe('Failure tests', function () {
      var user, userToken, user2, user2Token, usersManager, usersManagerToken, usersManager2, usersManager2Token, admin, adminToken;

      before(function (done) {
        async.series([
          function (callback) {
            util.clearUsers(callback);
          },
          function (callback) {
            util.createUserAndToken('user', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user02', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('usersManager', 'pass', 'usersManager', callback);
          },
          function (callback) {
            util.createUserAndToken('usersManager2', 'pass', 'usersManager', callback);
          },
          function (callback) {
            util.createUserAndToken('admin', 'pass', 'admin', callback);
          }
        ], function (err, results) {
          if (err) {
            return done(err);
          }

          user = results[1][0];
          userToken = results[1][1];
          user2 = results[2][0];
          user2Token = results[2][1];
          usersManager = results[3][0];
          usersManagerToken = results[3][1];
          usersManager2 = results[4][0];
          usersManager2Token = results[4][1];
          admin = results[5][0];
          adminToken = results[5][1];

          done();
        });
      });

      it('should fail if trying to update a non existent user', function (done) {
        request
          .get('http://localhost:3010/users/000000000000000000000000')
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            err.status.should.equal(404);
            err.response.body.should.eql({ message: 'Resource not found' });
            done();
          });
      });

      it('should fail if request is invalid', function (done) {
        request
          .put('http://localhost:3010/users/' + user.id)
          .send({})
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Invalid request' });
            done();
          });
      });

      it('should fail if trying to update a user with another user', function (done) {
        request
          .put('http://localhost:3010/users/' + user2.id)
          .send({
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

      it('should fail if trying to update an users manager with an user', function (done) {
        request
          .put('http://localhost:3010/users/' + usersManager.id)
          .send({
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

      it('should fail if trying to update an users manager with another users manager', function (done) {
        request
          .put('http://localhost:3010/users/' + usersManager2.id)
          .send({
            password: 'other',
            name: 'Test 01'
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to update an admin with a user', function (done) {
        request
          .put('http://localhost:3010/users/' + admin.id)
          .send({
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

      it('should fail if trying to update an admin with an users manager', function (done) {
        request
          .put('http://localhost:3010/users/' + admin.id)
          .send({
            password: 'other',
            name: 'Test 01'
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

    });

    describe('Success tests', function () {
      var user, userToken, admin, adminToken, usersManager, usersManagerToken;

      before(function (done) {
        async.series([
          function (callback) {
            util.clearUsers(callback);
          },
          function (callback) {
            util.createUserAndToken('user', 'pass', 'user', callback);
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

          user = results[1][0];
          userToken = results[1][1];
          admin = results[2][0];
          adminToken = results[2][1];
          usersManager = results[3][0];
          usersManagerToken = results[3][1];

          done();
        });
      });

      it('should allow users to update themselves, ignoring role if set', function (done) {
        request
          .put('http://localhost:3010/users/' + user.id)
          .send({
            password: 'pass',
            name: 'User 01',
            role: 'admin'
          })
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(res.body.user._id, function (err, user) {
              res.body.user._id.should.equal(user.id);
              res.body.user.username.should.equal(user.username);
              res.body.user.role.should.equal('user');
              res.body.user.role.should.equal(user.role);
              res.body.user.name.should.equal('User 01');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

      it('should allow users managers to update themselves, ignoring role if set', function (done) {
        request
          .put('http://localhost:3010/users/' + usersManager.id)
          .send({
            password: 'pass',
            name: 'Users Manager 01',
            role: 'admin'
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(res.body.user._id, function (err, user) {
              res.body.user._id.should.equal(user.id);
              res.body.user.username.should.equal(user.username);
              res.body.user.role.should.equal('usersManager');
              res.body.user.role.should.equal(user.role);
              res.body.user.name.should.equal('Users Manager 01');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

      it('should allow admins to update themselves', function (done) {
        request
          .put('http://localhost:3010/users/' + admin.id)
          .send({
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
              res.body.user.name.should.equal('Admin 01');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

      it('should allow users manager to update user, ignoring role if set', function (done) {
        request
          .put('http://localhost:3010/users/' + user.id)
          .send({
            password: 'pass',
            name: 'User 02',
            role: 'admin'
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(res.body.user._id, function (err, user) {
              res.body.user._id.should.equal(user.id);
              res.body.user.username.should.equal(user.username);
              res.body.user.role.should.equal('user');
              res.body.user.role.should.equal(user.role);
              res.body.user.name.should.equal('User 02');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

      it('should allow admin to update users manager', function (done) {
        request
          .put('http://localhost:3010/users/' + usersManager.id)
          .send({
            password: 'pass',
            name: 'Users Manager 02',
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
              res.body.user.name.should.equal('Users Manager 02');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

      it('should allow admin to update user', function (done) {
        request
          .put('http://localhost:3010/users/' + user.id)
          .send({
            password: 'pass',
            name: 'User 03',
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
              res.body.user.name.should.equal('User 03');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

      it('should allow admin to update users manager role', function (done) {
        request
          .put('http://localhost:3010/users/' + usersManager.id)
          .send({
            password: 'pass',
            name: 'Users Manager 02',
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
              res.body.user.name.should.equal('Users Manager 02');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

      it('should allow admin to update user role', function (done) {
        request
          .put('http://localhost:3010/users/' + user.id)
          .send({
            password: 'pass',
            name: 'User 03',
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
              res.body.user.name.should.equal('User 03');
              res.body.user.name.should.equal(user.name);
              done();
            });
          });
      });

    });

  });
}
