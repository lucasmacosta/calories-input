'use strict';

angular
.module('calories-input')
.controller('MealListCtrl', [
  '$scope', '$location', 'mealService', '$routeParams', 'userService',
  function ($scope, $location, mealService, $routeParams, userService) {

    var userId = $routeParams.userId;

    var Meals = mealService.Api(userId),
        Users = userService.Api;

    $scope.calPopupFrom = {
      opened: false
    };

    $scope.calPopupTo = {
      opened: false
    };

    $scope.openCalendarFrom = function() {
      $scope.calPopupFrom.opened = true;
    };

    $scope.openCalendarTo = function() {
      $scope.calPopupTo.opened = true;
    };

    $scope.add = function () {
      $location.path('/users/' + userId + '/meals/add');
    };

    $scope.edit = function(meal) {
      $location.path('/users/' + userId + '/meals/' + meal._id);
    };

    $scope.delete = function(meal) {
      $scope.serverError = '';
      $scope.mealToDelete = meal;

      Meals.delete({ mealId: meal._id}).$promise
        .then(function () {
          $scope.filter();
        }, function (data) {
          $scope.serverError = data.message;
        }).finally(function () {
          $scope.mealToDelete = null;
        });
    };

    var getMeals = function (params) {
      $scope.days = null;
      $scope.serverError = '';

      Meals.index(params).$promise
        .then(function (data) {
          $scope.days = data.days;
        }, function (data) {
          $scope.serverError = data.message;
          $scope.days = [];
        });
    };

    $scope.filter = function() {
      var params = {};

      ['dateFrom', 'dateTo'].forEach(function (attr) {
        if ($scope.filter[attr]) {
          params[attr] = moment.utc($scope.filter[attr]).format('YYYY-MM-DD');
        }
      });

      ['timeFrom', 'timeTo'].forEach(function (attr) {
        if ($scope.filter[attr]) {
          params[attr] = moment.utc($scope.filter[attr]).startOf('minute').format('HH:mm:ss');
        }
      });

      getMeals(params);
    };

    $scope.init = function() {
      Users.get({userId: userId}).$promise
        .then(function (data) {
          $scope.caloriesPerDay = data.user.settings && data.user.settings.caloriesPerDay;
          getMeals({});
        }).catch(function (response) {
          $scope.serverError = 'User fetch error: ' + data.message;
        });
    };

    $scope.init();

  }]);
