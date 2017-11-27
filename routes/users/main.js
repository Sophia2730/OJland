var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    }
    res.render('user/main', {
        session: req.session
    });
});

module.exports = router;
