var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    prot: 3306,
    database: 'ojland'
});

router.get('/', function(req, res, next) {
    var members;
    connection.connect();
    connection.query('SELECT * FROM user', function(err, rows, fields) {
        if (!err) {
            console.log('The solution is: ', rows);
            members = rows;
        } else
            console.log('Error while performing Query.', err);
    });
    connection.end();
    res.render('members');
});

router.post('/', function(req, res, next) {
});

module.exports = router;
