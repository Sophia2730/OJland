var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  pool.getConnection(function(err, connection) {
      connection.query('SELECT * FROM user', function(err, users) {
          if(err) console.log("err: ", err);
          pool.getConnection(function(err, connection) {
              connection.query('SELECT * FROM orders', function(err, rows) {
                  if(err) console.log("err: ", err);
                  var dates = [];
                  var names = [];
                  for (var i = 0; i < rows.length; i++) {
                      dates[i] = moment(rows[i].Time).format('YYYY/MM/DD');
                      // 발주의 _UID를 통해 발주자의 이름을 불러온다
                      for (var j = 0; j < users.length; j++) {
                          if (users[j]._UID == rows[i]._UID) {
                              names[i] = users[j].Name;
                          }
                      }
                  }
                  res.render('post', {
                      data: rows,
                      reqNum: '0',
                      date: dates,
                      name: names
                  });
                  connection.release();
              });
          });
          connection.release();
      });
  });
});

module.exports = router;