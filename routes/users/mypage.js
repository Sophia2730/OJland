var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = "SELECT * FROM user WHERE _UID=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.session._UID, function(err, rows) {
        if(err) console.log("err: ", err);
        res.render('user/mypage', {
            data: rows[0],
            name: req.session.Name
        });
        connection.release();
        });
    });
});

module.exports = router;
