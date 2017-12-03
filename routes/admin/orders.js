var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    pool.getConnection(function(err, connection) {
        async.parallel([
            function(callback) {
                connection.query('SELECT * FROM user', function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query('SELECT * FROM orders', function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query('SELECT * FROM application', function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
            if(err) console.log(err);
            var dates = []; // 발주날짜를 저장할 배열
            var names = []; // 발주자의 이름을 저장할 배열
            var reqNums = []; // 지원자의 수를 저장할 배열
            for (var i = 0; i < results[1].length; i++) { // 모든 발주를 검사
                reqNums[i] = 0; // 초기화
                // 날짜를 'YYYY/MM/DD' 형식으로 변환
                dates[i] = moment(results[1][i].Time).format('YYYY/MM/DD');
                // 발주의 _UID를 통해 발주자의 이름을 불러온다
                for (var j = 0; j < results[0].length; j++) {  // 모든 사용자를 검사
                    if (results[0][j]._UID == results[1][i]._UID) {  // orders Table의 _UID와 user Table의 _UID가 일치하면
                        names[i] = results[0][j].Name; // names에 이름 저장
                    }
                }
                for (var j = 0; j < results[2].length; j++) {  // 모든 지원을 검사
                    if (results[2][j]._OID == results[1][i]._OID) {  // application의 _OID와 orders의 _OID가 일치하면
                        reqNums[i]++; // reqNums에 1 추가
                    }
                }
            }
            res.render('admin/orders', {  // 발주관리 페이지 렌딩
                data: results[1], // orders Table 데이터
                reqNum: reqNums,  // 지원자 수
                date: dates,  // 발주날짜
                name: names   // 발주자 이름
            });
            connection.release();
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
