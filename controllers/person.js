var md5 = require('MD5');
var personModel = require('../app/person_model');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = {
  get: function(req, res) {
    console.log('Finding all persons');
    personModel.Person.find({}, function(err, data) {
      res.json(data);
    });
  },
  
  post: function(req, res) {
    var person = req.body;
    console.log('Adding new person:', person);
    
    var newPerson = new personModel.Person(person);
    newPerson.save(function(err, category) {
      if (err) {
        console.log('error', err);
        res.status('500').send(err);
      } else {
        console.log('person saved', person);
        res.status('201').end();
      }
    });
  },
  
  update: function(req, res) {
    console.log('updating %s', req.body.person._id);
    var person = req.body.person;
    var id = ObjectId.createFromHexString(person._id);
    
    personModel.Person.update({ _id: id }, person, {}, function(err, updateCount) {
      console.log('Updated %d documents', updateCount);
      
      if (err) {
        console.log('error', err);
        res.status(500).send(err);
      } else {
        res.status(200).end();
      }
    });
  },
  
  delete: function(req, res) {
    var id = ObjectId.createFromHexString(req.params.id);
    console.log('deleting %s', id);
    
    personModel.Person.findByIdAndRemove(id, function(err, person) {
      if (err) {
        console.log('error', err);
        res.status(500).send(err);
      } else {
        console.log('deleted', person._id);
        res.status(200).end();
      }
    });
  },
};
