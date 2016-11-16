'use strict';

angular.module('calories-input').directive('ciServerError', function () {

  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      scope.errors = null;

      // Watch for changes on the error message
      scope.$watch(attrs.errorMessage, function (value) {
        scope.errors = null;

        if (value) {
          scope.errors = [{
            type: 'danger',
            msg : value
          }];
        }
      });

      scope.closeError = function() {
        scope.errors = null;
      };
    },
    templateUrl: 'modules/base/views/partials/serverErrors.html'
  };

});
