'use strict';

angular.module('calories-input').controller('LoginCtrl', ['$scope', '$location', 'authService', function ($scope, $location, authService) {

  $scope.serverError = '';

  $scope.login = function() {
    $scope.serverError = '';
    $scope.credentials = $scope.user;

    authService.login($scope.user)
      .then(function (response) {
        // Store user data
        authService.storeUser(response.data.user);
        // Token should be already saved by interceptor
        // Redirect to landing page
        $location.path('/');
      }).catch(function (response) {
        $scope.serverError = 'Login error: ' + response.data.message;
      }).finally(function () {
        $scope.credentials = null;
      });
  };
}]);
