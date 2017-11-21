var express = require('express');
var router = express.Router();
var dateFormat = require('dateformat');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    prot: 3306,
    database: 'ojland'
});

router.get('/', function(req, res, next) {
    var orders;
    connection.connect();
    connection.query('SELECT * FROM orders', function(err, rows, fields) {
        if (!err) {
            console.log('The solution is: ', rows);
            orders = rows;
            res.render('orders', {
                data: orders[0],
                date: dateFormat(orders[0].Time, "yyyy-mm-dd"),
                reqNum: '0',
                Name: '홍길동'
            });
        } else
            console.log('Error while performing Query.', err);
    });
    connection.end();
});

router.post('/', function(req, res, next) {
});

module.exports = router;
