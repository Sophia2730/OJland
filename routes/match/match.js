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

router.put('/', function(req, res, next) {
    var body = req.body;
    console.log("body: ", body);
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
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
                if(isEnd) {
                    for (var i = 0; i < aids.length; i++) {
                        connection.query("UPDATE application SET Status='F' WHERE _AID=?", aids[i]._AID, function(err, rows) {
                            if(err) callback(err);
                        });
                    }
                }
                callback(null, 'success');
            }
        ], function(err, result) {
            if(err) console.log(err);
            connection.release();
        });
    });
});

router.delete('/', function(req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
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
                    });
                } else if (body.reqNum == 0 && cnt > 0) { // 지원자가 더 이상 없고 수주자가 존재하면
                    connection.query("UPDATE orders SET Status='C' WHERE _OID=?", body.oid, function(err) {
                        if(err) callback(err);
                    });
                }
                callback(null, 'success');
            }
        ], function(err, result) {
            if(err) console.log(err);
            connection.release();
        });
    });
});

module.exports = router;
