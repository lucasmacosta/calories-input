'use strict';

angular
.module('calories-input')
.controller('MealAddCtrl', [
  '$scope', '$location', 'mealService', 'flashService', '$routeParams', 'moment',
  function ($scope, $location, mealService, flashService, $routeParams, moment) {

    var userId = $routeParams.userId;

    var Meals = mealService.Api(userId);

    $scope.create = true;

    $scope.meal = {
      datePart: new Date(),
      timePart: new Date()
    };

    $scope.calPopup = {
      opened: false
    };

    $scope.calOptions = {
      maxDate: new Date()
    };

    $scope.openCalendar = function() {
      $scope.calPopup.opened = true;
    };

    $scope.save = function() {
      var datePart = moment.utc($scope.meal.datePart).format('YYYY-MM-DD'),
          timePart = moment.utc($scope.meal.timePart).startOf('minute').format('HH:mm:ss');

      var params = _.omit($scope.meal, ['datePart', 'timePart']);

      params.date = moment.utc(datePart + 'T' + timePart).toISOString();

      $scope.serverError = '';
      $scope.mealData = $scope.meal;

      Meals.save(params).$promise
        .then(function (data) {
          flashService.set('Meal successfully created', 'success');
          $location.path('/users/' + userId + '/meals');
        }).catch(function (data) {
          $scope.serverError = 'Meal creation error: ' + data.message;
        }).finally(function () {
          $scope.mealData = null;
        });
    };

  }]);
