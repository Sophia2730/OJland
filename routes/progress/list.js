var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');

// 특정 발주에 대한 진척도를 목록을 보여준다
router.post('/',function(req,res){
    var body = req.body;
    pool.getConnection(function(err, connection) {
        // 특정 발주에 대한 수주자의 진척도 조회
        queryStr = "SELECT * FROM progress WHERE _UID=? AND _OID=?";
        connection.query(queryStr, [body.uid,body.oid], function (err, rows) {
            if(err) console.log("err: ", err);
            var dates = [];
            for (var i = 0; i < rows.length; i++) {
                dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
            }
            res.render('progress/list', {
                data: rows,
                date: dates,
                session: req.session
            });
            connection.release();
        });
    });
});


module.exports = router;
