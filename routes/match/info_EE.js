var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

router.get('/:id', function(req, res, next) {

    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                queryStr = "SELECT * FROM application WHERE _OID=? AND Status='B'";
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                queryStr = "select * from user as U JOIN resume as R where U._UID IN ("
                  + "select _UID from application AS A where _OID=? AND Status='B')"
                  + " AND R._UID IN (select _UID from resume where _UID = U._UID);"
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                queryStr = "SELECT * FROM progress WHERE _OID=?";
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
              if(err) console.log(err);
              res.send({
                  uuuid: req.params.id,
                  apps: results[0],
                  users: results[1],
                  progresses: results[2]
              });
              connection.release();
        });
    });
});

router.post('/', function(req, res, next) {
    var body = req.body;
    console.log('body: ', body);
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                queryStr = "SELECT Score from resume WHERE _UID=?";
                connection.query(queryStr, body.uid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0].Score);
                });
            },
            function(score, callback) {
                var mScore = (score + Number(body.score)) / 2;
                queryStr = "UPDATE resume SET Score=? WHERE _UID=?";
                connection.query(queryStr, [mScore, body.uid], function(err) {
                    if(err) callback(err);
                    callback(null);
                });
            },
            function(callback) {
                queryStr = "UPDATE application SET Status='C' WHERE _UID=? AND _OID=?";
                connection.query(queryStr, [body.uid, body.oid], function(err) {
                    if(err) callback(err);
                    sendEnd_EE(body.uid, body.oid);
                    callback(null);
                });
            },
            function(callback) {
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
                    queryStr = "UPDATE orders SET Status='D' WHERE _OID=?";
                    connection.query(queryStr, body.oid, function(err, rows) {
                        if(err) callback(err);
                        sendEnd_ER(body.oid);
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

var sendEnd_EE = function(uid, oid) {
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
            var mTitle = "외주 완료 알림";
            var mContent = "회원님의 [" + results[0] + "] 외주가 완료되었습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], uid, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendEnd_EE(oid);
                }
                connection.release();
            });
        });
    });
}

var sendEnd_ER = function(oid) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                connection.query("SELECT Title, _UID FROM orders WHERE _OID=?", oid, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0]);
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
            var mTitle = "외주 완료 알림";
            var mContent = "[" + results[0].Title + "] 외주가 완료되었습니다!";
            queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
            inputs = [results[1], results[0]._UID, mTitle, mContent];
            connection.query(queryStr, inputs, function(err) {
                if(err) {
                    console.log(err);
                    sendEnd_ER(oid);
                }
                connection.release();
            });
        });
    });
}
module.exports = router;
