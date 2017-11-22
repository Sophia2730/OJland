var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = "SELECT * FROM user WHERE _UID='" + req.session._UID + "';";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) {
                console.log("err: ", err);
            } else {
                res.render('changeinfo', {
                    data: rows[0],
                    name: req.session.Name
                });
            }
            connection.release();
        });
    });
});

router.put('/', function (req, res, next) {
    var queryStr = "UPDATE user SET Name = '"+ req.body.Name + "', Birth = '" + req.body.Birth
            + "', Tel = '" + req.body.Tel + "' WHERE _UID='" + req.session._UID + "';";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) {
                console.log("err: ", err);
            }
            connection.release();
            res.redirect("/mypage");
        })
    });
});

module.exports = router;
