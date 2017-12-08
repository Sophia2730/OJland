var express = require('express');
var close = require('./close');
var match = require('./match');
var info = require('./info');
var request = require('./request');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('admin/index');  // 관리자 메인 페이지 렌딩
});

router.get('/:a', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});

router.use('/close', close);
router.use('/match', match);
router.use('/info', info);
router.use('/request', request);

module.exports = router;
