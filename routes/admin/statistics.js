var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');
var moment = require('moment');
var d = new Date();

var d1 = d.getFullYear() + "-" + (d.getMonth() + 1);
var d2 = d1 + "-" + d.getDate();
if(d.getDate() < 10){
    d2 = d1 + "-0" + d.getDate();
} else {
    d2 = d1 + "-" + d.getDate();
}

router.get('/', function(req, res, next) {
    if (req.session.UserType != 'AD') {  // 관리자 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }

    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                connection.query("SELECT UserType, count(*) as cnt FROM user WHERE Status=1 GROUP BY UserType;", function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query("SELECT Time FROM orders;", function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query("SELECT count(*) as cnt FROM user WHERE Status=1 AND RegTime LIKE '%" + d1 +"%';", function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            },
            function(callback) {
                connection.query("SELECT count(*) as cnt FROM user WHERE Status=1 AND RegTime LIKE '%" + d2 +"%';", function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
            if (err) console.log('err: ', err);
            console.log("res2", results[2], "d1", d1);
            console.log("res3", results[3], "d2", d2);
            date = [0,0,0,0,0,0,0,0,0,0,0,0,0];
            for (var i = 0; i < results[1].length; i++) {
                var a = parseInt(moment(results[1][i].Time).format('MM'))
                date[a] += 1;
            }
            console.log(results);
            res.render('admin/statistics', {
                user: results[0],
                ojcnt: date,
                session: req.session,
                d1: results[3],
                d2: results[2]
            });
            connection.release();
        });
    });
});

module.exports = router;
