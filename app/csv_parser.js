var csv = require('fast-csv');
var models = require('../app/transaction_model');
var md5 = require('MD5');
var moment = require('moment');

var mapToObject = function(txArray) {
  return {
    booking_date: toDate(txArray.shift()),
    value_date: toDate(txArray.shift()),
    payment_date: toDate(txArray.shift()),
    amount: parseFloat(txArray.shift().replace(/,/, '.')),
    receiver: txArray.shift(),
    account_number: txArray.shift(),
    bic: txArray.shift(),
    transaction_text: txArray.shift(),
    reference: txArray.shift(),
    payer_reference: txArray.shift(),
    message: txArray.shift(),
    card_number: txArray.shift(),
    receipt: txArray.shift()
  }
};

var toDate = function(string) {
  return moment(string, "DD.MM.YYYY").toDate();
}

var save = function(data) {
  var mapped = mapToObject(data);
  console.log('mapped', mapped);
  var newTransaction = new models.Transaction(mapped);
  newTransaction.save(function(err, transaction) {
    if (err) {
      console.log('error', err);
    } else {
      console.log('transaction saved', transaction);
    }
  });
}

module.exports = {
  parse: function(filename) {
    csv
      .fromPath(filename, { delimiter: '\t', ignoreEmpty: 'true'})
      .on('record', function(data) {
        if (data instanceof Array && data.length == 13) {
          save(data);
        } else {
          console.log('ignoring', data);
        }
      })
      .on('end', function() {
        console.log('done parsing csv');
      });
  }
};
