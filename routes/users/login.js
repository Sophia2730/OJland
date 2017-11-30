var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var fs = require('fs');
var async = require('async');

router.get('/', function(req, res, next) {
    res.render('user/login');
});

router.post('/', function(req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
                    if(err) callback(err);
                    callback(null, JSON.parse(data));
                });
            },
            function(callback) {
                connection.query("SELECT * FROM user WHERE Email=?", body.Email, function(err, rows) {
                    if(err) callback(err)
                    callback(null, rows[0]);
                });
            }
        ], function(err, results) {
            if(err) console.log('err: ', err);
            // 관리자 로그인 처리
            if (body.Email == results[0].id && body.Password == decrypt(results[0].password)) {
                req.session.Name = '관리자';
                req.session.UserType = 'AD';
                res.redirect('/admin');
                return;
            }
            // 사용자 로그인 처리
            if (results[1]) { // 존재하는 이메일 이면
                if (body.Password == decrypt(results[1].Password)){ // 비밀번호가 일치하면
                    if (results[1].Status == '0') {  // 가입대기 상태이면
                        res.redirect('/login/check');
                    } else {  // 가입승인 상태면 로그인 성공
                        req.session.Name = results[1].Name;
                        req.session._UID = results[1]._UID;
                        req.session.UserType = results[1].UserType;
                        res.redirect('/main');
                    }
                } else {    // 비밀번호를 틀리면
                    res.redirect('/login/fail2');
                }
            } else {  // 존재하지 않는 이메일 이면
                res.redirect('/login/fail1');
            }
            connection.release();
        });
    });
});

router.get('/check', function(req, res, next) {
  res.send('<script>alert("인증 메일을 확인해 주세요!");' +
          'window.location.replace("/login");</script>');
});

router.get('/fail1', function(req, res, next) {
  res.send('<script>alert("아이디가 존재하지 않습니다!");' +
          'window.location.replace("/login");</script>');
});

router.get('/fail2', function(req, res, next) {
  res.send('<script>alert("비밀번호가 틀립니다!");' +
          'window.location.replace("/login");</script>');
});

module.exports = router;
