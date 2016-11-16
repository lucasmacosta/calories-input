'use strict';

angular.module('calories-input').controller('UserAddCtrl', ['$scope', '$location', 'userService', '_', 'flashService', function ($scope, $location, userService, _, flashService) {

  var Users = userService.Api;

  $scope.roles = {
    'user': 'User',
    'usersManager': 'Users Manager',
    'admin': 'Admin'
  };

  $scope.user = {
    role: 'user'
  };

  $scope.add = function() {
    var params = _.omit($scope.user, ['passwordConfirmation']);

    $scope.serverError = '';
    $scope.userData = params;

    Users.save(params).$promise
      .then(function (data) {
        flashService.set('User successfully created', 'success');
        $location.path('/users');
      }).catch(function (data) {
        $scope.serverError = 'User creation error: ' + data.message;
      }).finally(function () {
        $scope.userData = null;
      });
  };

}]);
