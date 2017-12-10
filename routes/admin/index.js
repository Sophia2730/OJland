var express = require('express');
var router = express.Router();

// 로그인 상태가 아니면 메인화면으로 이동
router.get('*', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');
    else
        next();
});
router.use('/changepwd', require('./changepwd')); // 비밀번호 변경
router.use('/members', require('./members')); // 회원 조회 및 삭제
router.use('/orders', require('./orders')); // 외주 조회 및 삭제
router.use('/statistics', require('./statistics')); // 회원 및 외주 통계

module.exports = router;
