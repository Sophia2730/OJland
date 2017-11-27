var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    pool.getConnection(function(err, connection) {
        var queryStr = 'SELECT * FROM user';  // user Table을 조회
        connection.query(queryStr, function(err, users) {
            if(err) console.log("err: ", err);
            queryStr = 'SELECT * FROM orders';  // orders Table을 조회
            connection.query(queryStr, function(err, orders) {
                if(err) console.log("err: ", err);
                var dates = []; // 발주날짜를 저장할 배열
                var names = []; // 발주자의 이름을 저장할 배열
                for (var i = 0; i < orders.length; i++) { // 모든 발주를 검사
                    // 날짜를 'YYYY/MM/DD' 형식으로 변환
                    dates[i] = moment(orders[i].Time).format('YYYY/MM/DD');
                    // 발주의 _UID를 통해 발주자의 이름을 불러온다
                    for (var j = 0; j < users.length; j++) {  // 모든 사용자를 검사
                        if (users[j]._UID == orders[i]._UID) {  // orders Table의 _UID와 user Table의 _UID가 일치하면
                            names[i] = users[j].Name; // names에 이름 저장
                        }
                    }
                }
                res.render('admin/orders', {  // 발주관리 페이지 렌딩
                    data: orders, // orders Table 데이터
                    reqNum: '0',  // 지원자 수
                    date: dates,  // 발주날짜
                    name: names   // 발주자 이름
                });
                connection.release();
            });
        });
    });
});

router.delete('/:id', function(req, res, next) {
    var queryStr = "DELETE FROM orders WHERE _OID=?"; // orders Table에서 파라미터로 받은 발주를 삭제
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.params.id, function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/orders');  // 발주관리 페이지로 이동
            connection.release();
        });
    });
});

module.exports = router;
