var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    res.render('order/order-post', {
        session: req.session
    });
});

router.post('/', function(req, res, next) {
    var body = req.body;

    var prefer = '';  // 우대조건을 저장할 변수
    if (Array.isArray(body.Preference)) {
        var leng = body.Preference.length;  // 우대조건의 갯수
        for (var i = 0; i < leng; i++) {
            prefer += body.Preference[i]; // i 번째 우대조건을 prefer에 저장
            if (i + 1  == leng) // 마지막 우선조건이면
                break;
            else if(body.Preference[i+1] != '') // 다음 조건이 존재하면
                prefer += '%&'; // 구분자 '%&' 추가
        }
    } else if (body.Preference) {
        prefer = body.Preference;
    }

    pool.getConnection(function(err, connection) {
        var queryStr = 'SELECT _OID FROM orders ORDER BY _OID DESC limit 1';  // orders Table 마지막 _OID 조회
        connection.query(queryStr, function(err, orders) {
            if(err) console.log("err: ", err);
            var newId = (orders[0]._OID == null) ? 2017000001 : Number(orders[0]._OID) + 1; // 최근 _OID 값 + 1 저장
            var inputs = [newId, req.session._UID, body.Category, body.Title, body.Colleage, body.Cost,
                        body.Content, prefer, body.Period, body.MaxNum];  // orders Table에 저장할 값들
            queryStr = 'INSERT INTO orders(_OID,_UID,Category,Title,Colleage,Cost,Content,Preference,Period,MaxNum)'
                          + ' VALUES(?,?,?,?,?,?,?,?,?,?)'; // orders Table에 데이터를 삽입
            pool.getConnection(function(err, connection) {
                connection.query(queryStr, inputs, function(err, rows) {
                    if(err) console.log("err: ", err);
                    res.redirect('/list');  // 발주 목록 페이지로 이동
                    connection.release();
                });
            });
        });
    });

});

module.exports = router;
