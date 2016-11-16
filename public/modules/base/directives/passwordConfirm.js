'use strict';

angular.module('calories-input').directive('ciPasswordConfirm', function () {

  return {
    restrict: 'A',
    // Get the controller for the model, allows to set validations that
    // later on get checked by the form
    require: 'ngModel',
    // Limit the scope to only contain the field that we are watching against
    scope: {
      otherPassword: '=ciPasswordConfirm'
    },
    link: function(scope, elem, attrs, ctrl) {
      // Add a custom validator for the field
      ctrl.$validators.passwordConfirm = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid to avoid
          // conflicts with the required directive
          return true;
        }

        return modelValue === scope.otherPassword;
      };

      // Watch for changes on the other password
      scope.$watch('otherPassword', function() {
        ctrl.$validate();
      });
    }
  };

});
