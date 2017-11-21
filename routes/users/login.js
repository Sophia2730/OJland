var express = require('express');
var router = express.Router();
var fs = require('fs');

var admin;
fs.readFile('../public/data/admin.json', 'utf-8', function(err, data) {
    admin = JSON.parse(data);
});

router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', function(req, res, next) {
    var body = req.body;
    if (body.Email == admin.id && body.Password == admin.password) {
        res.redirect('/admin');
    }
});

module.exports = router;
