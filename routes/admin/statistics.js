var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');
var moment = require('moment');


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
            }
        ], function(err, results) {
            if (err) console.log('err: ', err);
            date = [0,0,0,0,0,0,0,0,0,0,0,0,0];
            for (var i = 0; i < results[1].length; i++) {
                var a = parseInt(moment(results[1][i].Time).format('MM'))
                date[a] += 1;
            }
            console.log(results);
            res.render('admin/statistics', {
                user: results[0],
                ojcnt: date,
                session: req.session
            });
            connection.release();
        });
    });

});

module.exports = router;
