var express = require('express');
var post = require('./post');
var list = require('./list');
var info = require('./info');
var put = require('./put');
var router = express.Router();
var path = require('path');

router.get('/:a', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});
router.get('/:a/:b', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});

router.use('/list', list);
router.use('/info', info);
router.use('/post', post);
router.use('/put', put);

module.exports = router;
