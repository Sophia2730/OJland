var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    }
    res.render('admin/admin');
});

router.post('/', function(req, res, next) {
});

module.exports = router;
