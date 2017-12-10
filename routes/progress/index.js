var express = require('express');
var router = express.Router();

// 로그인 상태가 아니면 메인화면으로 이동
router.get('*', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});
router.use('/post', require('./post')); // 외주에 대한 진척도 등록
router.use('/list', require('./list')); // 수주자가 등록한 진척도 목록
router.use('/info', require('./info')); // 진척도 상세정보

module.exports = router;
