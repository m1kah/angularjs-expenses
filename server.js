var express = require('express');
var busboy = require('connect-busboy');
var path = require('path');

var mongoose = require('mongoose');

var app = express();
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

var upload = require('./controllers/upload');
app.route('/upload').post(upload.post);
app.route('/api/transactions').get(upload.index);
app.route('/api/transactions/:id').put(upload.update);

mongoose.connect('mongodb://localhost/expenses');
mongoose.connection.on('open', function() {
  console.log('Connected to mongoose');
})

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
