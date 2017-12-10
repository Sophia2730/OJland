var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

// 지원자의 정보를 제공
router.get('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                // 지원 정보를 점수 내림차순으로 조회
                queryStr = "SELECT * FROM application WHERE _OID=? AND Status='A'"
                          + " ORDER BY TotalScore DESC";
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                // 지원자의 개인정보, 이력서정보 조회
                queryStr = "select * from user as U JOIN resume as R where U._UID IN ("
                  + "select _UID from application AS A where _OID=? AND Status='A')"
                  + " AND R._UID IN (select _UID from resume where _UID = U._UID);"
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
              if(err) console.log(err);
              res.send({
                  apps: results[0],
                  users: results[1]
              });
              connection.release();
        });
    });
});

// 매칭 승인 시
router.put('/', function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                sendSuccess(body.id);
                // 특정 지원 상태를 매칭완료 상태로 변경
                connection.query("UPDATE application SET Status='B' WHERE _AID=?", body.id, function(err) {
                    if(err) callback(err);
                    callback(null);
                });
            },
            function(callback) {
                if(body.needNum == 0 || body.reqNum == 0) {
                    // 특정 발주의 상태를 매칭완료 상태로 변경
                    connection.query("UPDATE orders SET Status='C' WHERE _OID=?", body.oid, function(err) {
                        if(err) callback(err);
                        callback(null, true);
                    });
                } else {
                    callback(null, false);
                }
            },
            function(isEnd, callback) {
                if(isEnd) { // 매칭이 모두 끝나면
                    // 남은 지원자들을 조회
                    connection.query("SELECT _AID FROM application WHERE _OID=? AND Status='A'", body.oid, function(err, rows) {
                        if(err) callback(err);
                        callback(null, rows, true);
                    });
                } else {
                  callback(null, null, false);
                }
            },
            function(aids, isEnd, callback) {
                if(isEnd) { // 매칭이 모두 끝나면
                    var len = aids.length;
                    for (var i = 0; i < aids.length; i++) {
                        sendFail(aids[i]._AID); // 매칭 실패 알림 발송
                        // 남은 지원자들의 지원 상태를 매칭실패 상태로 변경
                        connection.query("UPDATE application SET Status='F' WHERE _AID=?", aids[i]._AID, function(err) {
                            if(err) callback(err);
                        });
                    }
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        ], function(err, result) {
            if(err) console.log(err);
            if(result)
                sendComplete(req.session._UID, body.oid); // 발주자에게 매칭완료 알림 발송
            connection.release();
        });
    });
});

// 매칭 거절 시
router.delete('/', function(req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                sendFail(body.aid); // 매칭실패 알림 전송
                // 특정 지원의 상태를 매칭실패 상태로 변경
                connection.query("UPDATE application SET Status='F' WHERE _AID=?", body.aid, function(err) {
                    if(err) callback(err);
                    callback(null);
                });
            },
            function(callback) {
                // 매칭 성공한 수주자의 수 조회
                connection.query("SELECT count(*) AS cnt FROM application WHERE _OID=? AND Status='B'", body.oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0].cnt);
                });
            },
            function(cnt, callback) {
                if(body.reqNum == 0 && cnt == 0) { // 지원자가 더 이상 없고 수주자가 존재하지 않으면
                    // 특정 발주의 상태를 매칭실패 상태로 변경
                    connection.query("UPDATE orders SET Status='F' WHERE _OID=?", body.oid, function(err) {
                        if(err) callback(err);
                    });
                    callback(null, 'null');
                } else if (body.reqNum == 0 && cnt > 0) { // 지원자가 더 이상 없고 수주자가 존재하면
                    // 특정 발주의 상태를 매칭완료 상태로 변경
                    connection.query("UPDATE orders SET Status='C' WHERE _OID=?", body.oid, function(err) {
                        if(err) callback(err);
                        queryStr = "SELECT _AID FROM application WHERE _OID=? AND Status='A'";
                        connection.query(queryStr, [body.aid, body.oid], function(err, rows) {
                            if(err) callback(err);
                            for (var i = 0; i < rows.length; i++) {
                                sendFail(rows[i]._AID); // 매칭실패 알림 발송
                            }
                            callback(null, 'comp');
                        });
                    });
                } else {
                    callback(null, 'success');
                }
            }
        ], function(err, result) {
            if(err) console.log(err);
            if(result == 'comp')  // 매칭완료 시
                sendComplete(req.session._UID, body.oid); // 발주자에게 매칭완료 알림 발송
            else if (result == 'null')  // 수주자가 아무도 없으면
                sendNull(req.session._UID, body.oid); // 발주자에게 매칭실패 알림 발송

            connection.release();
        });
    });
});
// 매칭 성공 알림을 보낸다
var sendSuccess = function(aid) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                // 사용자번호와 발주제목 조회
                queryStr = "SELECT U._UID, O.Title FROM user AS U JOIN orders AS O WHERE U._UID="
                          + "(SELECT _UID FROM application WHERE _AID=?)"
                          + " AND O._OID=(SELECT _OID FROM application WHERE _AID=?)";
                connection.query(queryStr, [aid, aid], function(err, rows) {
                    if(err) callback(err);
                    var uid = rows[0]._UID;
                    var title = rows[0].Title;
                    callback(null, {uid: uid, title: title});
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
            var mTitle = "매칭 성공 알림";
            var mContent = "[" + results[0].title + "]에 대한 매칭이 성공했습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], results[0].uid, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendSuccess(aid); // 재시도
                }
                connection.release();
            });
        });
    });
}
// 매칭 실패 알림을 보낸다
var sendFail = function(aid) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                // 사용자번호, 발주제목 조회
                queryStr = "SELECT U._UID, O.Title FROM user AS U JOIN orders AS O WHERE U._UID="
                          + "(SELECT _UID FROM application WHERE _AID=?)"
                          + " AND O._OID=(SELECT _OID FROM application WHERE _AID=?)";
                connection.query(queryStr, [aid, aid], function(err, rows) {
                    if(err) callback(err);
                    var uid = rows[0]._UID;
                    var title = rows[0].Title;
                    callback(null, {uid: uid, title: title});
                });
            },
            function(callback) {
                // 새로운 알림번호 조회
                connection.query("SELECT _NID FROM notice ORDER BY _NID DESC limit 1", function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._NID) + 1;
                    callback(null, newId);
                });
            }
        ], function(err, results) {
            if(err) console.log(err);
            var mTitle = "매칭 실패 알림";
            var mContent = "[" + results[0].title + "]에 대한 매칭이 실패했습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], results[0].uid, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendFail(aid);  // 재시도
                }
                connection.release();
            });
        });
    });
}
// 매칭 완료 알림을 보낸다
var sendComplete = function(uid, oid) {
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
            var mTitle = "매칭 완료 알림";
            var mContent = "[" + results[0] + "]에 대한 매칭이 완료되었습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], uid, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendComplete(uid, oid); // 재시도
                }
                connection.release();
            });
        });
    });
}
// 지원자 부재로 인한 매칭 실패 알림을 보낸다
var sendNull = function(uid, oid) {
    console.log("start Null: ", uid);
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
            var mTitle = "매칭 실패 알림";
            var mContent = "[" + results[0] + "]에 대한 수주자가 아무도 없어서 매칭이 실패했습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], uid, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendNull(uid, oid); // 재시도
                }
                connection.release();
            });
        });
    });
}

module.exports = router;
