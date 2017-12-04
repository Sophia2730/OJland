var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

router.get('/:id', function(req, res, next) {

    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                queryStr = "SELECT * FROM application WHERE _OID=? AND Status<>'F'"
                          + " ORDER BY TotalScore DESC";
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                queryStr = "select * from user as U JOIN resume as R where U._UID IN ("
                  + "select _UID from application AS A where _OID=? AND Status<>'F')"
                  + " AND R._UID IN (select _UID from resume where _UID = U._UID);"
                connection.query(queryStr, req.params.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
              if(err) console.log(err);
              console.log(results);
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

    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                connection.query("UPDATE application SET Status='B' WHERE _AID=?", body.id, function(err) {
                    if(err) callback(err);
                    callback(null);
                });
            },
            function(callback) {
                connection.query("SELECT _OID FROM application WHERE _AID=?", body.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0]._OID);
                });
            },
            function(oid, callback) {
                if(body.needNum == 0 || body.reqNum == 0) {
                    connection.query("UPDATE orders SET Status='C' WHERE _OID=?", oid, function(err) {
                        if(err) callback(err);
                        callback(null, oid);
                    });
                } else {
                    callback(null, 'success');
                }
            }
        ], function(err, result) {
            if(err) console.log(err);
            if(body.needNum == 0)
                res.redirect('/info/' + result);
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
                connection.query("SELECT _OID FROM application WHERE _AID=?", body.id, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0]._OID);
                });
            },
            function(oid, callback) {
                if(body.reqNum == 0) {
                    connection.query("UPDATE orders SET Status='C' WHERE _OID=?", oid, function(err) {
                        if(err) callback(err);
                        callback(null, oid);
                    });
                } else {
                    callback(null, 'success');
                }
            }
        ], function(err, result) {
            if(err) console.log(err);
            if(body.reqNum == 0)
                res.redirect('/info/' + result);
            connection.release();
        });
    });
});

module.exports = router;
