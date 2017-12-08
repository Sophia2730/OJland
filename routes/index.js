var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (req.session.UserType == 'AD')
        res.redirect('/admin');
    else if (req.session.Name)
        res.redirect('/user/main');

    res.render('index', {
        session: req.session
    });
});

module.exports = router;
