var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var async = require('async');
var moment = require('moment');

router.get('/:id', function(req, res, next) {
  var body = req.body;
  console.log('Uid: '+ req.params.id);

  pool.getConnection(function(err, connection) {
      queryStr = "SELECT * FROM progress WHERE _PID=?";
      connection.query(queryStr, req.params.id , function (err, rows) {
          if(err) console.log("err: ", err);
          console.log(rows);

          dates[0] = moment(rows[0].Time).format('YYYY/MM/DD');

          res.send({
              apps: rows,
              date: dates,
              session: req.session
          });
          connection.release();
      });
  });




});


module.exports = router;
