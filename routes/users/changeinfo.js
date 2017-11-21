var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.put('/', function (req, res, next) {
    var queryStr = "UPDATE user SET Name = '"+ req.body.Name + "', Birth = '" + req.body.Birth + "', Tel = '" + req.body.Tel + "' WHERE _UID = 2017000001;";
    console.log(queryStr);
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

router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) {
                console.log("err: ", err);
            } else {
                console.log('The solution is: ', rows[0]);
                res.render('changeinfo', {
                    data: rows[0]
                });
            }
            connection.release();
        })
    });
});

router.post('/', function(req, res, next) {

});

module.exports = router;
