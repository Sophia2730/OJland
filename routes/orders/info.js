var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

var id; // 파라미터로 전달받은 발주의 _OID를 저장할 변수
var isReq = false;
router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                connection.query('SELECT * FROM orders WHERE _OID=?', id, function(err, orders) {
                    if(err) callback(err);
                    callback(null, orders[0]);
                });
            },
            function(order, callback) {
                connection.query('SELECT * FROM user WHERE _UID=?', order._UID, function(err, users) {
                    if(err) callback(err);
                    callback(null, order, users[0]);
                });
            },
            function(order, user, callback) {
                connection.query('SELECT * FROM application WHERE _OID=?', order._OID, function(err, apps) {
                    if(err) callback(err);
                    var prefer = [];  // 우대조건을 저장할 배열
                    if (order.Preference) // 해당 발주의 우대조건이 존재하면
                        prefer = order.Preference.split('%&');  // '%&'을 구분자로하여 분할
                    callback(null, [order, user, apps, prefer]);
                });
            }
        ], function(err, results) {
            if(err) console.log(err);
            res.render('order/order-info', {  // 발주 조회 페이지 렌딩
                data: results[0],  // 해당 발주 정보
                date: moment(results[0].Time).format('YYYY/MM/DD'),  // 해당 발주날짜
                user: results[1], // 발주자 정보
                apps: results[2], // 지원 정보
                reqNum: results[2].length,  // 지원자 수
                preference: results[3], // 우대조건
                session: req.session, // 접속자 정보
                isReq: isReq,  // 해당 발주에 대한 지원 여부
            });
            connection.release();
        });
    });
});

router.get('/:id', function(req, res, next) {
    id = req.params.id; // 파라미터로 전달 받은 발주의 _OID 저장
    // application Table에서 현재 접속한 사용자가 해당 발주를 지원했는지 조회
    var queryStr = "SELECT * FROM application WHERE _OID=? AND _UID=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, [id, req.session._UID], function(err, rows) {
            if (err) console.log('error: ', err);
            isReq = (rows[0]) ? true : false; // 해당 발주에 대한 지원 여부
            connection.release();
        });
    });
    res.redirect('/info');
});

router.delete('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'DELETE FROM orders WHERE _OID=?'; // orders Table에서 파라미터로 전달받은 발주 삭제
        connection.query(queryStr, id, function(err, rows) {
            if (err) console.log('error: ', err);
            res.redirect('/list');  // 발주 목록 페이지로 이동
            connection.release();
        });
    });
});

module.exports = router;
