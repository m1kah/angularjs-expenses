var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Transaction = new Schema({
  booking_date: { type: Date },
  value_date: { type: Date },
  payment_date: { type: Date },
  amount: { type: Number },
  receiver: { type: String },
  from_account_number: { type: String },
  to_account_number: { type: String },
  bic: { type: String },
  transaction_text: { type: String },
  reference: { type: String },
  payer_reference: { type: String },
  message: { type: String },
  card_number: { type: String },
  receipt: { type: String },
  category: { type: String }
});

module.exports = {
  Transaction: mongoose.model('Transaction', Transaction)
};
