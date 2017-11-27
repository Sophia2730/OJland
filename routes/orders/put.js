var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

var id; // 파라미터로 전달받은 _OID를 저장할 변수
var order;  // 발주 정보를 저장할 객체
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'SELECT * FROM orders WHERE _OID=?'; // 파라미터로 전달받은 발주 조회
        connection.query(queryStr, id, function(err, rows) {
            if(err) console.log("err: ", err);
            order = rows[0];  // 해당 발주 정보를 저장
            var prefer = [];  // 우대조건을 저장할 배열
            if (rows[0].Preference != null) { // 우선조건이 존재하면
              prefer = rows[0].Preference.split('%&');  // '%&'을 구분자로하여 분할
            }
            res.render('order/order-put', { // 발주 수정 페이지 렌딩
                session: req.session, // 접속자 정보
                data: rows[0],  // 해당 발주 정보
                preference: prefer  // 우대조건 정보
            });
            connection.release();
        });
    });
});

router.get('/:id', function(req, res, next) {
    id = req.params.id; // 파라미터로 전달받은 _OID를 저장
    res.redirect('/put'); // 발주 수정 페이지로 이동
});

router.put('/', function(req, res, next) {
    var body = req.body;
    var prefer = '';  // 우대조건을 저장할 변수
    var leng = body.Preference.length;
    for (var i = 0; i < leng; i++) {
        prefer += body.Preference[i]; // i 번째 우대조건을 prefer에 저장
        if (i + 1  == leng) // 마지막 우선조건이면
            break;
        else if (body.Preference[i+1] != '')  // 다음 우선 조건이 ''이면
            break;
        prefer += '%&'; // 위 두 가지 경우가 아니면 구분자 '%&' 추가
    }
    var queryStr = 'UPDATE orders SET Category=? ,Title=?, Colleage=? ,Cost=? ,Content=? ,Preference=? ,Period=? ,MaxNum=?'
                  + ' WHERE _OID=?';  // orders Table의 해당 발주 정보 수정
    var inputs = [body.Category, body.Title, body.Colleage, body.Cost,
                body.Content, prefer, body.Period, body.MaxNum, order._OID];
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, inputs, function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/list');  // 발주 목록 페이지로 이동
            connection.release();
        });
    });
});

module.exports = router;
