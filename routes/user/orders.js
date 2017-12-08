var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');

router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        if(req.session.UserType == 'ER'){
            queryStr = "SELECT * FROM user as U left join orders as O on U._UID = O._UID WHERE U._UID=?";
            connection.query(queryStr, req.session._UID, function (err, rows) {
                if(err) console.log("err: ", err);
                var dates = [];
                for (var i = 0; i < rows.length; i++) {
                    dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
                }
                res.render('user/orders', {
                    data: rows,
                    date: dates,
                    session: req.session
                });
                connection.release();
            });
        } else if(req.session.UserType == 'EE'){
            queryStr = "SELECT O._OID,O._UID,O.Category,O.Title,O.Cost,O.Status,U.Name,U.Email,U.Tel"
                  + " FROM orders AS O JOIN user as U ON U._UID=O._UID"
                  + " WHERE O._OID IN (SELECT _OID FROM application WHERE _UID=?);"
            connection.query(queryStr, req.session._UID, function (err, rows) {
                if(err) console.log("err: ", err);
                res.render('user/orders', {
                    data: rows,
                    session: req.session
                });
                connection.release();
            });
        }
    });
});

// 해당 발주의 상태를 리턴
router.get('/check/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT Status FROM orders WHERE _OID=?", req.params.id, function (err, rows) {
            if(err) console.log("err: ", err);
            res.send(rows[0].Status);
            connection.release();
        });
    });
});

// 해당 지원의 상태를 리턴
router.get('/status/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT Status FROM application WHERE _OID=? AND _UID=?", [req.params.id, req.session._UID], function (err, rows) {
            if(err) console.log("err: ", err);
            res.send(rows[0].Status);
            connection.release();
        });
    });
});

// 수주 요청자의 수를 리턴
router.get('/num/:oid', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT count(*) AS cnt FROM application WHERE _OID=? AND Status<>'F'", req.params.oid, function (err, rows) {
            if(err) console.log("err: ", err);
            res.send({cnt: rows[0].cnt});
            connection.release();
        });
    });
});

// 매칭 완료된 수주자의 수를 리턴
router.get('/complete/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT count(*) AS cnt FROM application WHERE _OID=? AND Status='B'", req.params.id, function (err, rows) {
            if(err) console.log("err: ", err);
            res.send({cnt: rows[0].cnt});
            connection.release();
        });
    });
});

module.exports = router;
