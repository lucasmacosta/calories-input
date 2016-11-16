'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon'),
    moment = require('moment');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Search Tests', function () {

    before(function (done) {
      util.clearDb(done);
    });

    describe('Failure tests', function () {
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

          done(err);
        });
      });

      it('should fail if params are invalid', function (done) {
        request
          .get('http://localhost:3010/users/' + user.id + '/meals')
          .query({ dateFrom: 'dummy' })
          .set('Authorization', 'Bearer ' + user2Token)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to get meals for another user', function (done) {
        request
          .get('http://localhost:3010/users/' + user.id + '/meals')
          .set('Authorization', 'Bearer ' + user2Token)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to get meals for an user as an users manager', function (done) {
        request
          .get('http://localhost:3010/users/' + user.id + '/meals')
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

    });

    describe('Success tests', function () {
      var admin, adminToken, user, userToken, meal;

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

          async.series([
            function (callback) {
              util.createMeal(moment.utc('2016-06-20T09:00:00'), 'comments 1', 100, user, callback);
            },
            function (callback) {
              util.createMeal(moment.utc('2016-06-20T13:00:00'), 'comments 2', 150, user, callback);
            },
            function (callback) {
              util.createMeal(moment.utc('2016-06-20T19:00:00'), 'comments 3', 200, user, callback);
            },
            function (callback) {
              util.createMeal(moment.utc('2016-06-21T10:00:00'), 'comments 4', 250, user, callback);
            },
            function (callback) {
              util.createMeal(moment.utc('2016-06-23T11:00:00'), 'comments 5', 300, user, callback);
            },
            function (callback) {
              util.createMeal(moment.utc('2016-06-23T20:00:00'), 'comments 6', 350, user, callback);
            },
            function (callback) {
              util.createMeal(moment.utc('2016-06-24T12:00:00'), 'comments 7', 400, user, callback);
            }
          ], done);
        });
      });

      it('should get all meals by default', function (done) {
        request
          .get('http://localhost:3010/users/' + user.id + '/meals')
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.days.length.should.equal(4);
            res.body.days[0].date.should.equal('2016-06-24');
            res.body.days[0].totalCalories.should.equal(400);
            res.body.days[0].meals.length.should.equal(1);
            res.body.days[1].date.should.equal('2016-06-23');
            res.body.days[1].totalCalories.should.equal(650);
            res.body.days[1].meals.length.should.equal(2);
            res.body.days[2].date.should.equal('2016-06-21');
            res.body.days[2].totalCalories.should.equal(250);
            res.body.days[2].meals.length.should.equal(1);
            res.body.days[3].date.should.equal('2016-06-20');
            res.body.days[3].totalCalories.should.equal(450);
            res.body.days[3].meals.length.should.equal(3);
            done();
          });
      });

      it('should get all meals for a regular user as an admin', function (done) {
        request
          .get('http://localhost:3010/users/' + user.id + '/meals')
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.days.length.should.equal(4);
            res.body.days[0].date.should.equal('2016-06-24');
            res.body.days[0].totalCalories.should.equal(400);
            res.body.days[0].meals.length.should.equal(1);
            res.body.days[1].date.should.equal('2016-06-23');
            res.body.days[1].totalCalories.should.equal(650);
            res.body.days[1].meals.length.should.equal(2);
            res.body.days[2].date.should.equal('2016-06-21');
            res.body.days[2].totalCalories.should.equal(250);
            res.body.days[2].meals.length.should.equal(1);
            res.body.days[3].date.should.equal('2016-06-20');
            res.body.days[3].totalCalories.should.equal(450);
            res.body.days[3].meals.length.should.equal(3);
            done();
          });
      });

      it('should filter meals by date and time', function (done) {
        request
          .get('http://localhost:3010/users/' + user.id + '/meals')
          .query({
            dateFrom: '2016-06-20',
            dateTo  : '2016-06-21',
            timeFrom: '08:00:00',
            timeTo  : '13:00:00'
          })
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.days.length.should.equal(2);
            res.body.days[0].date.should.equal('2016-06-21');
            res.body.days[0].totalCalories.should.equal(250);
            res.body.days[0].meals.length.should.equal(1);
            res.body.days[1].date.should.equal('2016-06-20');
            res.body.days[1].totalCalories.should.equal(250);
            res.body.days[1].meals.length.should.equal(2);
            done();
          });
      });

      it('should filter meals by date and time for a regular user as an admin', function (done) {
        request
          .get('http://localhost:3010/users/' + user.id + '/meals')
          .query({
            dateFrom: '2016-06-20',
            dateTo  : '2016-06-21',
            timeFrom: '08:00:00',
            timeTo  : '13:00:00'
          })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            res.body.days.length.should.equal(2);
            res.body.days[0].date.should.equal('2016-06-21');
            res.body.days[0].totalCalories.should.equal(250);
            res.body.days[0].meals.length.should.equal(1);
            res.body.days[1].date.should.equal('2016-06-20');
            res.body.days[1].totalCalories.should.equal(250);
            res.body.days[1].meals.length.should.equal(2);
            done();
          });
      });

    });

  });
};
