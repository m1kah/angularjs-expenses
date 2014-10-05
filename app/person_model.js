var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Person = new Schema({
  name: { type: String },
  accounts: { type: Array }
});

module.exports = {
  Person: mongoose.model('Person', Person)
};
