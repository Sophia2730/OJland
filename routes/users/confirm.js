var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;

router.get('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = "UPDATE user SET Status='1' WHERE _UID=?";
        connection.query(queryStr, decrypt(req.params.id), function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/login');
            connection.release();
        });
    });
});

module.exports = router;