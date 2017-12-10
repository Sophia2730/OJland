var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var upload = require('../../config.js').upload;
var async = require('async');

// 특정 발주에 대한 진척도를 등록한다
router.post('/:id', upload.array('File'), function(req, res, next) {
    var body = req.body;

    var imgUrl = ''; // imageUrl을 저장할 변수
    if (Array.isArray(req.files)) { // Url이 2개 이상이면
        leng = req.files.length;
        for (var i = 0; i < leng; i++) {
            imgUrl += req.files[i].filename;
            if (i + 1 == leng)
                break;
            imgUrl += '%&';
        }
    } else if (req.files) { // Url이 1개 이면
        imgUrl = req.files.filename;
    }

    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                // 최근 진척도번호 조회
                connection.query("SELECT _PID FROM progress ORDER BY _PID DESC limit 1", function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._PID) + 1; // 최근 _PID 값 + 1 저장
                    callback(null, newId);
                });
            },
            function(newId, callback) {
                var inputs = [newId, req.session._UID, req.params.id, body.Title, body.Content, imgUrl];
                queryStr = "INSERT INTO progress(_PID, _UID, _OID, Title, Content, ImageUrl)"
                              + " VALUES(?,?,?,?,?,?)"; // progress Table에 데이터 삽입
                connection.query(queryStr, inputs, function(err) {
                    if(err) callback(err);
                    callback(null, 'success');
                });
            }
        ], function(err, results) {
              if(err) console.log(err);
              connection.release();
        });
    });
});

module.exports = router;
