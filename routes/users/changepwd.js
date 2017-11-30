var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var encrypt = require('../../config.js').encrypt;
var decrypt = require('../../config.js').decrypt;
var async = require('async');

var user;
router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    }
    res.render('user/changepwd', {
        session: req.session
    });
});

router.put('/', function (req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                connection.query("SELECT _UID, Password FROM user WHERE _UID=?", req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0]);
                });
            },
            function(arg1, callback) {
                if(decrypt(arg1.Password) != body.curPwd) {  // 현재 비밀번호가 틀리면
                    res.send('<script>alert("현재 비밀번호를 틀렸습니다!");' +
                        'window.location.replace("/changepwd");</script>');
                    callback(null, false);
                } else // 입력 값이 모두 정상이면
                    callback(null, true);
            }
        ], function(err, result) {
            if(err) console.log('err: ', err);
            if(result) {  // true이면
                var queryUpdate = "UPDATE user SET Password=? WHERE _UID=?";
                connection.query(queryUpdate, [encrypt(body.pwd1), req.session._UID], function (err) {
                    if(err) callback(err);
                    res.send('<script>alert("비밀번호가 변경되었습니다.");' +
                        'window.location.replace("/mypage");</script>');
                });
            }
            connection.release();
        });
    });
});

module.exports = router;
