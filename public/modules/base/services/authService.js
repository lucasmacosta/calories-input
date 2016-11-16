'use strict';

angular.module('calories-input').service('authService', ['$http', '$localStorage', function ($http, $localStorage) {

  this.login = function (postData) {
    return $http.post('/login', postData, {
      // We don't need the auth interceptor here
      ignoreAuthModule: true
    });
  };

  this.logout = function () {
    this.cleanupSession();
  };

  this.isAuthorized = function() {
    return $localStorage.token;
  };

  this.saveToken = function(token) {
    $localStorage.token = token;
  };

  this.getToken = function() {
    return $localStorage.token;
  };

  this.storeUser = function(user) {
    $localStorage.user = user;
  };

  this.getUser = function() {
    return $localStorage.user;
  };

  this.cleanupSession = function() {
    $localStorage.$reset();
  };

}]);
