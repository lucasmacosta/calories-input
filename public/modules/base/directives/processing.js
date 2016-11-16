'use strict';

angular.module('calories-input').directive('ciProcessing', function () {

  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      // Create a loader and add it to element
      var loader = angular.element('<div class="form-loader"></div>');
      elem.prepend(loader);

      // Add custom class for container which will allow to show loader
      elem.addClass('processing-container');

      // Watch the value of the expression that determines if the loader
      // must be visible or not
      scope.$watch(attrs.ciProcessing, function (value) {
        elem.toggleClass('processing', !! value);
      });
    }
  };

});
