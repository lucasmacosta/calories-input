'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    moment = require('moment');

var mealSchema = new Schema({
  date: Date,
  // To store the time in seconds, because mongodb does
  // not provide a Time type
  time: Number,
  comments: String,
  calories: {
    type: Number,
    min: 0
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

mealSchema.methods.getTimeInSeconds = function() {
  var mntDate = moment.utc(this.date);
  var midnight = mntDate.clone().startOf('day');
  return mntDate.diff(midnight, 'seconds');
};

mealSchema.pre('save', function (next) {
  this.time = this.getTimeInSeconds();
  next();
});

module.exports = mongoose.model('Meal', mealSchema);
