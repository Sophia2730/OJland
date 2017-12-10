var express = require('express');
var router = express.Router();

// 로그인 상태가 아니면 메인화면으로 이동
router.get('*', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});
router.use('/list', require('./list')); // 카테고리 별 발주 목록
router.use('/info', require('./info')); // 발주 상세정보
router.use('/post', require('./post')); // 신규 발주 등록
router.use('/put', require('./put')); // 발주 수정

module.exports = router;
