var express = require('express');
var router = express.Router();
var fs = require('fs');
var pool = require('../../config.js').pool;

router.get('/:oid', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'SELECT * FROM orders WHERE _OID=?'; // 파라미터로 전달받은 발주 조회
        connection.query(queryStr, req.params.oid, function(err, rows) {
            if(err) console.log("err: ", err);
            var prefer = [];  // 우대조건을 저장할 배열
            if (rows[0].Preference) // 우선조건이 존재하면
                prefer = rows[0].Preference.split('%&');  // '%&'을 구분자로하여 분할
            fs.readFile('public/data/major.json', 'utf-8', function(err, data) {
                if(err) console.log(err);
                res.render('order/put', { // 발주 수정 페이지 렌딩
                    session: req.session, // 접속자 정보
                    major: JSON.parse(data),
                    data: rows[0],  // 해당 발주 정보
                    preference: prefer  // 우대조건 정보
                });
            });
            connection.release();
        });
    });
});

router.put('/:oid', function(req, res, next) {
    var body = req.body;
    var prefer = '';  // 우대조건을 저장할 변수
    if (Array.isArray(body.Preference)) {
        var leng = body.Preference.length;
        for (var i = 0; i < leng; i++) {
            prefer += body.Preference[i]; // i 번째 우대조건을 prefer에 저장
            if (i + 1  == leng) // 마지막 우선조건이면
                break;
            else if(body.Preference[i+1] != '') // 다음 조건이 존재하면
                prefer += '%&'; // 구분자 '%&' 추가
        }
    } else if (body.Preference) {
        prefer += body.Preference;
    }

    var queryStr = 'UPDATE orders SET Category=? ,Title=?, Colleage=? ,Cost=? ,Content=? ,Preference=? ,Period=? ,MaxNum=?'
                  + ' WHERE _OID=?';  // orders Table의 해당 발주 정보 수정
    var inputs = [body.Category, body.Title, body.Colleage, body.Cost,
                body.Content, prefer, body.Period, body.MaxNum, req.params.oid];
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, inputs, function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/order/info/' + req.params.oid);
            connection.release();
        });
    });
});

module.exports = router;
