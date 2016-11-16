'use strict';

angular.module('calories-input').controller('RegisterCtrl', ['$scope', '$location', 'registerService', '_', 'flashService', function ($scope, $location, registerService, _, flashService) {

  $scope.register = function() {
    var params = _.omit($scope.user, ['passwordConfirmation']);

    $scope.serverError = '';
    $scope.registerData = params;

    registerService.register(params)
      .then(function (response) {
        // Redirect to login and show message
        flashService.set('User successfully registered', 'success');
        $location.path('/login');
      }).catch(function (response) {
        $scope.serverError = 'Register error: ' + response.data.message;
      }).finally(function () {
        $scope.registerData = null;
      });
  };

}]);
