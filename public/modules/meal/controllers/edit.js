'use strict';

angular
.module('calories-input')
.controller('MealEditCtrl', [
  '$scope', '$location', 'mealService', 'flashService', '$routeParams', 'moment',
  function ($scope, $location, mealService, flashService, $routeParams, moment) {

    var userId = $routeParams.userId,
        mealId = $routeParams.mealId;

    var Meals = mealService.Api(userId);

    $scope.update = true;

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

      var pathParams = {
        mealId: mealId
      };

      $scope.serverError = '';
      $scope.mealData = $scope.meal;

      Meals.update(pathParams, params).$promise
        .then(function (data) {
          flashService.set('Meal successfully updated', 'success');
          $location.path('/users/' + userId + '/meals');
        }).catch(function (data) {
          $scope.serverError = 'Meal update error: ' + data.message;
        }).finally(function () {
          $scope.mealData = null;
        });
    };

    $scope.init = function() {
      $scope.serverError = '';
      $scope.loading = true;

      Meals.get({mealId: mealId}).$promise
        .then(function (data) {
          $scope.meal = _.pick(data.meal, ['calories', 'comments']);
          $scope.meal.datePart = moment.utc(data.meal.date).toDate();
          $scope.meal.timePart = moment.utc(data.meal.date).toDate();
        }).catch(function (response) {
          $scope.serverError = 'Meal fetch error: ' + data.message;
        }).finally(function () {
          $scope.loading = false;
        });
    }

    $scope.init();

  }]);
