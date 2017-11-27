var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
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
                age: ages // 나이정보
            });
            connection.release();
        });
    });
});

router.delete('/:id', function(req, res, next) {
    var queryStr = "DELETE FROM user WHERE _UID=?"; // user Table에서 파라미터로 전달받은 유저 삭제
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.params.id, function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/members'); // 회원관리 페이지로 이동
            connection.release();
        });
    });
});

module.exports = router;
