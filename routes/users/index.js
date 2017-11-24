var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    req.session.destroy();
    res.render('user/index');
});

router.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.send('<script>alert("로그아웃 되었습니다!");' +
            'window.location.replace("/");</script>');
});

module.exports = router;
