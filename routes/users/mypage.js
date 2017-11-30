var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    }
    // var queryStr = "SELECT U.Email, U.Name, U.Birth, U.Tel, U.UserType, A.Status"
    //               + " FROM user AS U JOIN application AS A WHERE U._UID=?";
    var queryStr = "SELECT * FROM user WHERE _UID=?"
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.session._UID, function(err, user) {
            if(err) console.log("err: ", err);
            queryStr = "SELECT * FROM resume WHERE _UID=?";
            connection.query(queryStr, req.session._UID, function(err, resume) {
                if(err) console.log("err: ", err);
                queryStr = "SELECT * FROM orders WHERE _UID=?";
                connection.query(queryStr, req.session._UID, function(err, orders) {
                    if(err) console.log("err: ", err);
                    queryStr = "SELECT * FROM application WHERE _UID=?";
                    connection.query(queryStr, req.session._UID, function(err, apps) {
                        res.render('user/mypage', {
                            user: user[0],
                            order: orders,
                            app: apps,
                            resume: resume[0],
                            session: req.session
                        });
                        connection.release();
                    });
                });
            });
        });
    });
});

module.exports = router;
