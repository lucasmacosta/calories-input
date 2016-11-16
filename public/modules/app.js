'use strict';

var ciExternalLibs = angular.module('ciExternalLibs', []);

ciExternalLibs.factory('_', function() {
  return window._; //Lodash must already be loaded on the page
});

ciExternalLibs.factory('moment', function() {
  return window.moment; //moment must already be loaded on the page
});

angular.module('calories-input', [
  'ngResource',
  'ngStorage',
  'ngRoute',
  'http-auth-interceptor',
  'ngAnimate',
  'ui.bootstrap',
  'ngTable',
  'ciExternalLibs'
])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {

    $httpProvider.interceptors.push('authInterceptor');

    $routeProvider
      .when('/', {
        templateUrl: 'modules/base/views/main.html',
        controller: 'MainCtrl',
        requiresAuth: true
      })
      .when('/register', {
        templateUrl: 'modules/base/views/register.html',
        controller: 'RegisterCtrl'
      })
      .when('/login', {
        templateUrl: 'modules/base/views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/logout', {
        resolve: {
          logout: function ($location, authService) {
            authService.logout();
            $location.path('/login');
          }
        },
        requiresAuth: true
      })
      .when('/users', {
        templateUrl: 'modules/user/views/list.html',
        controller: 'UserListCtrl',
        requiresAuth: true
      })
      .when('/users/add', {
        templateUrl: 'modules/user/views/add.html',
        controller: 'UserAddCtrl',
        requiresAuth: true
      })
      .when('/users/:userId', {
        templateUrl: 'modules/user/views/edit.html',
        controller: 'UserEditCtrl',
        requiresAuth: true
      })
      .when('/users/:userId/meals', {
        templateUrl: 'modules/meal/views/list.html',
        controller: 'MealListCtrl',
        requiresAuth: true
      })
      .when('/users/:userId/meals/add', {
        templateUrl: 'modules/meal/views/edit.html',
        controller: 'MealAddCtrl',
        requiresAuth: true
      })
      .when('/users/:userId/meals/:mealId', {
        templateUrl: 'modules/meal/views/edit.html',
        controller: 'MealEditCtrl',
        requiresAuth: true
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(false);
  })

  .run(function ($route, $rootScope, $location, authService, flashService) {

    $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      var nextPath = $location.path();
      var nextRoute = $route.routes[nextPath];

      // Check if the user has a token
      if (nextRoute && nextRoute.requiresAuth && ! authService.isAuthorized()) {
        // Redirect to login and show message
        flashService.set('You must login first', 'danger');
        $location.path('/login');
      }
    });

    // Redirect to login in the event of requests with 401 responses
    // This will only be used when the token expires on the server
    $rootScope.$on('event:auth-loginRequired', function() {
      // Redirect to login and show message
      flashService.set('You must login first', 'error');
      $location.path('/login');
    });

    // Redirect to index and display a forbidden message
    // in the event of requests with 403 responses
    $rootScope.$on('event:auth-forbidden', function() {
      // Redirect to login and show message
      flashService.set('You are not authorized to access this page', 'error');
      $location.path('/');
    });

  });
