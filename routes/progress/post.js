var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

router.post('/:id', function(req, res, next) {
    var body = req.body;
    var imgUrl = ''; // imageUrl을 저장할 변수
    var leng = body.File.length;  // file의 길이를 받는다
    for (var i = 0; i < leng; i++) {  // imageUrl을 '%&'을 구분자로하여 문자열로 저장
        imgUrl += body.File[i];
        if (i + 1 == leng)  // 마지막 파일이면
          break;
        else if (body.File[i+1] == null)  // 다음 파일이 없으면
          break;
        imgUrl += '%&';
    }
    pool.getConnection(function(err, connection) {
        var queryStr = "SELECT _PID FROM progress ORDER BY DESC limit 1"; // progress Table의 최근 _PID값 조회
        connection.query(queryStr, inputs, function(err, progress) {
            if(err) console.log("err: ", err);
            var newId = (progress[0]._PID == null) ? 2017000001 : Number(progress[0]._PID) + 1; // 최근 _PID 값 + 1 저장
            var inputs = [newId, req.session._UID, req.params.id, body.Title, body.Content, imgUrl];
            queryStr = "INSERT INTO progress(_PID, _UID, _OID, Title, Content, ImageUrl)"
                          + " VALUES(?,?,?,?,?,?)"; // progress Table에 데이터 삽입
            connection.query(queryStr, inputs, function(err) {
                if(err) console.log("err: ", err);
                res.redirect('/info/' + req.params.id);  // 발주 목록 페이지로 이동
                connection.release();
            });
        });
    });
});

module.exports = router;
