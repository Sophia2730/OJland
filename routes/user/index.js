var express = require('express');
var router = express.Router();

router.get('/:uri', function(req, res, next) {
    var uri = req.params.uri;
    // 로그인 상태가 아니면 메인화면으로 이동
    if(!req.session.Name && uri != 'login' && uri != 'register' && uri != 'forgot' && uri != 'logout')
        res.redirect('/');
    else if(uri == 'logout') {  // 로그아웃
        req.session.destroy();  // 세션을 파기한다
        res.redirect('/');
    } else
        next();
});
router.use('/login', require('./login')); // 로그인
router.use('/register', require('./register')); // 회원가입
router.use('/forgot', require('./forgot')); // 아이디 및 비밀번호 찾기
router.use('/confirm', require('./confirm')); // 가입승인
router.use('/mypage', require('./mypage')); // 마이페이지
router.use('/resume', require('./resume')); // 이력서 작성 및 수정
router.use('/changeinfo', require('./changeinfo')); // 개인정보 수정
router.use('/changepwd', require('./changepwd')); // 비밀번호 변경
router.use('/orders', require('./orders')); // 발주 및 수주내역 조회

module.exports = router;
