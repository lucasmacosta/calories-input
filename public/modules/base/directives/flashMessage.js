'use strict';

angular.module('calories-input').directive('ciFlashMessage', ['flashService', '$timeout', function (flashService, $timeout) {

  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      var flash = flashService.get();

      if (flash === null) {
        return;
      }

      $timeout(function () {
        scope.alerts = [{
          type: flash.type,
          msg : flash.message
        }];
      }, 0);

      scope.closeAlert = function() {
        scope.alerts = null;
      };
    },
    templateUrl: 'modules/base/views/partials/errorMessages.html'
  };

}]);
