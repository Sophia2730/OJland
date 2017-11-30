var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Routers import
var index = require('./routes/users/index');
var main = require('./routes/users/main');
var login = require('./routes/users/login');
var register = require('./routes/users/register');
var confirm = require('./routes/users/confirm');
var forgot = require('./routes/users/forgot');
var mypage = require('./routes/users/mypage');
var changeinfo = require('./routes/users/changeinfo');
var changepwd = require('./routes/users/changepwd');
var changepwdAdmin = require('./routes/admin/changepwd');
var admin = require('./routes/admin/index');
var members = require('./routes/admin/members');
var orders = require('./routes/admin/orders');
var post = require('./routes/orders/post');
var list = require('./routes/orders/list');
var info = require('./routes/orders/info');
var put = require('./routes/orders/put');
var req = require('./routes/orders/req');
var ordered_list = require('./routes/users/ordered_list');
var category = require('./routes/orders/category');
var resume = require('./routes/users/resume');
var progress = require('./routes/progress/progress');

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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/main', main);
app.use('/login', login);
app.use('/register', register);
app.use('/confirm', confirm);
app.use('/forgot', forgot);
app.use('/admin', admin);
app.use('/members', members);
app.use('/orders', orders);
app.use('/mypage', mypage);
app.use('/changeinfo', changeinfo);
app.use('/changepwd', changepwd);
app.use('/changepwd-admin', changepwdAdmin);
app.use('/post', post);
app.use('/list', list);
app.use('/info', info);
app.use('/put', put);
app.use('/req', req);
app.use('/ordered_list', ordered_list);
app.use('/category', category);
app.use('/resume', resume);
app.use('/progress', progress);

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
