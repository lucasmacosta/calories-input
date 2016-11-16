'use strict';

var express = require('express');

var config = require('../config'),
    roles  = require('../authorization/roles');

var authController = require('../controllers/auth'),
    userController = require('../controllers/user'),
    mealController = require('../controllers/meal');

var authMiddleware = require('../middlewares/auth'),
    userResourceMiddleware = require('../middlewares/userResource'),
    mealResourceMiddleware = require('../middlewares/mealResource');

// Combinations of middlewares
var accessUserMiddleware  = [ authMiddleware, userResourceMiddleware, roles.can('access user') ],
    manageUserMiddleware  = [ authMiddleware, userResourceMiddleware, roles.can('manage user') ],
    manageUsersMiddleware = [ authMiddleware, roles.can('manage users') ],
    accessMealMiddleware  = [ authMiddleware, mealResourceMiddleware, roles.can('access meal') ],
    accessMealsMiddleware = [ authMiddleware, userResourceMiddleware, roles.can('access meals') ];

module.exports = function (app) {
  var userRouter = express.Router();
  var mealRouter = express.Router({mergeParams: true});

  userRouter.use('/:userId/meals', mealRouter);

  // Login
  app.post('/login', authController.login);

  // Register
  app.post('/register', userController.register);

  // GET users
  userRouter.get('/', manageUsersMiddleware, userController.list);
  // GET user
  userRouter.get('/:userId', accessUserMiddleware, userController.get);
  // POST user
  userRouter.post('/', manageUsersMiddleware, userController.post);
  // PUT user
  userRouter.put('/:userId', accessUserMiddleware, userController.put);
  // DELETE user
  userRouter.delete('/:userId', manageUserMiddleware, userController.delete);

  // GET meals
  mealRouter.get('/', accessMealsMiddleware, mealController.list);
  // GET meal
  mealRouter.get('/:mealId', accessMealMiddleware, mealController.get);
  // POST meal
  mealRouter.post('/', accessMealsMiddleware, mealController.post);
  // PUT meal
  mealRouter.put('/:mealId', accessMealMiddleware, mealController.put);
  // DELETE meal
  mealRouter.delete('/:mealId', accessMealMiddleware, mealController.delete);

  app.use('/users', userRouter);
};
