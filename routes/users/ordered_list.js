var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');

router.get('/', function(req, res, next) {
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
                    res.render('user/ordered_list', {
                        data: rows,
                        date: dates,
                        session: req.session
                    });
                    connection.release();
                }
            });
        } else if(req.session.UserType == 'EE'){
            // queryStr = "SELECT * FROM user as U RIGHT JOIN orders as O ON U._UID = O._UID RIGHT JOIN application as A ON O._OID = A._OID WHERE A._UID = " + req.session._UID;
            queryStr = "SELECT O._OID,O._UID,O.Category,O.Title,O.Cost,O.Status,U.Name,U.Email,U.Tel"
                  + " FROM orders AS O JOIN user as U ON U._UID=O._UID"
                  + " WHERE O._OID IN (SELECT _OID FROM application WHERE _UID=?);"
            connection.query(queryStr, req.session._UID, function (err, rows) {
                if(err) console.log("err: ", err);
                else {
                    res.render('user/ordered_list', {
                        data: rows,
                        session: req.session
                    });
                    connection.release();
                }
            });
        }
    });
});


module.exports = router;
