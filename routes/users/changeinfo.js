var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;

router.get('/', function(req, res, next) {
    var queryStr = "SELECT * FROM user WHERE _UID=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, req.session._UID, function(err, rows) {
            if(err) {
                console.log("err: ", err);
            }
            res.render('user/changeinfo', {
                name: req.session.Name,
                data: rows[0]
            });
            connection.release();
        });
    });
});

router.put('/', function (req, res, next) {
      var body = req.body;
      var queryStr = "UPDATE user SET Name=?, Birth=?, Tel=? WHERE _UID=?";
      pool.getConnection(function(err, connection) {
          connection.query(queryStr, [body.Name, body.Birth, body.Tel, req.session._UID], function(err, rows) {
              if(err) {
                  console.log("err: ", err);
              }
              req.session.Name = body.Name;
              res.redirect("/mypage");
              connection.release();
          });
      });
});

module.exports = router;
