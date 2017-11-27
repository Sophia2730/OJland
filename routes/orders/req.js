var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.post('/:id', function(req, res, next) {
    var body = req.body;
    var total = 0;
    var prefer = '';
    for (var i = 0; i < body.Preference.length; i++) {
        if (body.Preference[i] == '')
            break;
        total += body.Preference.length;
        if (i == body.Preference.length - 1)
            prefer += i;
        else
            prefer += i + '%&';
    }
    pool.getConnection(function(err, connection) {
        var queryStr = 'SELECT * FROM resume WHERE _UID=?'
        connection.query(queryStr, req.session._UID, function(err, resume) {
            if(err) console.log("err: ", err);
            console.log('resume: ', resume);
            total += resume[0].Score;
            queryStr = 'SELECT * FROM application;';
            connection.query(queryStr, function(err, applications) {
                if(err) console.log("err: ", err);
                // 데이터베이스의 application 테이블에 저장된 데이터가 없으면 2017000001 부터 시작
                var newId = (applications[0] == null) ? 2017000001 : Number(applications[applications.length - 1]._AID) + 1;
                var inputs = [newId, req.params.id, req.session._UID, prefer, total];
                queryStr = 'INSERT INTO application(_AID, _OID, _UID, CheckPre, TotalScore)'
                              + ' VALUES(?,?,?,?,?)';
                connection.query(queryStr, inputs, function(err, orders) {
                    if(err) console.log("err: ", err);
                    res.redirect('/info/' + req.params.id);
                    connection.release();
                });
            });
        });
    });
});

router.delete('/:id', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var queryStr = 'DELETE FROM application WHERE _OID=? AND _UID=?';
        connection.query(queryStr, [req.params.id, req.session._UID], function(err, rows) {
            if(err) console.log("err: ", err);
            res.redirect('/info/' + req.params.id);
            connection.release();
        });
    });
});
module.exports = router;
