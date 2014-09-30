var categoryModel= require('../app/category_model');
var transactionModel = require('../app/transaction_model');
var moment = require('moment');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var calculateTotals = function(transactions, callback) {
  categoryModel.Category.find().lean().exec(function(err, categories) {
    var result = {
      total: 0.0,
      transactions: 0
    };
    
    for (var i = 0; i < transactions.length; i++) {
      var tx = transactions[i];
      result.transactions++;
      
      var searchFor = 'Other';
      if (tx.category) {
        searchFor = tx.category;
      }
    
      var index = categories.map(function(c) { return c.name; }).indexOf(searchFor);
      var amount = tx.amount;
      if (index >= 0) {
        var category = categories[index];
        
        if (category.type === 2) {
          amount = -amount;
        }
        if (category.amount) {
          category.amount += amount;
        } else {
          category.amount = amount;
        }
        
        if (category.type !== 2) {
          result.total += amount;
        }
      } else {
        if (tx.category) {
          categories.push({ name: tx.category, amount: amount });
        } else {
          categories.push({ name: 'Other', amount: amount });
        }
        
        result.total += amount;
      }
    }
    
    result.categories = categories;
    console.log('Result calculated for %d transactions', transactions.length);
    
    callback(result);
  });
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
    calculateTotals(data, function(result) {
      result.month = monthIndex;
      results[monthIndex] = result;
    
      if (monthIndex < 11) {
        findTransactionAndCalculate(monthIndex + 1, res, results);
      } else {
        console.log('Done find transactions');
        res.send(results).status(200).end();
      }
      
    });
  });
};

module.exports = {
  index: function(req, res) {
    console.log('Calculating monthly totals');
    findTransactionAndCalculate(0, res, []);
  }
};
