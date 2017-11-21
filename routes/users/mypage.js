var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            else {
                console.log('The solution is: ', rows[0]);
                res.render('mypage', {
                    data: rows[0]
                });
            }
            connection.release();
        })
    });
});


router.post('/', function(req, res, next) {
});

router.put('/', function (req, res, next) {
    var body = req.body;
    console.log("body : " + body)
});


module.exports = router;
