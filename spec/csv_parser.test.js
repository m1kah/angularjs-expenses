var proxyquire = require('proxyquire');

var exampleRow = [
    '30.06.2014',
    '30.06.2014',
    '30.06.2014',
    '-53,90',
    'Stockmann Helsinki',
    '',
    '',
    'Korttiosto',
    '140628014244',
    '',
    'Helsinki ',
    '4920291084622889',
    '' ];

var csvReaderStub = {
  on: function(event, callback) {
    callback(exampleRow); 
    return csvReaderStub;
  }
};
var csvStub = {
  fromPath: function(filename, options) {
    return csvReaderStub;
  }
};
var modelStub = {};
var csv_parser = proxyquire('../app/csv_parser', {
  '../app/transaction_model': modelStub,
  'fast-csv': csvStub
});

describe('CSV parser', function() {
  beforeEach(function() {
    modelStub.Transaction = {
      save: function(err, callback) {
        callback(null, null);
      }
    };
  });
  
  it('should exist', function() {
    expect(csv_parser).to.exist;
  });
  
  it('should save model', function() {
    modelStub.Transaction = sinon.spy(function() {
      modelStub.Transaction.prototype.save = function(callback) {
        callback(null, null);
      }
    });
    
    csv_parser.parse('upload/test.csv');
  });
});
