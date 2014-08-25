
var proxyquire = require('proxyquire');
var modelsStub = {};
var md5Stub = function(string) { return string; };
var upload = proxyquire('../controllers/upload', {
  // '../app/models/': modelsStub,
  'MD5': md5Stub
});

var res = {};
var req = {};

describe('Upload controller', function() {
  beforeEach(function() {
    res = {
      json: sinon.spy()
    };
    req = {
      params: {
        id: 1
      }
    };
  });
  
  it('should exist', function() {
    expect(upload).to.exist;
  });
});
