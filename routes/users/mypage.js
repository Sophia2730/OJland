var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    }
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
            }
        ], function(err, results) {
            if (err) console.log('err: ', err);
            res.render('user/mypage', {
                user: results[0][0],
                order: results[1],
                resume: results[2][0],
                app: results[3],
                session: req.session
            });
            connection.release();
        });
    });
});

module.exports = router;
