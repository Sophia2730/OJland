var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

router.get('/:id', function(req, res, next) {
    var body = req.body;

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
              console.log(results);
              res.send({
                  apps: results[0],
                  users: results[1],
                  progresses: results[2]
              });
              connection.release();
        });
    });
});
module.exports = router;
