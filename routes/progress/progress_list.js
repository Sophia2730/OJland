var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var body = req.body;
    console.log("UID: ", body.uid);
    console.log("OID: ", body.oid);
    pool.getConnection(function(err, connection) {
        queryStr = "SELECT * FROM progress WHERE _UID=? AND _OID=?";
        connection.query(queryStr, [body.uid,body.oid], function (err, rows) {
            if(err) console.log("err: ", err);
            console.log(rows);
            res.render('progress/progress_list', {
                data: rows,
                date: dates,
                session: req.session
            });
            connection.release();
        });
    });
});


module.exports = router;
