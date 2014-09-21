var md5 = require('MD5');
var categoryModel= require('../app/category_model');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = {
  post: function(req, res) {
    console.log(req.body);
    var category = req.body;
    console.log('post', category);
    
    var newCategory = new categoryModel.Category(category);
    newCategory.save(function(err, category) {
      if (err) {
        console.log('error', err);
        res.status('500').send(err);
      } else {
        console.log('transaction saved', category);
        res.status('201').end();
      }
    });
  },
  
  index: function(req, res) {
    categoryModel.Category.find({}, function(err, data) {
      res.json(data);
    });
  },
  
  delete: function(req, res) {
    var id = ObjectId.createFromHexString(req.params.id);
    console.log('deleting %s', id);
    
    categoryModel.Category.findByIdAndRemove(id, function(err, category) {
      if (err) {
        console.log('error', err);
        res.status(500).send(err);
      } else {
        console.log('deleted', category._id);
        res.status(200).end();
      }
    });
  }
};
