var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM orders';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            var dates = [];
            for (var i = 0; i < rows.length; i++) {
                dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
            }
            res.render('orders', {
                data: rows,
                reqNum: '0',
                date: dates,
                Name: '홍길동'
            });
            connection.release();
        })
    });
});

router.post('/', function(req, res, next) {
});

module.exports = router;
