var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');

router.get('/', function(req, res, next) {
    console.log(req.session);
    var queryStr = "SELECT * FROM user as U left join orders as O on U._UID = O._UID WHERE U._UID=" + req.session._UID;

    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            else{
                var dates = [];
                for (var i = 0; i < rows.length; i++) {
                    dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
                }
                console.log(rows[0], dates[0])
                var queryER = "SELECT Name FROM user as U left join orders as O on U."
                res.render('user/ordered_list', {
                    data: rows,
                    date: dates,
                    session: req.session
                });
                connection.release();
            }
        });
    });
});


module.exports = router;
