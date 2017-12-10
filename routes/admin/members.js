var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

// 회원 정보 페이지를 불러온다
router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';  // user Table 조회
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            var ages = [];  // 나이를 저장할 배열
            for (var i = 0; i < rows.length; i++) { // 모든 사용자의 나이를 계산
                var d1 = rows[i].Birth.substring(0,4);
                var d2 = new Date().toISOString().substring(0,4);
                ages[i] = d2 - d1 + 1;
            }
            res.render('admin/members', { // 회원관리 페이지 렌딩
                data: rows, // user Table 데이터
                age: ages, // 나이정보
                session: req.session
            });
            connection.release();
        });
    });
});
// 특정 회원을 삭제한다
router.delete('/', function(req, res, next) {
    var queryStr = "DELETE FROM user WHERE _UID=?"; // user Table에서 파라미터로 전달받은 유저 삭제
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.body.uid, function(err, rows) {
            if(err) console.log("err: ", err);
            connection.release();
        });
    });
});

module.exports = router;
