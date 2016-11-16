'use strict';

var should = require('should'),
    request = require('superagent'),
    async = require('async'),
    sinon = require('sinon'),
    moment = require('moment');

var config = require('../../../../config'),
    util = require('../util');

module.exports = function() {
  describe('Create Tests', function () {

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

          done();
        });
      });

      it('should fail if request is invalid', function (done) {
        request
          .post('http://localhost:3010/users/' + user.id + '/meals')
          .send({})
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(400);
            err.response.body.should.eql({ message: 'Invalid request' });
            done();
          });
      });

      it('should fail if trying to create a meal for another user', function (done) {
        request
          .post('http://localhost:3010/users/' + user2.id + '/meals')
          .send({
            date: moment().toISOString(),
            comments: 'other',
            calories: 100
          })
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to create a meal an user as an users manager', function (done) {
        request
          .post('http://localhost:3010/users/' + user.id + '/meals')
          .send({
            date: moment().toISOString(),
            comments: 'other',
            calories: 100
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to create a meal for a users manager', function (done) {
        request
          .post('http://localhost:3010/users/' + usersManager.id + '/meals')
          .send({
            date: moment().toISOString(),
            comments: 'other',
            calories: 100
          })
          .set('Authorization', 'Bearer ' + usersManagerToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });

      it('should fail if trying to create a meal for an admin', function (done) {
        request
          .post('http://localhost:3010/users/' + admin.id + '/meals')
          .send({
            date: moment().toISOString(),
            comments: 'other',
            calories: 100
          })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            err.status.should.equal(403);
            err.response.body.should.eql({ message: 'Not authorized to perform that action' });
            done();
          });
      });


    });

    describe('Success tests', function () {
      var admin, adminToken, user, userToken;

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

      it('should create a meal for a regular user', function (done) {
        var date = moment.utc();
        request
          .post('http://localhost:3010/users/' + user.id + '/meals')
          .send({
            date: date.toISOString(),
            comments: 'other',
            calories: 100
          })
          .set('Authorization', 'Bearer ' + userToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getMeal(res.body.meal._id, function (err, meal) {
              res.body.meal._id.should.equal(meal.id);
              res.body.meal.comments.should.equal(meal.comments);
              res.body.meal.calories.should.equal(meal.calories);
              moment(res.body.meal.date).toISOString().should.equal(moment(meal.date).toISOString());
              var midnight = date.clone().startOf('day');
              date.diff(midnight, 'seconds').should.equal(meal.time);
              done();
            });
          });
      });

      it('should create a meal for a regular user as an admin', function (done) {
        var date = moment.utc();

        request
          .post('http://localhost:3010/users/' + user.id + '/meals')
          .send({
            date: date.toISOString(),
            comments: 'other',
            calories: 100
          })
          .set('Authorization', 'Bearer ' + adminToken)
          .end(function (err, res) {
            (err === null).should.be.true;
            util.getMeal(res.body.meal._id, function (err, meal) {
              res.body.meal._id.should.equal(meal.id);
              res.body.meal.comments.should.equal(meal.comments);
              res.body.meal.calories.should.equal(meal.calories);
              moment(res.body.meal.date).toISOString().should.equal(moment(meal.date).toISOString());
              var midnight = date.clone().startOf('day');
              date.diff(midnight, 'seconds').should.equal(meal.time);
              done();
            });
          });
      });

    });

  });
}
