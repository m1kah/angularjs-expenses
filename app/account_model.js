var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Account = new Schema({
  number: { type: String }
});

module.exports = {
  Account: mongoose.model('Account', Account)
};
