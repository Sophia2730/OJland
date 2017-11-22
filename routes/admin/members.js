var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            var ages = [];
            for (var i = 0; i < rows.length; i++) {
                var d1 = rows[i].Birth.substring(0,4);
                var d2 = new Date().toISOString().substring(0,4);
                ages[i] = d2 - d1 + 1;
            }
            res.render('members', {
                data: rows,
                age: ages
            });
            connection.release();
        });
    });
});

router.delete('/:id', function(req, res, next) {
    var queryStr = "DELETE FROM user WHERE _UID='" + req.params.id + "';";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/members');
            connection.release();
        });
    });
});

module.exports = router;
