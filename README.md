# Calories Input

## Requirements

The project has been developed/tested using the following software versions under a 64-bits Arch Linux OS:

- Node.js 6.2.0
- Npm 3.9.3
- MongoDB 3.2.6

## Dependencies

Run the following commands to install dependencies. `bower` command can be installed globally with `npm install -g bower`.

- `npm install`
- `bower install`

## Running project

Run the following command to start the node.js server

- `npm start`

The application can be accessed through the following url `http://localhost:3000`

## Running tests

Run the following command to run server's integration tests

- `npm test`

## First time setup

In order to create an admin user, the easiest way is to create a regular user through the registration, and then run the following command in the mongodb console

- `mongo calories-input` to access the console
- `db.users.update({ "username" : "admin"}, {$set:{"role" : "admin"}})` once inside the console, provided the user created has a username `admin`
- Logout and login again to reflect changes in the UI

## Features

The following features have been implemented on this version of the project:

- Users are able to register accounts and use them to login
- Users are able to perform CRUD operations on meals
- There are three roles, which can perform the following actions
    + Admin: CRUD operations over all kind of users, CRUD operations for meals (regular users only)
    + Users Manager: CRUD operations over regular users, no access to meals
    + Regular users: CRUD operation over own meals only
- Each recorded meal has date, time, comments and number of calories
- Meals can be filtered by from/to date and/or time
- Users are able to edit their profiles, including the setting for an expected number of calories
- If the expected number of calories is set, the days in the meals listed are red or green depending on if the number of calories for that day exceeded the expected number or not.

## Technical features

- A custom MEAN (Mongo, Express, Angular, Node.js) application was used
- The UI uses Bootstrap for the CSS and some components
- All interactions with the server are made through AJAX calls, as the UI is a Single Page Application (SPA)
- The authentication with the Node.js API is done through JWT
- Access to server resources is determined by the user's role to prevent unwanted access to them.
- Only integration tests on the REST API are available at this time
