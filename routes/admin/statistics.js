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
            },
            function(callback) {
                connection.query("SELECT Status, count(*) as cnt FROM orders GROUP BY Status;", function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows);
                });
            }
        ], function(err, results) {
            if (err) console.log('err: ', err);
            date = [0,0,0,0,0,0,0,0,0,0,0,0,0];
            for (var i = 0; i < results[1].length; i++) {
                var a = parseInt(moment(results[1][i].Time).format('MM'));
                date[a] += 1;
            }
            orders = [0,0,0,0,0,0];
            console.log(results[4]);
            for(var i=0; i< results[4].length; i++){
                switch(results[4][i].Status){
                    case 'A':
                        orders[0] = (results[4][i]) ? results[4][i].cnt : 0;
                        break;
                    case 'B':
                        orders[1] = (results[4][i]) ? results[4][i].cnt : 0;
                        break;
                    case 'C':
                        orders[2] = (results[4][i]) ? results[4][i].cnt : 0;
                        break;
                    case 'D':
                        orders[3] = (results[4][i]) ? results[4][i].cnt : 0;
                        break;
                    case 'F':
                        orders[4] = (results[4][i]) ? results[4][i].cnt : 0;
                        break;
                }
            }
            for(var i = 0; i < 5; i++) {
                orders[5] += orders[i];
            }
            console.log(orders, results);
            res.render('admin/statistics', {
                user: results[0],
                ojcnt: date,
                d1: results[3],
                d2: results[2],
                orders: orders,
                session: req.session
            });
            connection.release();
        });
    });
});

module.exports = router;
