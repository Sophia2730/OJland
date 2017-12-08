var express = require('express');
var main = require('./main');
var login = require('./login');
var register = require('./register');
var confirm = require('./confirm');
var forgot = require('./forgot');
var mypage = require('./mypage');
var changeinfo = require('./changeinfo');
var changepwd = require('./changepwd');
var orders = require('./orders');
var resume = require('./resume');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('user/index', {
        session: req.session
    });
});

router.get('/:uri', function(req, res, next) {
    var uri = req.params.uri;
    if(!req.session.Name && uri != 'login' && uri != 'register' && uri != 'forgot' && uri != 'logout')
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});
router.use('/login', login);
router.use('/main', main);
router.use('/register', register);
router.use('/forgot', forgot);
router.use('/mypage', mypage);
router.use('/resume', resume);
router.use('/changeinfo', changeinfo);
router.use('/changepwd', changepwd);
router.use('/orders', orders);

router.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
