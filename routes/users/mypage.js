var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

var nid;
router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    } else if (req.session.UserType == 'AD') {
        res.redirect('/changepwd-admin');
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
            },
            function(callback) {
                connection.query("SELECT * FROM notice WHERE _UID=?", req.session._UID, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
            if (err) console.log('err: ', err);
            dates = [];
            for (var i = 0; i < results[4].length; i++) {
                dates[i] = moment(results[4][i].Time).format('YYYY/MM/DD HH:MM');
            }
            res.render('user/mypage', {
                user: results[0][0],
                order: results[1],
                resume: results[2][0],
                app: results[3],
                noti: results[4],
                session: req.session
            });
            connection.release();
        });
    });
});

router.put('/:nid', function(req, res, next) {
    // pool.getConnection(function(err, connection) {
        // var queryStr = 'DELETE FROM notice WHERE _OID=?'; // orders Table에서 파라미터로 전달받은 발주 삭제
        // connection.query(queryStr, id, function(err, users) {
        //     if (err) console.log('error: ', err);
        //     res.redirect('/list');  // 발주 목록 페이지로 이동
        //     connection.release();
        // });
        console.log(nid);
        res.redirect('/mypage');  // 발주 목록 페이지로 이동

    // });
});

router.delete('/:nid', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'DELETE FROM orders WHERE _OID=?'; // orders Table에서 파라미터로 전달받은 발주 삭제
        connection.query(queryStr, id, function(err, users) {
            if (err) console.log('error: ', err);
            res.redirect('/list');  // 발주 목록 페이지로 이동
            connection.release();
        });
    });
});

module.exports = router;
