var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            console.log('data is: ', rows);
            var ages = [];
            for (var i = 0; i < rows.length; i++) {
                var d1 = rows[i].Birth.substring(0,4);
                var d2 = new Date().toISOString();
                console.log(d1 + ' | ' + d2);
            }
            res.render('members', {
                data: rows
            });
            connection.release();
        })
    });
});

router.post('/', function(req, res, next) {
});

module.exports = router;
