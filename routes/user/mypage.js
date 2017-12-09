var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

var nid;
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                connection.query("SELECT * FROM user WHERE _UID=?", req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query("SELECT * FROM orders WHERE _UID=?", req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query("SELECT * FROM resume WHERE _UID=?", req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query("SELECT * FROM application WHERE _UID=?", req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query("SELECT * FROM notice WHERE _UID=?", req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
            if (err) console.log('err: ', err);
            var dates = [];
            for (var i = 0; i < results[4].length; i++) {
                dates[i] = moment(results[4][i].Time).format('YYYY-MM-DD HH:mm');
            }

            res.render('user/mypage', {
                user: results[0][0],
                order: results[1],
                resume: results[2][0],
                app: results[3],
                noti: results[4],
                dates: dates,
                session: req.session
            });
            connection.release();
        });
    });
});

router.put('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = "UPDATE notice SET Status = 1 WHERE _NID='" + req.body.nid + "';";
        connection.query(queryStr, function(err, users) {
            if (err) console.log('error: ', err);
            res.redirect('/user/mypage');
            connection.release();
        });
    });
});

router.delete('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = "DELETE FROM notice WHERE _NID='" + req.body.nid + "';";
        connection.query(queryStr, function(err, users) {
            if (err) console.log('error: ', err);
            connection.release();
        });
    });
});

module.exports = router;
