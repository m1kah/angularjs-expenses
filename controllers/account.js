var md5 = require('MD5');
var accountModel = require('../app/account_model');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = {
  get: function(req, res) {
    console.log('Finding all accounts');
    accountModel.Account.find({}, function(err, data) {
      res.json(data);
    });
  },
  
  post: function(req, res) {
    var account = req.body;
    console.log('Adding new account:', account);
    
    var newAccount = new accountModel.Account(account);
    newAccount.save(function(err, category) {
      if (err) {
        console.log('error', err);
        res.status('500').send(err);
      } else {
        console.log('account saved', account);
        res.status('201').end();
      }
    });
  }
};
