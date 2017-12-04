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
                    callback(null);
                });
            },
            function(callback) {
                queryStr = "SELECT count(*) AS cnt FROM application WHERE _OID=? AND Status='B'";
                connection.query(queryStr, body.oid, function(err, rows) {
                    if(err) callback(err);
                    if(rows[0].cnt == 0) {
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

module.exports = router;
