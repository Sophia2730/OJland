var express = require('express');
var pool = require('../../config.js').pool;
var multer = require('multer');
var router = express.Router();
var upload = require('../../config.js').upload;
var path = require('path');

var resumes;
router.get('/', function(req, res, next) {
  pool.getConnection(function(err, connection) {
      connection.query('SELECT * FROM resume', function(err, rows) {
          if(err) console.log("err: ", err);
          resumes = rows;
          res.render('user/resume', {
              session: req.session
          });
          connection.release();
      });
  });
});

router.post('/', upload.array('userfile'), function(req, res){
    var body = req.body;
    var licenses = '';
    var imgUrl = '';
    var newId = (resumes[0] == null) ? 2017000001 : Number(resumes[resumes.length-1]._RID) + 1;

    var leng = body.License.length;
    if(!Array.isArray(body.License)) {
        licenses = body.License;
    } else {
        for (var i =0; i < leng; i++) {
            licenses += body.License[i];
            if (i + 1 == leng)
                break;
            licenses += '%&';
        }
    }

    leng = req.files.length;
    for (var i = 0; i < leng; i++) {
        imgUrl += req.files[i].filename;
        if (i + 1 == leng)
            break;
        imgUrl += '%&';
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
