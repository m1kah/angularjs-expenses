var express = require('express');
var busboy = require('connect-busboy');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();
app.use(busboy());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var upload = require('./controllers/upload');
app.route('/upload').post(upload.post);
app.route('/api/transactions').get(upload.index);
app.route('/api/transactions/:id').put(upload.update);

var category = require('./controllers/category');
app.route('/api/categories/').get(category.index);
app.route('/api/categories/').post(category.post);
app.route('/api/categories/:id').delete(category.delete);
app.route('/api/categories/:id').put(category.update);

var year = require('./controllers/year');
app.route('/api/year').get(year.index);
app.route('/api/year/:id').get(year.index);

var account = require('./controllers/account');
app.route('/api/accounts').get(account.get);
app.route('/api/accounts').post(account.post);

var person = require('./controllers/person');
app.route('/api/persons/').get(person.get);
app.route('/api/persons/').post(person.post);
app.route('/api/persons/:id').delete(person.delete);
app.route('/api/persons/:id').put(person.update);

mongoose.connect('mongodb://localhost/expenses');
mongoose.connection.on('open', function() {
  console.log('Connected to mongoose');
})

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
