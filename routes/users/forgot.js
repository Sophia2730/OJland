var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var count = 1;

var users;
router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            users = rows;
                if(count == 1){
                  console.log(count);
                res.render('forgot', {mymsg : " "});
                count++;
                }
                else{
                  console.log(count);
                res.render('forgot');
                }
            connection.release();
        });
    });
});





router.post('/', function(req, res, next) {
  var body = req.body;


  for(var i = 0; i < users.length; i++) {
      if (body.Name == users[i].Name && body.Birth == users[i].Birth && body.Tel == users[i].Tel) {
          console.log('check ok!! : '+users[i].Email);
          var msg = users[i].Email;
          //res.send('<script type = "text/javascript">alert("DDD"); + window.location.replace("/forgot");</script>');
          res.render('forgot',{mymsg : users[i].Email})
          return;
      }  //else res.send('<script type = "text/javascript">alert("정보가 없습니다."); + window.location.replace("/forgot");</script>');
    }



});

module.exports = router;
