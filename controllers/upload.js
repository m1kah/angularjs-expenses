var parser = require('../app/csv_parser');
var md5 = require('MD5');
var fs = require('fs-extra');
var transactionModel = require('../app/transaction_model');
var moment = require('moment');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = {
  post: function(req, res) {
    console.log('upload.post');
    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log('uploading: ' + filename);
      
      var fstream = fs.createWriteStream(__dirname + '/../upload/' + filename);
      file.pipe(fstream);
      fstream.on('close', function() {
        console.log('upload finished: ' + filename);
        parser.parse(__dirname + '/../upload/' + filename);
        res.redirect('back');
      });
    });
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
      console.log('field');
    });
    
    req.pipe(req.busboy);
  },
  
  index: function(req, res) {
    var dateQuery = {}
    var query = {};
    
    if (req.query.from_date) {
      dateQuery.$gte = moment(req.query.from_date).toDate();
      query.booking_date = dateQuery;
      console.log('req.from_date', req.query.from_date);
    }
    if (req.query.to_date) {
      dateQuery.$lte = moment(req.query.to_date).toDate();
      query.booking_date = dateQuery;
      console.log('req.to_date', req.query.to_date);
    }
    if (req.query.from_account_number) {
      query.from_account_number = req.query.from_account_number;
    }
    
    // query.booking_date = { $gte: moment('2014-08-01').toDate() };
    
    console.log('Finding transactions with query:', query);
    
    transactionModel.Transaction.find(query, function(err, data) {
      res.json(data);
    });
  },
  
  update: function(req, res) {
    var id = ObjectId.createFromHexString(req.params.id);
    var category = req.query.category;
    console.log('put category %s = %s', id, category);
    
    transactionModel.Transaction.findOne(id, function(err, transaction) {
      if (err) {
        console.log('error', err);
        res.status(500).send(err);
      } else {
        transaction.category = category;
        transaction.save();
        console.log('transaction %s category set to %s', transaction._id, transaction.category);
        res.json(transaction);
      }
    });
  }
};
