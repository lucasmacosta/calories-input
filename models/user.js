'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('lodash');

var userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  hashedPassword: String,
  salt: String,
  name: String,
  role: {
    type: String,
    enum: [ 'admin', 'user', 'usersManager' ]
  },
  settings: {
    caloriesPerDay: {
      type: Number,
      min: 0
    }
  }
}, { minimize: false });

userSchema.statics.generateSalt = function () {
  return crypto.randomBytes(16).toString('base64');
};

userSchema.statics.encryptPassword = function (password, saltStr) {
  var salt = new Buffer(saltStr, 'base64');
  return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
};

userSchema.methods.checkPassword = function (password) {
  return this.model('User').encryptPassword(password, this.salt) === this.hashedPassword;
};

userSchema.methods.toSafeObject = function () {
  return _.pick(this.toObject(), [ '_id', 'username', 'name', 'role', 'settings' ]);
};

module.exports = mongoose.model('User', userSchema);
