var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    res.render('admin/admin');  // 관리자 메인 페이지 렌딩
});

module.exports = router;
