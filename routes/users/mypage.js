var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = "SELECT * FROM user WHERE _UID='" + req.session._UID + "';";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            else {
                res.render('mypage', {
                    data: rows[0],
                    name: req.session.Name
                });
            }
            connection.release();
        })
    });
});

router.put('/', function (req, res, next) {
    var body = req.body;
    console.log("body : " + body)
});

module.exports = router;
