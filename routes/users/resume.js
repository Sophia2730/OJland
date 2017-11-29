var express = require('express');
var pool = require('../../config.js').pool;
var multer = require('multer');
var router = express.Router();
var upload = require('../../config.js').upload;
var path = require('path');

var resume;
router.get('/', function(req, res, next) {
  pool.getConnection(function(err, connection) {
      connection.query('SELECT * FROM resume ORDER BY _RID DESC limit 1', function(err, rows) {
          if(err) console.log("err: ", err);
          resume = rows[0];
          res.render('user/resume', {
              session: req.session
          });
          connection.release();
      });
  });
});

router.post('/', upload.array('File'), function(req, res){
    var body = req.body;
    var newId = (resume == null) ? 2017000001 : Number(resume._RID) + 1;

    var licenses = '';
    if(Array.isArray(body.License)) {
        var leng = body.License.length;
        for (var i =0; i < leng; i++) {
            licenses += body.License[i];
            if (i + 1 == leng)
                break;
            licenses += '%&';
        }
    } else if (body.License){
        licenses = body.License;
    }

    var imgUrl = '';
    if(Array.isArray(req.files)) {
        leng = req.files.length;
        for (var i = 0; i < leng; i++) {
            imgUrl += req.files[i].filename;
            if (i + 1 == leng)
                break;
            imgUrl += '%&';
        }
    } else if (req.files){
        imgUrl = req.files.filename;
    }


    var inputs = [newId, req.session._UID, body.Course, body.Colleage, body.Major, licenses, body.Content, imgUrl]
    console.log(inputs);
    pool.getConnection(function(err, connection) {
        var queryStr = 'INSERT INTO resume(_RID, _UID, Course,  Colleage , Major , License , Content , imageUrl) '
                      + 'VALUES(?,?,?,?,?,?,?,?);';
        connection.query(queryStr, inputs, function(err, rows) {
              if(err) console.log("err: ", err);
              res.redirect('/mypage');
              connection.release();
        });
    });
});

module.exports = router;
