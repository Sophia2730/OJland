var express = require('express');
var router = express.Router();
var moment = require('moment');
var methodOverride = require('method-override');
var pool = require('../../config.js').pool;

router.use(methodOverride('_method'));

router.get('/', function(req, res, next) {
    req.session.Email = "'abc@naver.com'";
    var queryStr = "SELECT * FROM user WHERE Email=" + req.session.Email;
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) {
                console.log("err: ", err);
            } else {
                res.render('changeinfo', {
                    data: rows[0]
                });
            }
            connection.release();
        });
    });
});

router.post('/', function(req, res, next) {
});

router.put('/', function (req, res, next) {
    var body = req.body;
    var queryStr = "UPDATE user SET Name=" + body.Name + ", Birth=" +
            body.Birth + ", Tel=" + body.Tel + "Where Email="
            + req.session.Email;
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) {
                console.log("err: ", err);
            }
            connection.release();
            res.redirect('/mypage');
        });
    });
});

module.exports = router;
