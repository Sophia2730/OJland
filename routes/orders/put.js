var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

var id;
var order;
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM orders WHERE _OID=?', id, function(err, rows) {
            if(err) console.log("err: ", err);
            order = rows[0];
            var prefer = [];
            if (rows[0].Preference != null) {
              prefer = rows[0].Preference.split('%&');
            }
            res.render('order/order-put', {
                name: req.session.Name,
                data: rows[0],
                preference: prefer
            });
            connection.release();
        });
    });
});

router.get('/:id', function(req, res, next) {
    id = req.params.id;
    res.redirect('/put');
});

router.put('/', function(req, res, next) {
    var body = req.body;
    var preferStr = '';
    for (var i = 0; i < body.Preference.length; i++) {
        if (i == body.Preference.length - 1 && body.Preference[i] != '')
            preferStr += body.Preference[i];
        else if (body.Preference[i] != '')
            preferStr += body.Preference[i] + '%&';
    }
    var queryStr = 'UPDATE orders SET Category=? ,Title=?'
                  + ', Colleage=? ,Cost=? ,Content=? ,Preference=? ,Period=? ,MaxNum=?'
                  + ' WHERE _OID=?';
    var inputs = [body.Category, body.Title, body.Colleage, body.Cost,
                body.Content, preferStr, body.Period, body.MaxNum, order._OID];
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, inputs, function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/list');
            connection.release();
        });
    });
});

module.exports = router;
