var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

// 발주 마감 처리
router.put('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query("UPDATE orders SET Status='B' WHERE _OID=?", req.params.id, function(err) {
            if(err) console.log(err);
            res.send(true);
            connection.release();
        });
    });
});
module.exports = router;
