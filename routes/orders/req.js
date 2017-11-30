var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.post('/:id', function(req, res, next) {
    var body = req.body;
    var total = 0;  // 총 점수을 저장할 변수

    var prefer = '';  // 우대조건을 저장할 변수
    if(Array.isArray(body.Preference)) {
        var leng = body.Preference.length;
        for (var i = 0; i < leng; i++) {
            total += 2; // 우대조건의 수 만큼 점수 추가
            prefer += body.Preference[i];  // 우대조건 추가
            if (i + 1 == leng)  // 마지막 우대조건이면
                break;
            prefer += '%&'; // 위 두 가지 경우가 아니면 구분자 '%&' 추가
        }
    } else if (body.Preference){ // 우대조건이 1개이면
        prefer = body.Preference;
    }

    pool.getConnection(function(err, connection) {
        var queryStr = 'SELECT * FROM resume WHERE _UID=?'
        connection.query(queryStr, req.session._UID, function(err, resume) {
            if(err) console.log("err: ", err);
            if (!resume[0]) {
                res.send('<script>alert("이력서를 작성해 주세요!");'
                          + 'window.location.replace("/resume");</script>');
                return;
            }
            total += resume[0].Score; // 총 점수에 평점 추가
            queryStr = 'SELECT _AID FROM application ORDER BY _AID DESC limit 1;';
            connection.query(queryStr, function(err, application) {
                if(err) console.log("err: ", err);
                // 데이터베이스의 application 테이블에 저장된 데이터가 없으면 2017000001 부터 시작
                var newId = (application[0] == null) ? 2017000001 : Number(application[0]._AID) + 1;  // 최근 _AID에 1한 값 저장
                var inputs = [newId, req.params.id, req.session._UID, prefer, total];
                queryStr = 'INSERT INTO application(_AID, _OID, _UID, CheckPre, TotalScore)'
                              + ' VALUES(?,?,?,?,?)'; // application Table에 지원 정보를 추가
                connection.query(queryStr, inputs, function(err, orders) {
                    if(err) console.log("err: ", err);
                    res.redirect('/info/' + req.params.id); // 해당 발주 페이지로 이동
                    connection.release();
                });
            });
        });
    });
});

router.delete('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'DELETE FROM application WHERE _OID=? AND _UID=?';
        connection.query(queryStr, [req.params.id, req.session._UID], function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/info/' + req.params.id);
            connection.release();
        });
    });
});
module.exports = router;
