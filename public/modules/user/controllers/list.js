'use strict';

angular.module('calories-input').controller('UserListCtrl', ['$scope', '$location', 'userService', 'NgTableParams', function ($scope, $location, userService, NgTableParams) {

  var Users = userService.Api;

  $scope.edit = function(user) {
    $location.path('/users/' + user._id);
  };

  $scope.meals = function(user) {
    $location.path('/users/' + user._id + '/meals');
  };

  $scope.delete = function(user) {
    $scope.serverError = '';
    $scope.userToDelete = user;

    Users.delete({ userId: user._id}).$promise
      .then(function () {
        $scope.init();
      }, function (data) {
        $scope.serverError = data.message;
      }).finally(function () {
        $scope.userToDelete = null;
      });
  };

  $scope.init = function() {
    $scope.serverError = '';

    $scope.tableParams = new NgTableParams({
      page: 1,
      count: 10
    }, {
      getData: function(params) {
        $scope.loading = true;
        return Users.index(params.url()).$promise
          .then(function (data) {
            params.total(data.count);
            return data.users;
          }, function (data) {
            $scope.serverError = data.message;
          }).finally(function () {
            $scope.loading = false;
          });
      }
    });
  };

  $scope.init();

}]);
