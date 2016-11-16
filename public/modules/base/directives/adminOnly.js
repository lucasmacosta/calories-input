'use strict';

angular.module('calories-input').directive('ciAdminOnly', ['authService', function (authService) {

  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      // Remove element depending on if user is an admin or not
      if (! (authService.isAuthorized() && authService.getUser().role === 'admin')) {
        elem.remove();
      }
    }
  };

}]);
