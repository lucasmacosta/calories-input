'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon'),
    moment = require('moment');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Delete Tests', function () {

    before(function (done) {
      util.clearDb(done);
    });

    describe('Failure tests', function () {
      var user, userToken, user2, user2Token, usersManager, usersManagerToken, admin, adminToken, meal;

      before(function (done) {
        async.series([
          function (callback) {
            util.clearUsers(callback);
          },
          function (callback) {
            util.createUserAndToken('user', 'pass', 'user', callback);
          },
          function (callback) {
            util.createUserAndToken('user2', 'pass', 'user', callback);
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
          user2 = results[2][0];
          user2Token = results[2][1];
          admin = results[3][0];
          adminToken = results[3][1];
          usersManager = results[4][0];
          usersManagerToken = results[4][1];

          util.createMeal(moment.utc(), 'comments', 100, user, function (err, newMeal) {
            meal = newMeal;
            done(err);
          });
        });
      });

      it('should fail if trying to delete a meal for another user', function (done) {
        request
          .delete('http://localhost:3010/users/' + user.id + '/meals/' + meal.id)
          .set('Authorization', 'Bearer ' + user2Token)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to delete a meal for an user as an users manager', function (done) {
        request
          .delete('http://localhost:3010/users/' + user.id + '/meals/' + meal.id)
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

    });

    describe('Success tests', function () {
      var admin, adminToken, user, userToken, meal, meal2;

      before(function (done) {
        async.series([
          function (callback) {
            util.clearDb(callback);
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

          async.series([
            function (callback) {
              util.createMeal(moment.utc(), 'comments', 100, user, callback);
            },
            function (callback) {
              util.createMeal(moment.utc(), 'comments 2', 200, user, callback);
            }
          ], function (err, results) {
            if (err) {
              return done(err);
            }

            meal = results[0][0];
            meal2 = results[1][0];

            done();
          });

        });
      });

      it('should delete a meal for a regular user', function (done) {
        request
          .delete('http://localhost:3010/users/' + user.id + '/meals/' + meal.id)
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getMeal(meal.id, function (err, meal) {
              (meal === null).should.be.true;
              done();
            });
          });
      });

      it('should delete a meal for a regular user as an admin', function (done) {
        request
          .delete('http://localhost:3010/users/' + user.id + '/meals/' + meal2.id)
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getMeal(meal2.id, function (err, meal) {
              (meal === null).should.be.true;
              done();
            });
          });
      });

    });

  });
}
