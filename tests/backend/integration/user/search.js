'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon'),
    _ = require('lodash');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Search Tests', function () {

    before(function (done) {
      util.clearDb(done);
    });

    describe('Failure tests', function () {
      var user, userToken, admin, adminToken;

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
          }
        ], function (err, results) {
          if (err) {
            return done(err);
          }

          user = results[1][0];
          userToken = results[1][1];
          admin = results[2][0];
          adminToken = results[2][1];

          done();
        });
      });

      it('should fail if trying to search users with an user', function (done) {
        request
          .get('http://localhost:3010/users')
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to set invalid paging params', function (done) {
        request
          .get('http://localhost:3010/users')
          .query({ page: 0, count: 10 })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Invalid request' });
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
          },
          function (callback) {
            util.createUserAndToken('admin2', 'pass', 'admin', callback);
          },
          function (callback) {
            util.createUserAndToken('usersManager2', 'pass', 'usersManager', callback);
          },
          function (callback) {
            util.createUserAndToken('user', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user2', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user3', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user4', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user5', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user6', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user7', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user8', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user9', 'pass', 'user', callback);
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

      it('should default to first page and 10 items per page', function (done) {
        request
          .get('http://localhost:3010/users')
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.users.length.should.equal(10);
            res.body.count.should.equal(12);
            done();
          });
      });

      it('should allow fetching of arbitraty pages and items per page', function (done) {
        request
          .get('http://localhost:3010/users')
          .query({ page: 2, count: 4 })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.users.length.should.equal(4);
            res.body.count.should.equal(12);
            done();
          });
      });

      it('should fetch all users when using an admin, except itself', function (done) {
        request
          .get('http://localhost:3010/users')
          .query({ page: 1, count: 20 })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.users.length.should.equal(12);
            res.body.count.should.equal(12);
            var anyAdmin = _.some(res.body.users, function (user) {
              return user.username === 'admin';
            });
            anyAdmin.should.be.false;
            done();
          });
      });

      it('should fetch only regular users when using an users manager', function (done) {
        request
          .get('http://localhost:3010/users')
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.users.length.should.equal(9);
            res.body.count.should.equal(9);
            var onlyUsers = _.every(res.body.users, function (user) {
              return user.role === 'user';
            });
            onlyUsers.should.be.true;
            done();
          });
      });

    });

  });
}
