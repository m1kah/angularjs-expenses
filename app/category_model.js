var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Category = new Schema({
  name: { type: String }
});

module.exports = {
  Category: mongoose.model('Category', Category)
};
