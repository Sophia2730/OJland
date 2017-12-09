var express = require('express');
var router = express.Router();

router.get('/:uri', function(req, res, next) {
    var uri = req.params.uri;
    if(!req.session.Name && uri != 'login' && uri != 'register' && uri != 'forgot' && uri != 'logout')
        res.redirect('/');  // 메인화면으로 이동
    else if(uri == 'logout') {  // 로그아웃
        req.session.destroy();
        res.redirect('/');
    } else
        next();
});
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/forgot', require('./forgot'));
router.use('/confirm', require('./confirm'));
router.use('/mypage', require('./mypage'));
router.use('/resume', require('./resume'));
router.use('/changeinfo', require('./changeinfo'));
router.use('/changepwd', require('./changepwd'));
router.use('/orders', require('./orders'));

module.exports = router;
