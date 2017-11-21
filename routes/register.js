var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('register');
});

router.post('/', function(req, res, next) {
});

router.get('/success', function(req, res, next) {
    res.render('register-success');
});

module.exports = router;
