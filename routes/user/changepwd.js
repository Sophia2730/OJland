var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var encrypt = require('../../config.js').encrypt;
var decrypt = require('../../config.js').decrypt;
var async = require('async');

// 비밀번호 변경 페이지를 보여준다
router.get('/', function(req, res, next) {
    res.render('user/changepwd', {
        session: req.session
    });
});
// 특정 사용자의 비밀번호 정보를 전달한다
router.post('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        // 특정 사용자의 비밀번호 조회
        connection.query("SELECT Password FROM user WHERE _UID=?", req.session._UID, function(err, rows) {
            if(err) console.log(err);
            res.send(decrypt(rows[0].Password));
            connection.release();
        });
    });
});
// 특정 사용자의 비밀번호를 변경한다
router.put('/', function (req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        // 특정 사용자의 비밀번호 변경
        var queryUpdate = "UPDATE user SET Password=? WHERE _UID=?";
        connection.query(queryUpdate, [encrypt(body.pwd), req.session._UID], function (err) {
            if(err) console.log(err);
            connection.release();
        });
    });
});

module.exports = router;
