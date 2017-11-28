var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    }
    var queryStr = "SELECT * FROM user WHERE _UID=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.session._UID, function(err, user) {
            if(err) console.log("err: ", err);
            queryStr = "SELECT * FROM resume WHERE _UID=?";
            connection.query(queryStr, req.session._UID, function(err, resume) {
                if(err) console.log("err: ", err);
                console.log('resume: ', resume);
                res.render('user/mypage', {
                    data: user[0],
                    resume: resume[0],
                    session: req.session
                });
                connection.release();
            });
        });
    });
});

module.exports = router;
