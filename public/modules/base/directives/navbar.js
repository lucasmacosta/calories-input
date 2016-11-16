'use strict';

angular.module('calories-input').directive('ciNavbar', ['$location', 'authService', function ($location, authService) {

  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      scope.isAuthorized = authService.isAuthorized;

      scope.isActive = function (viewLocation) {
        var path = $location.path();
        return path.substr(0, viewLocation.length) === viewLocation;
      };

      scope.myMeals = function () {
        var currentUser = authService.getUser();
        $location.path('/users/' + currentUser._id + '/meals');
      };

      scope.addMeal = function () {
        var currentUser = authService.getUser();
        $location.path('/users/' + currentUser._id + '/meals/add');
      };

      scope.editProfile = function () {
        var currentUser = authService.getUser();
        $location.path('/users/' + currentUser._id);
      };
    },
    templateUrl: 'modules/base/views/partials/navbar.html'
  };

}]);
