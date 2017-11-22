var express = require('express');
var router = express.Router();
var encrypt = require('../../config.js').encrypt;
var pool = require('../../config.js').pool;
var transporter = require('../../config.js').transporter;

var users;
router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            users = rows;
            res.render('register');
            connection.release();
        });
    });
});

router.post('/', function(req, res, next) {
  var body = req.body;
  var queryStr = 'INSERT INTO user(_UID, Email, Password, Name, Birth, Tel, UserType) '
                + 'VALUES(?,?,?,?,?,?,?);';

  var newID = Number(users[users.length-1]._UID) + 1;
  var newPwd = encrypt(body.Password);
  var inputs = [newID, body.Email, newPwd, body.Name, body.Birth, body.Tel, body.UserType];
  for(var i = 0; i < users.length; i++) {
      if (body.Email == users[i].Email) {
          // res.send('<script>alert("이미 존재하는 이메일 입니다!");</script>');
          res.redirect('/register');
      }
  }
  pool.getConnection(function(err, connection) {
      connection.query(queryStr, inputs, function(err, rows) {
          if(err) console.log("err: ", err);
          var mailOptions = {
              from: '외주랜드 <ojland17@gmail.com>',
              to: body.Email,
              subject: '[외주랜드]인증 메일',
              html: '<h1>아래의 인증을 클릭해 주세요.</h1><br><button style="font-size:2em;" href="http://localhost:8081/confirm/' +
                  encrypt(newID.toString()) + '">인증</a>'
          };
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });
          res.redirect('/login');
          connection.release();
      });
  });
});

module.exports = router;
