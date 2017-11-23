var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var encrypt = require('../../config.js').encrypt;

router.get('/', function(req, res, next) {
    req.session.Email = 'admin@gmail.com';
    var queryStr = "SELECT * FROM user WHERE Email='" + req.session.Email + "';";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            console.log(rows);
            if(err) {
                console.log("err: ", err);
            } else {
                res.render('changepwd', {
                    data: rows[0]
                });
            }
            connection.release();
        });
    });
});

router.put('/', function (req, res, next) {
    req.session.Email = '123@gc.gachon.ac.kr';
    var queryStr = "SELECT * FROM user WHERE Email='" + req.session.Email + "' and Password = '" + encrypt(req.body.pwd_current) + "';";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            console.log(rows);
            if(err) {
                console.log("err: ", err);
            } else {
                console.log(rows.length)
                if(rows.length == 0) {
                    res.send('<script>alert("현재 비밀번호가 다릅니다!");' +
                        'window.location.replace("/changepwd");</script>');
                } else {
                    console.log(req.body.pwd_change1, req.body.pwd_change2);
                    if(req.body.pwd_change1 == req.body.pwd_change2) {
                        queryUpdate = "UPDATE user SET Password = '" + encrypt(req.body.pwd_change1) + "' WHERE Email ='" + req.session.Email + "';";
                        pool.getConnection(function (err, connection) {
                            connection.query(queryUpdate, function (err, rows) {
                                if(err) {
                                    console.log("err: ", err);
                                }
                                connection.release();
                                res.send('<script>alert("비밀번호가 변경되었습니다.");' +
                                    'window.location.replace("/mypage");</script>');
                            });
                        });
                    } else {
                        res.send('<script>alert("비밀번호 확인이 서로 다릅니다!");' +
                            'window.location.replace("/changepwd");</script>');
                    }
                }
            }
            connection.release();
        })
    });
});

module.exports = router;
