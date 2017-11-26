var express = require('express');
var router = express.Router();
var fs = require('fs');
var encrypt = require('../../config.js').encrypt;
var decrypt = require('../../config.js').decrypt;

var admin;
router.get('/', function(req, res, next) {
    fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
        admin = JSON.parse(data);
    });
    res.render('admin/changepwd');
});

router.put('/', function (req, res, next) {
    var body = req.body;
    if(decrypt(admin.password) != body.pwd_current) {
        res.send('<script>alert("현재 비밀번호가 다릅니다!");' +
            'window.location.replace("/changepwd-admin");</script>');
    } else if(body.pwd_change1 == body.pwd_change2) {
        if (body.pwd_change1.length < 8 || body.pwd_change1.length > 16) {
            res.send('<script>alert("8~16자리의 비밀번호를 입력해주세요.");' +
                'window.location.replace("/changepwd-admin");</script>');
            return;
        }
        admin.password = encrypt(body.pwd_change1);
        fs.writeFile('public/data/admin.json', JSON.stringify(admin, null, 4), function(err) {
            if (err) console.log('err: ', err);
        });
        res.send('<script>alert("비밀번호가 변경되었습니다.");' +
            'window.location.replace("/admin");</script>');
    } else {
        res.send('<script>alert("새로운 비밀번호가 서로 다릅니다!");' +
            'window.location.replace("/changepwd-admin");</script>');
    }
});

module.exports = router;
