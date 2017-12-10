var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

// 개인정보 수정 페이지를 불러온다
router.get('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        // 특정 사용자 정보 조회
        connection.query("SELECT * FROM user WHERE _UID=?", req.session._UID, function(err, rows) {
            if(err) console.log("err: ", err);
            res.render('user/changeinfo', {
                session: req.session,
                data: rows[0]
            });
            connection.release();
        });
    });
});
// 사용자의 개인정보를 수정한다
router.put('/', function (req, res, next) {
      var body = req.body;
      // 특정 사용자의 개인정보 수정
      var queryStr = "UPDATE user SET Name=?, Birth=?, Tel=? WHERE _UID=?";
      pool.getConnection(function(err, connection) {
          connection.query(queryStr, [body.Name, body.Birth, body.Tel, req.session._UID], function(err, rows) {
              if(err) console.log("err: ", err);
              req.session.Name = body.Name;
              res.redirect("/user/mypage");
              connection.release();
          });
      });
});

module.exports = router;
