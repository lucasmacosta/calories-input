'use strict';

angular.module('calories-input').service('mealService', ['$resource', function ($resource) {

  this.Api = function(userId) {
    return $resource('/users/:userId/meals/:mealId', {
      userId: userId,
      meal: '@id'
    }, {
      index: { method:'GET' },
      update: { method:'PUT' }
    });
  }

}]);
