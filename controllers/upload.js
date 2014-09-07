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
    
    if (req.from_date) {
      dateQuery.$gte = moment(req.from_date).toDate();
      query.booking_date = dateQuery;
    }
    if (req.to_date) {
      dateQuery.$lte = moment(req.to_date).toDate();
      query.booking_date = dateQuery;
    }
    
    query.booking_date = { $gte: moment('2014-08-01').toDate() };
    
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
