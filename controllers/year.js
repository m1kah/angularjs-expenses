var transactionModel = require('../app/transaction_model');
var moment = require('moment');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var calculateTotals = function(transactions) {
  var result = {
    total: 0.0,
    transactions: 0,
    categories: []
  };
  
  for (var i = 0; i < transactions.length; i++) {
    var tx = transactions[i];
    result.transactions++;
    result.total += tx.amount;
    
    var index = result.categories.map(function(c) { return c.name; }).indexOf(tx.category);
    
    if (index >= 0) {
      result.categories[index].amount += tx.amount;
    } else {
      result.categories.push({ name: tx.category, amount: tx.amount });
    }
  }
  
  console.log('Result calculated for %d transactions', transactions.length);
  
  return result;
}

var findTransactionAndCalculate = function(monthIndex, res, results) {
  var month = moment().month(monthIndex);
  var startOfMonth = month.clone().startOf('month');
  var endOfMonth = month.clone().endOf('month');

  var query = {
    booking_date: {
      $gte: startOfMonth.toDate(),
      $lte: endOfMonth.toDate()
    }
  };
    
  console.log('Finding transactions for %d with query %j', monthIndex, query);
  
  var transactionInMonth = transactionModel.Transaction.find(query, function(err, data) {
    var result = calculateTotals(data);
    result.month = monthIndex;
    results[monthIndex] = result;
    
    if (monthIndex < 11) {
      findTransactionAndCalculate(monthIndex + 1, res, results);
    } else {
      console.log('Done find transactions');
      res.send(results).status(200).end();
    }
  });
};

module.exports = {
  index: function(req, res) {
    console.log('Calculating monthly totals');
    findTransactionAndCalculate(0, res, []);
  }
};
