var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var encrypt = require('../../config.js').encrypt;
var decrypt = require('../../config.js').decrypt;

var user;
router.get('/', function(req, res, next) {
    var queryStr = "SELECT * FROM user WHERE _UID=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.session._UID, function(err, rows) {
            console.log(rows);
            if(err) {
                console.log("err: ", err);
            }
            user = rows[0];
            res.render('user/changepwd', {
                session: req.session,
                data: user
            });
            connection.release();
        });
    });
});

router.put('/', function (req, res, next) {
    var body = req.body;
    if(decrypt(user.Password) != body.pwd_current) {
        res.send('<script>alert("현재 비밀번호가 다릅니다!");' +
            'window.location.replace("/changepwd");</script>');
    } else if(body.pwd_change1 == body.pwd_change2) {
        if (body.pwd_change1.length < 8 || body.pwd_change1.length > 16) {
            res.send('<script>alert("8~16자리의 비밀번호를 입력해주세요.");' +
                'window.location.replace("/changepwd");</script>');
            return;
        }
        var queryUpdate = "UPDATE user SET Password=? WHERE _UID=?";
        pool.getConnection(function (err, connection) {
            connection.query(queryUpdate, [encrypt(body.pwd_change1), user._UID], function (err, rows) {
                if(err) {
                    console.log("err: ", err);
                }
                res.send('<script>alert("비밀번호가 변경되었습니다.");' +
                    'window.location.replace("/mypage");</script>');
                connection.release();
            });
        });
    } else {
        res.send('<script>alert("새로운 비밀번호가 서로 다릅니다!");' +
            'window.location.replace("/changepwd");</script>');
    }
});

module.exports = router;
