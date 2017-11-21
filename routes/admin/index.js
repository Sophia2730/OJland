var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('admin');
});

router.post('/', function(req, res, next) {
});

module.exports = router;
