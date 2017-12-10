var express = require('express');
var router = express.Router();

// 메인 페이지를 불러온다
router.get('/', function(req, res, next) {
    res.render('user/main', {
        session: req.session
    });
});

module.exports = router;
