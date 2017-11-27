var express = require('express');
var router = express.Router();
var fs = require('fs');
var encrypt = require('../../config.js').encrypt;
var decrypt = require('../../config.js').decrypt;

var admin;  // 관리자의 정보를 저장할 객체
router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    // admin.json 파일을 읽어와서 admin에 저장
    fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
        admin = JSON.parse(data);
    });
    res.render('admin/changepwd');  // 관리자 비밀번호 변경 페이지 렌딩
});

router.put('/', function (req, res, next) {
    var body = req.body;
    if(decrypt(admin.password) != body.pwd_current) { // 현재 비밀번호 불일치 시
        // 관리자 비밀번효 변경 페이지로 이동
        res.send('<script>alert("현재 비밀번호가 다릅니다!");' +
            'window.location.replace("/changepwd-admin");</script>');
    } else if(body.pwd_change1 == body.pwd_change2) { // 새 비밀번호와 비밀번호 확인이 일치 시
        if (body.pwd_change1.length < 8 || body.pwd_change1.length > 16) { // 비밀번호 길이가 8보다 작거나 16보다 크면
            // 관리자 비밀번호 변경 페이지로 이동
            res.send('<script>alert("8~16자리의 비밀번호를 입력해주세요.");' +
                'window.location.replace("/changepwd-admin");</script>');
            return;
        }
        admin.password = encrypt(body.pwd_change1); // admin 객체에 새로운 비밀번호를 암호화 하여 입력
        // admin 객체를 문자화하여 admin.json 파일에 저장
        fs.writeFile('public/data/admin.json', JSON.stringify(admin, null, 4), function(err) {
            if (err) console.log('err: ', err);
        });
        // 관리자 메인 페이지로 이동
        res.send('<script>alert("비밀번호가 변경되었습니다.");' +
            'window.location.replace("/admin");</script>');
    } else {  //
        // 관리자 비밀번호 변경 페이지로 이동
        res.send('<script>alert("새로운 비밀번호가 서로 다릅니다!");' +
            'window.location.replace("/changepwd-admin");</script>');
    }
});

module.exports = router;
