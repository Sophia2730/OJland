var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

var id;
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM orders WHERE _OID=?', id, function(err, orders) {
            if(err) console.log("err: ", err);
            pool.getConnection(function(err, connection) {
                connection.query('SELECT * FROM user WHERE _UID=?', orders[0]._UID, function(err, users) {
                    if(err) console.log("err: ", err);
                    res.render('order/order-info', {
                        data: orders[0],
                        reqNum: '0',
                        date: moment(orders[0].Time).format('YYYY/MM/DD'),
                        user: users[0],
                        usertype: req.session.UserType,
                        name: req.session.Name
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
    res.redirect('/info');
});

router.delete('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query('DELETE FROM orders WHERE _OID=?', req.params.id, function(err, users) {
            if (err)
                console.log('error: ', err);
            res.redirect('/list');
            connection.release();
        });
    });
});

module.exports = router;
