var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Routers import
var index = require('./routes/index');
var user = require('./routes/user/index');
var admin = require('./routes/admin/index');
var order = require('./routes/order/index');
var progress = require('./routes/progress/index');
var match = require('./routes/match/index');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: '#@!qlalfzl!@#',
    resave: false,
    saveUninitialized: true
}));
app.use(methodOverride('_method'));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/:a', express.static(path.join(__dirname, 'public')));
app.use('/:a/:b', express.static(path.join(__dirname, 'public')));
app.use('/:a/:b/:c', express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', user);
app.use('/admin', admin);
app.use('/order', order);
app.use('/progress', progress);
app.use('/match', match);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
