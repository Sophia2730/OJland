var express = require('express');
var router = express.Router();

// 로그인 상태가 아니면 메인화면으로 이동
router.get('*', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});
router.use('/close', require('./close')); // 발주 마감
router.use('/match', require('./match')); // 발주자와 수주자를 매칭
router.use('/info', require('./info')); // 수주자의 정보 제공
router.use('/request', require('./request')); // 수주 요청

module.exports = router;
