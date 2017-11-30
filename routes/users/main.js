var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    if (req.session.UserType == 'AD')
        res.redirect('/admin');
    else if (!req.session.Name) {
        res.redirect('/');
        return;
    }
    res.render('user/main', {
            session: req.session
    });
});

module.exports = router;
