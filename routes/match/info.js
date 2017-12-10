var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

// 수주자 정보 조회
router.get('/:oid', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                // 특정 발주에 대한 수주자의 지원정보 조회
                queryStr = "SELECT * FROM application WHERE _OID=? AND Status='B'";
                connection.query(queryStr, req.params.oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                // 수주자의 개인정보, 이력서정보 조회
                queryStr = "select * from user as U JOIN resume as R where U._UID IN ("
                  + "select _UID from application AS A where _OID=? AND Status='B')"
                  + " AND R._UID IN (select _UID from resume where _UID = U._UID);"
                connection.query(queryStr, req.params.oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                // 특정 발주에 대한 수주자의 진척도 조회
                queryStr = "SELECT * FROM progress WHERE _OID=?";
                connection.query(queryStr, req.params.oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
              if(err) console.log(err);
              res.send({
                  uuuid: req.params.oid,
                  apps: results[0],
                  users: results[1],
                  progresses: results[2]
              });
              connection.release();
        });
    });
});

// 외주 완료 처리
router.post('/', function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                // 수주자의 평가점수 조회
                queryStr = "SELECT Score from resume WHERE _UID=?";
                connection.query(queryStr, body.uid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0].Score);
                });
            },
            function(score, callback) {
                var mScore = (score + Number(body.score)) / 2;
                // 수주자의 평가점수 변경
                queryStr = "UPDATE resume SET Score=? WHERE _UID=?";
                connection.query(queryStr, [mScore, body.uid], function(err) {
                    if(err) callback(err);
                    callback(null);
                });
            },
            function(callback) {
                // 수주자의 지원 상태를 '외주완료' 상태로 변경
                queryStr = "UPDATE application SET Status='C' WHERE _UID=? AND _OID=?";
                connection.query(queryStr, [body.uid, body.oid], function(err) {
                    if(err) callback(err);
                    sendEnd_EE(body.uid, body.oid); // 수주자에게 알림 전송
                    callback(null);
                });
            },
            function(callback) {
                // 외주진행 상태인 지원 정보 조회
                queryStr = "SELECT * FROM application WHERE _OID=? AND Status='B'";
                connection.query(queryStr, body.oid, function(err, rows) {
                    if(err) callback(err);
                    if(!rows[0]) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                });
            },
            function(isEnd, callback) {
                if (isEnd) {
                    // 외주의 상태를 외주완료 상태로 변경
                    queryStr = "UPDATE orders SET Status='D' WHERE _OID=?";
                    connection.query(queryStr, body.oid, function(err, rows) {
                        if(err) callback(err);
                        sendEnd_ER(body.oid); // 발주자에게 알림 전송
                    });
                }
                callback(null, true);
            }
        ], function(err, result) {
            if(err) console.log(err);
            res.send(result);
            connection.release();
        });
    });
});
// 발주자에게 외주 완료 알림을 보낸다
var sendEnd_EE = function(uid, oid) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                // 특정 발주의 제목 조회
                connection.query("SELECT Title FROM orders WHERE _OID=?", oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0].Title);
                });
            },
            function(callback) {
                // 최근 알림번호 조회
                connection.query("SELECT _NID FROM notice ORDER BY _NID DESC limit 1", function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._NID) + 1;
                    callback(null, newId);
                });
            }
        ], function(err, results) {
            if(err) console.log(err);
            var mTitle = "외주 완료 알림";
            var mContent = "회원님의 [" + results[0] + "] 외주가 완료되었습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], uid, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendEnd_EE(oid);  // 재시도
                }
                connection.release();
            });
        });
    });
}
// 수주자에게 외주 완료 알림을 보낸다
var sendEnd_ER = function(oid) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                // 특정 발주의 제목과 회원번호 조회
                connection.query("SELECT Title, _UID FROM orders WHERE _OID=?", oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0]);
                });
            },
            function(callback) {
                // 최근 알림번호 조회
                connection.query("SELECT _NID FROM notice ORDER BY _NID DESC limit 1", function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._NID) + 1;
                    callback(null, newId);
                });
            }
        ], function(err, results) {
            if(err) console.log(err);
            var mTitle = "외주 완료 알림";
            var mContent = "[" + results[0].Title + "] 외주가 완료되었습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], results[0]._UID, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendEnd_ER(oid);  // 재시도
                }
                connection.release();
            });
        });
    });
}
module.exports = router;
