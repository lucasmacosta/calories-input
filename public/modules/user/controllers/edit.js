'use strict';

angular.module('calories-input').controller('UserEditCtrl', [
  '$scope', '$location', 'userService', '_', 'flashService', '$routeParams', 'authService',
  function ($scope, $location, userService, _, flashService, $routeParams, authService) {

    var userId = $routeParams.userId,
        currentUser = authService.getUser();

    $scope.updateProfile = userId === currentUser._id;

    var Users = userService.Api;

    $scope.roles = {
      'user': 'User',
      'usersManager': 'Users Manager',
      'admin': 'Admin'
    };

    $scope.update = function() {
      var params = _.omit($scope.user, ['username', 'passwordConfirmation']);
      if (! params.settings.caloriesPerDay) {
        params.settings.caloriesPerDay = undefined;
      }
      var pathParams = {
        userId: userId
      };

      $scope.serverError = '';
      $scope.userData = params;

      Users.update(pathParams, params).$promise
        .then(function (data) {
          flashService.set('User successfully updated', 'success');
          if ($scope.updateProfile) {
            authService.storeUser(data.user);
            $location.path('/');
          } else {
            $location.path('/users');
          }
        }).catch(function (data) {
          $scope.serverError = 'User update error: ' + data.message;
        }).finally(function () {
          $scope.userData = null;
        });
    };
   
    $scope.init = function() {
      $scope.serverError = '';
      $scope.loading = true;

      Users.get({userId: userId}).$promise
        .then(function (data) {
          $scope.user = _.omit(data.user, ['_id']);
        }).catch(function (response) {
          $scope.serverError = 'User fetch error: ' + data.message;
        }).finally(function () {
          $scope.loading = false;
        });
    }

    $scope.init();

  }]);
