var express = require('express');
var changepwd = require('./changepwd');
var members = require('./members');
var orders = require('./orders');
var statistics = require('./statistics');
var router = express.Router();

router.get('/:a', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else if (req.session.UserType != 'AD')
        res.redirect('/');
    else
        next();
});

router.use('/changepwd', changepwd);
router.use('/members', members);
router.use('/orders', orders);
router.use('/statistics', statistics);

module.exports = router;
