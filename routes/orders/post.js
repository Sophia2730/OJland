var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

var orders;
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM orders', function(err, rows) {
            if(err) console.log("err: ", err);
            orders = rows;
            res.render('order-post', {
                name: req.session.Name
            });
            connection.release();
        });
    });
});

router.post('/', function(req, res, next) {
    var body = req.body;
    var newId = Number(orders[orders.length - 1]._OID) + 1;
    var preferStr = '';
    for (var i = 0; i < body.Preference.length; i++) {
        preferStr += body.Preference[i] + '%&';
    }
    var queryStr = 'INSERT INTO orders(_OID,_UID,Category,Title,Colleage,Cost,Content,Preference,Period,MaxNum)'
                  + ' VALUES(?,?,?,?,?,?,?,?,?,?)';
    var inputs = [newId, req.session._UID, body.Category, body.Title, body.Colleage, body.Cost,
                body.Content, preferStr, body.Period, body.MaxNum];
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, inputs, function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/list');
            connection.release();
        });
    });
});

module.exports = router;
