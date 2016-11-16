'use strict';

angular.module('calories-input').service('userService', ['$resource', function ($resource) {

  this.Api = $resource('/users/:userId', {
    userId: '@id'
  }, {
    index: { method:'GET' },
    update: { method:'PUT' }
  });

}]);
