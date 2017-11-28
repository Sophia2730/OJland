var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');

router.get('/', function(req, res, next) {
    // console.log(req.session);
    var queryStr = "123";

    pool.getConnection(function(err, connection) {
        if(req.session.UserType == 'ER'){
            queryStr = "SELECT * FROM user as U left join orders as O on U._UID = O._UID WHERE U._UID=" + req.session._UID;
            connection.query(queryStr, function (err, rows) {
                if(err) console.log("err: ", err);
                else {
                    var dates = [];
                    for (var i = 0; i < rows.length; i++) {
                        dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
                    }
                    console.log(rows[0], dates[0])
                    res.render('user/ordered_list', {
                        data: rows,
                        date: dates,
                        session: req.session
                    });
                    connection.release();
                }
            });
        } else if(req.session.UserType == 'EE'){
            queryStr = "SELECT * FROM application as A RIGHT JOIN orders as O ON A._OID = O._OID RIGHT JOIN user as U ON O._UID = U._UID WHERE A._UID = " + req.session._UID;
            queryStr = "SELECT * FROM user as U RIGHT JOIN orders as O ON U._UID = O._UID RIGHT JOIN application as A ON O._OID = A._OID WHERE A._UID = " + req.session._UID;
            connection.query(queryStr, function (err, rows) {
                if(err) console.log("err: ", err);
                else{
                    console.log(rows[0]);
                    res.render('user/ordered_list', {
                        data: rows,
                        session: req.session
                    });
                    connection.release();
                }
            });
        }
        connection.query(queryStr, function(err, rows) {

        });

    });
});


module.exports = router;
