var csv = require('fast-csv');
var models = require('../app/transaction_model');
var md5 = require('MD5');
var moment = require('moment');

var mapToObject = function(accountNumber, txArray) {
  return {
    from_account_number: accountNumber,
    booking_date: toDate(txArray.shift()),
    value_date: toDate(txArray.shift()),
    payment_date: toDate(txArray.shift()),
    amount: parseFloat(txArray.shift().replace(/,/, '.')),
    receiver: txArray.shift(),
    to_account_number: txArray.shift(),
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
};

var save = function(accountNumber, data) {
  var mapped = mapToObject(accountNumber, data);
  console.log('mapped', mapped);
  var newTransaction = new models.Transaction(mapped);
  newTransaction.save(function(err, transaction) {
    if (err) {
      console.log('error', err);
    } else {
      console.log('transaction saved', transaction);
    }
  });
};

var getAccountNumberFromFilename = function(filename) {
  var parts = filename.split("_");
  return parts[1];
};

module.exports = {
  parse: function(filename) {
    var accountNumber = getAccountNumberFromFilename(filename);
    console.log("Account parsed from filename: %s", accountNumber)
    csv
      .fromPath(filename, { delimiter: '\t', ignoreEmpty: 'true'})
      .on('record', function(data) {
        if (data instanceof Array && data.length == 13) {
          save(accountNumber, data);
        } else {
          console.log('ignoring', data);
        }
      })
      .on('end', function() {
        console.log('done parsing csv');
      });
  }
};
