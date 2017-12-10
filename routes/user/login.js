var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var fs = require('fs');
var async = require('async');

// 로그인 페이지를 불러온다
router.get('/', function(req, res, next) {
    res.render('user/login', {
        session: req.session
    });
});
// 사용자의 이름을 전달한다
router.get('/check', function(req, res, next) {
    res.send(req.session.Name);
});
// 세션을 생성하여 로그인 상태가 된다
router.post('/', function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                // 관리자 정보 읽기
                fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
                    if(err) callback(err);
                    callback(null, JSON.parse(data));
                });
            },
            function(callback) {
                // 입력한 이메일에 해당하는 사용자 조회
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
                res.send(true);
                return;
            }
            // 로그인
            req.session.Name = results[1].Name;
            req.session._UID = results[1]._UID;
            req.session.UserType = results[1].UserType;
            connection.release();
            res.send(true);
        });
    });
});
// 사용자가 입력한 이메일과 비밀번호를 체크한다
router.post('/check', function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        // 입력한 이메일과 일치하는 사용자의 비밀번호와 상태 조회
        connection.query("SELECT Password, Status FROM user WHERE Email=?", body.Email, function(err, rows) {
            if(err) console.log(err);
            else if(rows[0]) {
                var pwd = decrypt(rows[0].Password);  // DB에 저장된 비밀번호 복호화
                res.send([pwd, rows[0].Status]);
            } else if(body.Email == 'admin@gmail.com') {  // 관리자 이메일 입력 시
                fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
                    if(err) console.log(err);
                    pwd = decrypt((JSON.parse(data)).password);
                    res.send([pwd, 'AD']);
                });
            }
            else
                res.send(false);
            connection.release();
        });
    });
});

module.exports = router;
