var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var index = require('./routes/users/index');
var login = require('./routes/users/login');
var register = require('./routes/users/register');
var forgot = require('./routes/users/forgot');
var mypage = require('./routes/users/mypage');
var changeinfo = require('./routes/users/changeinfo');
var admin = require('./routes/admin/index');
var members = require('./routes/admin/members');
var orders = require('./routes/admin/orders');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use('/', index);
app.use('/login', login);
app.use('/register', register);
app.use('/forgot', forgot);
app.use('/admin', admin);
app.use('/members', members);
app.use('/orders', orders);
app.use('/mypage', mypage);
app.use('/changeinfo', changeinfo);

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
