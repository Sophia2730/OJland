var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.post('/:id', function(req, res, next) {
    var queryStr = 'INSERT INTO application(_AID, _OID, _UID, CheckPre, TotalScore)'
                  + ' VALUES(?,?,?,?,?)';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, id, function(err, orders) {
            if(err) console.log("err: ", err);
            res.redirect();
            connection.release();
        });
    });
});

module.exports = router;
