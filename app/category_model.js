var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Category = new Schema({
  name: { type: String },
  type: { type: Number }
});

module.exports = {
  Category: mongoose.model('Category', Category)
};
