var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var async = require('async');

router.get('/', function(req, res, next) {
    if (!req.session.Name) {
        res.redirect('/');
        return;
    }
    pool.getConnection(function(err, connection) {
        connection.query("SELECT * FROM user WHERE _UID=?", req.session._UID, function(err, rows) {
            if(err)
                console.log("err: ", err);
            res.render('user/changeinfo', {
                session: req.session,
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
              if(err) console.log("err: ", err);
              req.session.Name = body.Name;
              res.redirect("/mypage");
              connection.release();
          });
      });
});

module.exports = router;
