var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

var id;
var order;
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM orders WHERE _OID=?', id, function(err, orders) {
            if(err) console.log("err: ", err);
            order = orders[0];
            for (var i = 0; i < order.Preference.length; i++) {
                console.log(i);
                if (order.Preference[i] == '%')
                    order.Preference[i] = ' ';
            }
            pool.getConnection(function(err, connection) {
                connection.query('SELECT * FROM user WHERE _UID=?', orders[0]._UID, function(err, users) {
                    if(err) console.log("err: ", err);
                    res.render('order-info', {
                        data: order,
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
    res.redirect("/info");
});

module.exports = router;
