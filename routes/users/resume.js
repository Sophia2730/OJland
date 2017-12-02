var express = require('express');
var pool = require('../../config.js').pool;
var multer = require('multer');
var router = express.Router();
var upload = require('../../config.js').upload;
var path = require('path');
var fs = require('fs');
var async = require('async');

var id;
router.get('/', function(req, res, next) {
    async.series([
        function(callback) {
            fs.readFile('public/data/major.json', 'utf-8', function(err, data) {
                if(err) callback(err);
                callback(null, JSON.parse(data));
            });
        },
        function(callback) {
          pool.getConnection(function(err, connection) {
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

router.post('/', upload.array('File', 3), function(req, res){
    var body = req.body;

    var licenses = '';
    if(Array.isArray(body.License)) {
        for (var i = 0; i < body.License.length; i++) {
            licenses += body.License[i];
            if (i != body.License.length - 1 && body.License[i+1])
                licenses += '%&';
        }
    } else if (body.License)
        licenses = body.License;

    var imgUrl = '';

    if(Array.isArray(body.curFile)) {
        for (var i = 0; i < body.curFile.length; i++) {
            imgUrl += body.curFile[i];
            if (i != body.curFile.length - 1)
                imgUrl += '%&';
        }
    } else if (body.curFile)
        imgUrl = body.curFile;

    if(imgUrl && req.files[0])
        imgUrl += '%&';

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
                connection.query('SELECT _RID FROM resume ORDER BY _RID DESC limit 1', function(err, rows) {
                      if(err) callback(err);
                      if(!rows[0])
                          callback(null, 2017000001);
                      else
                          callback(null, Number(rows[0]._RID) + 1);
                });
            },
            function(arg1, callback) {
                connection.query('SELECT _RID FROM resume WHERE _UID=?', req.session._UID, function(err, rows) {
                      if(err) callback(err);
                      callback(null, arg1, rows[0]);
                });
            },
            function(arg1, arg2, callback) {
                if(!arg2) {
                    var inputs = [arg1, req.session._UID, body.Course, body.Colleage, body.Major, licenses, body.Content, imgUrl];
                    var queryStr = 'INSERT INTO resume(_RID, _UID, Course,  Colleage , Major , License , Content , imageUrl) VALUES(?,?,?,?,?,?,?,?)';
                    connection.query(queryStr, inputs, function(err, rows) {
                          if(err) callback(err);
                          callback(null, arg1, arg2);
                    });
                } else {
                    callback(null, arg1, arg2);
                }
            },
            function(arg1, arg2, callback) {
                if(arg2) {
                    var inputs = [req.session._UID, body.Course, body.Colleage, body.Major, licenses, body.Content, imgUrl, arg2._RID];
                    var queryStr = 'UPDATE resume SET _UID=?, Course=?, Colleage=?, Major=?, License=?, Content=?, imageUrl=? WHERE _RID=?';
                    connection.query(queryStr, inputs, function(err) {
                          if(err) callback(err);
                    });
                }
                callback(null, 'success');
            }
        ], function(err, result) {
            if(err) console.log('err: ', err);
            res.redirect('/mypage');
            connection.release();
        });
    });
});

module.exports = router;
