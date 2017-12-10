var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');

// 특정 발주를 마감한다
router.put('/:oid', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        // 특정 발주의 상태를 마감 상태로 변경한다
        connection.query("UPDATE orders SET Status='B' WHERE _OID=?", req.params.oid, function(err) {
            if(err) console.log(err);
            res.send(true);
            connection.release();
        });
    });
});
module.exports = router;
