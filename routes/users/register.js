var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var encrypt = require('../../config.js').encrypt;
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
          res.redirect('/register/exist');
          return;
      }
  }
  pool.getConnection(function(err, connection) {
      connection.query(queryStr, inputs, function(err, rows) {
          if(err) console.log("err: ", err);
          var mailOptions = {
              from: '외주랜드 <ojland17@gmail.com>',
              to: body.Email,
              subject: '[외주랜드]인증 메일',
              html: '<h1>아래의 인증을 클릭해 주세요.</h1><br><a style="font-size:2em;" href="http://localhost:8081/confirm/' +
                  encrypt(newID.toString()) + '">인증</a>'
          };
          transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });
          res.redirect('/register/success');
          connection.release();
      });
  });
});

router.get('/success', function(req, res, next) {
    res.send('<script>alert("가입성공! 가입하신 이메일을 확인해주세요.");' +
            'window.location.replace("/login");</script>');
});

router.get('/exist', function(req, res, next) {
    res.send('<script>alert("이미 존재하는 이메일입니다.");' +
            'window.location.replace("/register");</script>');
});

module.exports = router;
