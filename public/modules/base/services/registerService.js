'use strict';

angular.module('calories-input').service('registerService', ['$http', function ($http) {

  this.register = function (postData) {
    return $http.post('/register', postData);
  };

}]);
