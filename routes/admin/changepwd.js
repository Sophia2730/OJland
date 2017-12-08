var express = require('express');
var router = express.Router();
var fs = require('fs');
var encrypt = require('../../config.js').encrypt;
var decrypt = require('../../config.js').decrypt;

router.get('/', function(req, res, next) {
    // admin.json 파일을 읽어와서 admin에 저장
    fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
        var admin = JSON.parse(data);
        password = decrypt(admin.password);
        res.render('admin/changepwd', {
            password: password,
            session: req.session
        });
    });
});

router.put('/', function (req, res, next) {
    var body = req.body;
    // 관리자 정보를 json 형식으로 받아옴
    fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
        var admin = JSON.parse(data);
        admin.password = encrypt(body.pwd); // admin 객체에 새로운 비밀번호를 암호화 하여 입력
        // admin 객체를 문자화하여 admin.json 파일에 저장
        fs.writeFile('public/data/admin.json', JSON.stringify(admin, null, 4), function(err) {
            if (err) console.log(err);
        });
    });
});

module.exports = router;
