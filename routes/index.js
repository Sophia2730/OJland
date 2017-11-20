var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
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

module.exports = router;
