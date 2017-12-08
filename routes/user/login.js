var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var fs = require('fs');
var async = require('async');

router.get('/', function(req, res, next) {
    res.render('user/login', {
        session: req.session
    });
});

router.get('/check', function(req, res, next) {
    res.send(req.session.Name);
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
                res.sendStatus(200);
                return;
            }
            // 로그인
            req.session.Name = results[1].Name;
            req.session._UID = results[1]._UID;
            req.session.UserType = results[1].UserType;
            res.sendStatus(200);
            connection.release();
        });
    });
});

router.post('/check', function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        connection.query("SELECT Password, Status FROM user WHERE Email=?", body.Email, function(err, rows) {
            if(err) console.log(err);
            else if(rows[0]) {
                var pwd = decrypt(rows[0].Password);
                res.send([pwd, rows[0].Status]);
            } else if(body.Email == 'admin@gmail.com') {
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
