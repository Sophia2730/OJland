var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

router.post('/:id', function(req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        connection.query("UPDATE orders SET Status='B' WHERE _OID=?", req.params.id, function(err) {
            if(err) console.log(err);
            res.redirect('/info/' + req.params.id);
            connection.release();
        });
    });
});
module.exports = router;
