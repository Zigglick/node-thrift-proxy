var express = require('express');



var thrift = require('thrift');
var ThriftTransports = require('./node_modules/thrift/lib/thrift/transport.js');
var ThriftProtocols = require('./node_modules/thrift/lib/thrift/protocol.js');
var Proxy = require("./gen-nodejs/Proxy");



var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


app.get('/proxy/:policy/:cacheSize/:domain', function(req, res) {

  // Thrift connection
  
  console.log("Connecting to thrift server");
  var connection = thrift.createConnection("localhost", 9090, {
    transport : ThriftTransports.TBufferedTransport(),
    protocol : ThriftProtocols.TBinaryProtocol()
  });

  connection.on('error', function(err) {
    assert(false, err);
  });

  console.log("Requesting url");
  var client = thrift.createClient(Proxy, connection);
  client.get('http://'+req.params.domain, req.params.cacheSize, req.params.policy, function(err, response) {
    console.log("Transmitting content");
    res.send(response);
  });
  
});










// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
