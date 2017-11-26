var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

var id;
var app = false;
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM orders WHERE _OID=?', id, function(err, orders) {
            if(err) console.log("err: ", err);
            pool.getConnection(function(err, connection) {
                connection.query('SELECT * FROM user WHERE _UID=?', orders[0]._UID, function(err, users) {
                    if(err) console.log("err: ", err);
                    var prefer = [];
                    if (orders[0].Preference != null)
                        prefer = orders[0].Preference.split('%&');
                    res.render('order/order-info', {
                        data: orders[0],
                        preference: prefer,
                        reqNum: '0',
                        date: moment(orders[0].Time).format('YYYY/MM/DD'),
                        user: users[0],
                        session: req.session,
                        app: app
                    });
                    connection.release();
                });
            });
            connection.release();
        });
    });
});

router.get('/:id', function(req, res, next) {
    id = req.params.id;
    var queryStr = "SELECT * FROM application WHERE _OID=? AND _UID=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, [id, req.session._UID], function(err, rows) {
            if (err) console.log('error: ', err);
            app = (rows[0] != null) ? true : false; // 요청 여부
        });
    });
    res.redirect('/info');
});

router.delete('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'DELETE FROM orders WHERE _OID=?';
        connection.query(queryStr, id, function(err, users) {
            if (err) console.log('error: ', err);
            res.redirect('/list');
            connection.release();
        });
    });
});

module.exports = router;
