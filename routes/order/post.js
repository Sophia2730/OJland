var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var fs = require('fs');
var async = require('async');

router.get('/', function(req, res, next) {
    fs.readFile('public/data/major.json', 'utf-8', function(err, data) {
        if(err) console.log(err);
        res.render('order/post', {
            major: JSON.parse(data),
            session: req.session
        });
    });

});

router.post('/', function(req, res, next) {
    var body = req.body;
    var prefer = '';  // 우대조건을 저장할 변수
    if (Array.isArray(body.Preference)) { // body.Preference가 배열이면
        for (var i = 0; i < body.Preference.length; i++) {
            prefer += body.Preference[i]; // i 번째 우대조건을 prefer에 저장
            if (i + 1  == body.Preference.length) // 마지막 우선조건이면
                break;
            else if(body.Preference[i+1] != '') // 다음 조건이 존재하면
                prefer += '%&'; // 구분자 '%&' 추가
        }
    } else if (body.Preference) {
        prefer = body.Preference;
    }

    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                connection.query('SELECT _OID FROM orders ORDER BY _OID DESC limit 1', function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._OID) + 1; // 최근 _OID 값 + 1 저장
                    callback(null, newId);
                });
            },
            function(newId, callback) {
                var inputs = [newId, req.session._UID, body.Category, body.Title, body.Colleage, body.Cost,
                            body.Content, prefer, body.Period, body.MaxNum];  // orders Table에 저장할 값들
                var queryStr = 'INSERT INTO orders(_OID,_UID,Category,Title,Colleage,Cost,Content,Preference,Period,MaxNum)'
                              + ' VALUES(?,?,?,?,?,?,?,?,?,?)'; // orders Table에 데이터를 삽입
                connection.query(queryStr, inputs, function(err) {
                    if(err) callback(err);
                    callback(null, newId);
                });
            }
        ], function(err, result) {
            if(err) console.log(err);
            res.redirect('/order/info/' + result);
            connection.release();
        });
    });
});

module.exports = router;
