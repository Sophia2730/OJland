var express = require('express');
var pool = require('../../config.js').pool;
var multer = require('multer');
var router = express.Router();
var upload = require('../../config.js').upload;
var path = require('path');
var fs = require('fs');
var async = require('async');

// 이력서 작성 및 수정 페이지를 불러온다
router.get('/', function(req, res, next) {
    async.series([
        function(callback) {
            // 학부 및 학과정보 읽기
            fs.readFile('public/data/major.json', 'utf-8', function(err, data) {
                if(err) callback(err);
                callback(null, JSON.parse(data));
            });
        },
        function(callback) {
          pool.getConnection(function(err, connection) {
              // 특정 사용자의 이력서 조회
              connection.query("SELECT * FROM resume WHERE _UID=?", req.session._UID, function(err, rows) {
                  if(err) callback(err);
                  callback(null, rows[0]);
                  connection.release();
              });
          });
        }
    ], function(err, results) {
        if(err) console.log('err: ', err);
        res.render('user/resume', {
            session: req.session,
            major: results[0],
            resume: results[1]
        });
    });
});
// 이력서를 등록 및 수정한다
router.post('/', upload.array('File', 3), function(req, res){
    var body = req.body;
    // 입력한 자격증을 문자열로 저장한다
    var licenses = '';
    if(Array.isArray(body.License)) {
        for (var i = 0; i < body.License.length; i++) {
            licenses += body.License[i];
            if (i != body.License.length - 1 && body.License[i+1])
                licenses += '%&';
        }
    } else if (body.License)
        licenses = body.License;

    // 기존 이미지 Url을 문자열로 저장한다
    var imgUrl = '';
    if(Array.isArray(body.curFile)) {
        for (var i = 0; i < body.curFile.length; i++) {
            imgUrl += body.curFile[i];
            if (i != body.curFile.length - 1)
                imgUrl += '%&';
        }
    } else if (body.curFile)
        imgUrl = body.curFile;
    // 새로운 업로드 파일이 있으면 구분자 '%&' 추가
    if(imgUrl && req.files[0])
        imgUrl += '%&';
    // 새로운 이미지 Url을 문자열로 저장한다
    if(Array.isArray(req.files)) {
        for (var i = 0; i < req.files.length; i++) {
            imgUrl += req.files[i].filename;
            if (i != req.files.length - 1)
                imgUrl += '%&';
        }
    } else if (req.files) {
        imgUrl = req.files.filename;
    }

    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback) {
                // 최근 이력서번호 조회
                connection.query('SELECT _RID FROM resume ORDER BY _RID DESC limit 1', function(err, rows) {
                      if(err) callback(err);
                      var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._RID) + 1;
                      callback(null, newId);
                });
            },
            function(newId, callback) {
                // 사용자의 이력서 번호 조회
                connection.query('SELECT _RID FROM resume WHERE _UID=?', req.session._UID, function(err, rows) {
                      if(err) callback(err);
                      callback(null, newId, rows[0]);
                });
            },
            function(newId, resume, callback) {
                if(!resume) {
                    var inputs = [newId, req.session._UID, body.Course, body.Colleage, body.Major, licenses, body.Content, imgUrl];
                    // 입력한 이력서 정보 등록
                    var queryStr = 'INSERT INTO resume(_RID, _UID, Course,  Colleage , Major , License , Content , imageUrl) VALUES(?,?,?,?,?,?,?,?)';
                    connection.query(queryStr, inputs, function(err, rows) {
                          if(err) callback(err);
                    });
                }
                callback(null, resume);
            },
            function(resume, callback) {
                if(resume) {
                    var inputs = [req.session._UID, body.Course, body.Colleage, body.Major, licenses, body.Content, imgUrl, resume._RID];
                    // 입력한 이력서 정보 수정
                    var queryStr = 'UPDATE resume SET _UID=?, Course=?, Colleage=?, Major=?, License=?, Content=?, imageUrl=? WHERE _RID=?';
                    connection.query(queryStr, inputs, function(err) {
                          if(err) callback(err);
                    });
                }
                callback(null, 'success');
            }
        ], function(err, result) {
            if(err) console.log('err: ', err);
            res.redirect('/user/mypage');
            connection.release();
        });
    });
});

module.exports = router;
