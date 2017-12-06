var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

router.get('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                queryStr = "SELECT * FROM application WHERE _OID=? AND Status='A'"
                          + " ORDER BY TotalScore DESC";
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
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
                connection.query("UPDATE application SET Status='B' WHERE _AID=?", body.id, function(err) {
                    if(err) callback(err);
                    callback(null);
                });
            },
            function(callback) {
                if(body.needNum == 0 || body.reqNum == 0) {
                    connection.query("UPDATE orders SET Status='C' WHERE _OID=?", body.oid, function(err) {
                        if(err) callback(err);
                        callback(null, true);
                    });
                } else {
                    callback(null, false);
                }
            },
            function(isEnd, callback) {
                if(isEnd) {
                    connection.query("SELECT _AID FROM application WHERE _OID=? AND Status='A'", body.oid, function(err, rows) {
                        if(err) callback(err);
                        callback(null, rows, true);
                    });
                } else {
                  callback(null, null, false);
                }
            },
            function(aids, isEnd, callback) {
                console.log('a');
                if(isEnd) {
                    var len = aids.length;
                    for (var i = 0; i < aids.length; i++) {
                        sendFail(aids[i]._AID);
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
                sendComplete(req.session._UID, body.oid);
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
                sendFail(body.id);
                connection.query("UPDATE application SET Status='F' WHERE _AID=?", body.id, function(err) {
                    if(err) callback(err);
                    callback(null);
                });
            },
            function(callback) {
                  connection.query("SELECT count(*) AS cnt FROM application WHERE _OID=? AND Status='B'", body.oid, function(err, rows) {
                      if(err) callback(err);
                      callback(null, rows[0].cnt);
                  });
            },
            function(cnt, callback) {
                if(body.reqNum == 0 && cnt == 0) { // 지원자가 더 이상 없고 수주자가 존재하지 않으면
                    connection.query("UPDATE orders SET Status='F' WHERE _OID=?", body.oid, function(err) {
                        if(err) callback(err);
                        callback(null, 'null');
                    });
                } else if (body.reqNum == 0 && cnt > 0) { // 지원자가 더 이상 없고 수주자가 존재하면
                    connection.query("UPDATE orders SET Status='C' WHERE _OID=?", body.oid, function(err) {
                        if(err) callback(err);
                        queryStr = "SELECT _AID FROM application WHERE _OID=? AND Status='A'";
                        connection.query(queryStr, [body.id, body.oid], function(err, rows) {
                            if(err) callback(err);
                            for (var i = 0; i < rows.length; i++) {
                                sendFail(rows[i]._AID);
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
            if(result == 'comp')
                sendComplete(req.session._UID, body.oid);
            else if (result == 'null')
                sendNull(req.session._UID, body.oid);

            connection.release();
        });
    });
});

var sendSuccess = function(aid) {
    console.log("start Success: ", aid);
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
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
                    sendSuccess(aid);
                }
                connection.release();
            });
        });
    });
}

var sendFail = function(aid) {
    console.log("start Fail: ", aid);
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
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
                connection.query("SELECT _NID FROM notice ORDER BY _NID DESC limit 1", function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._NID) + 1;
                    callback(null, newId);
                });
            }
        ], function(err, results) {
            if(err) console.log(err);
            console.log('sendFail: ', results);
            var mTitle = "매칭 실패 알림";
            var mContent = "[" + results[0].title + "]에 대한 매칭이 실패했습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], results[0].uid, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendFail(aid);
                }
                connection.release();
            });
        });
    });
}

var sendComplete = function(uid, oid) {
    console.log("start Com: ", uid);
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                connection.query("SELECT Title FROM orders WHERE _OID=?", oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0].Title);
                });
            },
            function(callback) {
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
                    sendComplete(uid, oid);
                }
                connection.release();
            });
        });
    });
}

var sendNull = function(uid, oid) {
    console.log("start Null: ", uid);
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                connection.query("SELECT Title FROM orders WHERE _OID=?", oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0].Title);
                });
            },
            function(callback) {
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
                    sendNull(uid, oid);
                }
                connection.release();
            });
        });
    });
}

module.exports = router;
