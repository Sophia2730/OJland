var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');

router.get('/', function(req, res, next) {
    var query = req.query;
    pool.getConnection(function(err, connection) {
        queryStr = "SELECT * FROM progress WHERE _UID=? AND _OID=?";
        connection.query(queryStr, [query.uid, query.oid], function (err, rows) {
            if(err) console.log("err: ", err);
            var dates = [];
            for (var i = 0; i < rows.length; i++) {
                dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
            }
            res.render('progress/progress_list', {
                data: rows,
                date: dates,
                session: req.session
            });
            connection.release();
        });
    });
});


router.post('/',function(req,res){
    var body = req.body;
    pool.getConnection(function(err, connection) {
        queryStr = "SELECT * FROM progress WHERE _UID=? AND _OID=?";
        connection.query(queryStr, [body.uuid,body.ooid], function (err, rows) {
            if(err) console.log("err: ", err);
            var dates = [];
            for (var i = 0; i < rows.length; i++) {
                dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
            }
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
