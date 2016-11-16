'use strict';

angular.module('calories-input').factory('flashService', ['$rootScope', function ($rootScope) {

  var queue = [],
      currentMessage = null;
  
  $rootScope.$on('$routeChangeSuccess', function() {
    if (queue.length > 0) {
      currentMessage = queue.shift();
    } else {
      currentMessage = null;
    }
  });

  return {
    set: function(message, type) {
      queue.push({
        message: message,
        type   : type || 'danger'
      });
    },
    get: function(message) {
      return currentMessage;
    }
  };

}]);
