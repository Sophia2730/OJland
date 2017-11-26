var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var fs = require('fs');

var admin;
router.get('/', function(req, res, next) {
    fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
        admin = JSON.parse(data);
    });
    res.render('user/login');
});

router.post('/', function(req, res, next) {
    var body = req.body;
    // 관리자 로그인 처리
    if (body.Email == admin.id && body.Password == decrypt(admin.password)) {
        req.session.Name = '관리자';
        req.session.UserType = 'AD';
        res.redirect('/admin');
        return;
    }

    var queryStr = "SELECT * FROM user WHERE Email=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, body.Email, function(err, rows) {
            if(err) console.log("err: ", err);
            else if (rows[0]) {
                if (body.Password == decrypt(rows[0].Password) && rows[0].Status == '1'){
                    req.session.Name = rows[0].Name;
                    req.session._UID = rows[0]._UID;
                    req.session.UserType = rows[0].UserType;
                    res.redirect('/main');
                } else if (rows[0].Status == '0') {
                    res.redirect('/login/check');
                } else {
                    res.redirect('/login/fail2');
                }
            } else {
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
