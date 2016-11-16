'use strict';

angular.module('calories-input').directive('ciRestrictedTo', ['authService', function (authService) {

  return {
    restrict: 'A',
    scope: {
      roles: '=ciRestrictedTo'
    },
    link: function(scope, elem, attrs) {
      // Remove element depending on if user has one of the given roles or not
      if (! (authService.isAuthorized() && scope.roles.indexOf(authService.getUser().role) !== -1)) {
        elem.remove();
      }
    }
  };

}]);
