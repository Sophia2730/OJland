var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

// 수주자의 학부 정보를 전달한다
router.get('/colleage', function(req, res, next) {
      pool.getConnection(function(err, connection) {
          // 특정 유저의 학부 조회
          connection.query('SELECT Colleage FROM resume WHERE _UID=?', req.session._UID, function(err, rows) {
              if(err) console.log(err);
              res.send(rows[0].Colleage);
              connection.release();
          });
      });
});
// 사용자의 이력서 존재 여부를 전달한다
router.get('/resume', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        // 특정 유저의 이력서 조회
        connection.query('SELECT * FROM resume WHERE _UID=?', req.session._UID, function(err, rows) {
              if(err) console.log(err);
              if(rows[0])
                  res.send(true);
              else
                  res.send(false);
              connection.release();
        });
    });
});
// 특정 발주에 수주 요청을 한다
router.post('/:id', function(req, res, next) {
    var body = req.body;
    var total = 0;  // 총 점수을 저장할 변수
    var prefer = '';  // 우대조건을 저장할 변수
    if(Array.isArray(body.Preference)) {
        for (var i = 0; i < body.Preference.length; i++) {
            total += 2; // 우대조건의 수 만큼 점수 추가
            prefer += body.Preference[i];  // 우대조건 추가
            if (i + 1 == body.Preference.length)  // 마지막 우대조건이면
                break;
            prefer += '%&'; // 위 두 가지 경우가 아니면 구분자 '%&' 추가
        }
    } else if (body.Preference){ // 우대조건이 1개이면
        prefer = body.Preference;
    }

    pool.getConnection(function(err, connection) {
        async.parallel([
            function(callback) {
                // 특정 유저의 이력서 조회
                connection.query('SELECT * FROM resume WHERE _UID=?', req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    if (!rows[0]) {
                        res.send('<script>alert("이력서를 작성해 주세요!");'
                                  + 'window.location.replace("/resume");</script>');
                        return;
                    }
                    total += rows[0].Score; // 총 점수에 평점 추가
                    callback(null, rows);
                });
            },
            function(callback) {
                // 최근 지원번호 조회
                connection.query('SELECT _AID FROM application ORDER BY _AID DESC limit 1;', req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._AID) + 1;  // 최근 _AID에 1한 값 저장
                    callback(null, newId);
                });
            }
        ], function(err, results) {
            if(err) console.log('err: ', err);
            var inputs = [results[1], req.params.id, req.session._UID, prefer, total];
            // application Table에 지원 정보를 추가
            connection.query('INSERT INTO application(_AID,_OID,_UID,CheckPre,TotalScore) VALUES(?,?,?,?,?)', inputs, function(err) {
                if(err) console.log("err: ", err);
                connection.release();
            });
        });
    });
});
// 특정 발주의 수주 요청을 취소한다
router.delete('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        // 특정 지원 삭제
        var queryStr = 'DELETE FROM application WHERE _OID=? AND _UID=?';
        connection.query(queryStr, [req.params.id, req.session._UID], function(err, rows) {
            if(err) console.log("err: ", err);
            connection.release();
        });
    });
});
module.exports = router;
