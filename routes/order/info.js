var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

// 특정 발주 정보 페이지를 불러온다
router.get('/:oid', function(req, res, next) {
    var params = req.params;
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                // 특정 발주 조회
                connection.query('SELECT * FROM orders WHERE _OID=?', params.oid, function(err, orders) {
                    if(err) callback(err);
                    callback(null, orders[0]);
                });
            },
            function(order, callback) {
                // 해당 발주의 발주자 조회
                connection.query("SELECT * FROM user WHERE _UID=?", order._UID, function(err, users) {
                    if(err) callback(err);
                    callback(null, [order, users[0]]);
                });
            }
        ], function(err, results) {
            if(err) console.log(err);
            var date = moment(results[0].Time).format('YYYY/MM/DD');

            var prefer = [];  // 우대조건을 저장할 배열
            if (results[0].Preference) // 해당 발주의 우대조건이 존재하면
                prefer = results[0].Preference.split('%&');  // '%&'을 구분자로하여 분할

            res.render('order/info', {  // 발주 조회 페이지 렌딩
                data: results[0],  // 해당 발주 정보
                user: results[1], // 발주자 정보
                date: date,  // 해당 발주날짜
                preference: prefer, // 우대조건
                session: req.session // 접속자 정보
            });
            connection.release();
        });
    });
});
// 특정 발주에 대한 지원 여부를 전달한다
router.get('/check/:oid', function(req, res, next) {
    // application Table에서 현재 접속한 사용자가 해당 발주를 지원했는지 조회
    var queryStr = "SELECT * FROM application WHERE _OID=? AND _UID=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, [req.params.oid, req.session._UID], function(err, rows) {
            if (err) console.log(err);
            isReq = (rows[0]) ? true : false; // 해당 발주에 대한 지원 여부
            res.send(isReq);
            connection.release();
        });
    });
});
// 특정 발주에 대한 지원자 수를 전달한다
router.get('/num/:oid', function(req, res, next) {
    // 해당 발주를 몇명이 지원했는지 조회
    var queryStr = "SELECT count(*) AS cnt FROM application WHERE _OID=? AND Status<>'F'";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.params.oid, function(err, rows) {
            if (err) console.log(err);
            var count = (rows[0]) ? rows[0].cnt : 0;
            res.send({cnt: count});
            connection.release();
        });
    });
});
// 특정 발주를 삭제한다
router.delete('/:oid', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'DELETE FROM orders WHERE _OID=?'; // orders Table에서 파라미터로 전달받은 발주 삭제
        connection.query(queryStr, req.params.oid, function(err, rows) {
            if (err) console.log(err);
            res.send(true);
            connection.release();
        });
    });
});

module.exports = router;
