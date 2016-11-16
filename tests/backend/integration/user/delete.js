'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Delete Tests', function () {

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

      it('should fail if trying to delete a non existent user', function (done) {
        request
          .get('http://localhost:3010/users/000000000000000000000000')
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            err.status.should.equal(404);
            err.response.body.should.eql({ message: 'Resource not found' });
            done();
          });
      });

      it('should fail if trying to delete a user with another user', function (done) {
        request
          .delete('http://localhost:3010/users/' + user2.id)
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to delete itself (user)', function (done) {
        request
          .delete('http://localhost:3010/users/' + user.id)
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to delete a users manager with another users manager', function (done) {
        request
          .delete('http://localhost:3010/users/' + usersManager2.id)
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to delete itself (users manager)', function (done) {
        request
          .delete('http://localhost:3010/users/' + usersManager.id)
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to delete an admin with an user', function (done) {
        request
          .delete('http://localhost:3010/users/' + admin.id)
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to delete an admin with an users manager', function (done) {
        request
          .delete('http://localhost:3010/users/' + admin.id)
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

    });

    describe('Success tests', function () {
      var user, userToken, user2, user2Token, usersManager, usersManagerToken, admin, adminToken;

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
          admin = results[4][0];
          adminToken = results[4][1];

          done();
        });
      });

      it('should delete an user with an user manager', function (done) {
        request
          .delete('http://localhost:3010/users/' + user.id)
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(user.id, function (err, user) {
              (user === null).should.be.true;
              done();
            });
          });
      });

      it('should delete an user with an admin', function (done) {
        request
          .delete('http://localhost:3010/users/' + user2.id)
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(user2.id, function (err, user) {
              (user === null).should.be.true;
              done();
            });
          });
      });

      it('should delete an users manager with an admin', function (done) {
        request
          .delete('http://localhost:3010/users/' + usersManager.id)
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(usersManager.id, function (err, user) {
              (user === null).should.be.true;
              done();
            });
          });
      });

      it('should allow an admin to delete itself', function (done) {
        request
          .delete('http://localhost:3010/users/' + admin.id)
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getUser(admin.id, function (err, user) {
              (user === null).should.be.true;
              done();
            });
          });
      });

    });

  });
}
