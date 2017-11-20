var express = require('express');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  prot: 3306,
  database: 'ojland'
});
// connection.connect();
// connection.query('SELECT * FROM orders', function(err, rows, fields) {
//     if (!err)
//         console.log('The solution is: ', rows);
//     else
//         console.log('Error while performing Query.', err);
// });
// connection.end();

var admin;
fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
    admin = JSON.parse(data);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function(req, res, next) {
  var body = req.body;
  if (body.Email == admin.id && body.Password == admin.password) {
      res.redirect('/admin');
  }
});

router.get('/forgot', function(req, res, next) {
  res.render('forgot');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/register-success', function(req, res, next) {
  res.render('register-success');
});

router.get('/admin', function(req, res, next) {
  res.render('admin');
});

router.get('/members', function(req, res, next) {
  res.render('admin-members');
});

router.get('/orders', function(req, res, next) {
  res.render('admin-orders');
});

module.exports = router;
