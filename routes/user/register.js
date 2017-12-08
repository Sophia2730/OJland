var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var encrypt = require('../../config.js').encrypt;
var transporter = require('../../config.js').transporter;
var async = require('async');

router.get('/', function(req, res, next) {
      res.render('user/register', {
          session: req.session
      });
});

router.get('/check/:email', function(req, res, next) {
      pool.getConnection(function(err, connection) {
          connection.query('SELECT * FROM user WHERE Email=?', req.params.email, function(err, rows) {
              if(err) console.log(err);
              var exist = (rows[0]) ? true : false;
              res.send(exist);
              connection.release();
          });
      });
});

router.post('/', function(req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                connection.query('SELECT _UID FROM user ORDER BY _UID DESC limit 1', function(err, rows) {
                    if(err) callback(err);
                    var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._UID) + 1;
                    callback(null, newId);
                });
            }
        ], function(err, results) {
            var inputs = [results[0], body.Email, encrypt(body.Password), body.Name, body.Birth, body.Tel, body.UserType];
            queryStr = 'INSERT INTO user(_UID, Email, Password, Name, Birth, Tel, UserType) VALUES(?,?,?,?,?,?,?);';
            connection.query(queryStr, inputs, function(err, rows) {
                if(err) console.log("err: ", err);
                var mailOptions = {
                    from: '외주랜드 <ojland17@gmail.com>',
                    to: body.Email,
                    subject: '[외주랜드]인증 메일',
                    html: '<h1>아래의 인증을 클릭해 주세요.</h1><br><a style="font-size:2em;" href="http://' + req.get('host')
                    + '/user/confirm/' + encrypt(results[0].toString()) + '">인증</a>'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) return console.log(error);
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });

                sendMsg(results[0], body.Name);
                res.send('<script>alert("가입성공! 가입하신 이메일을 확인해주세요.");' +
                        'location.href = "/user/login";</script>');
                connection.release();
            });
        });
    });
});

var sendMsg = function(uid, name) {
  pool.getConnection(function(err, connection) {
      async.series([
          function(callback) {
              connection.query("SELECT _NID FROM notice ORDER BY _NID DESC limit 1", function(err, rows) {
                  if(err) callback(err);
                  var newId = (!rows[0]) ? 1000000001 : Number(rows[0]._NID) + 1;
                  callback(null, newId);
              });
          }
      ], function(err, results) {
          if(err) console.log(err);
          var mTitle = "회원 가입 완료";
          var mContent = "[" + name + "]님, 회원가입을 축하드립니다!";
          queryStr = "INSERT INTO notice(_NID,_UID,Title,Content) VALUES(?,?,?,?)";
          inputs = [results[0], uid, mTitle, mContent];
          connection.query(queryStr, inputs, function(err) {
              if(err) {
                  console.log(err);
                  sendMsg(uid, name);
              }
              connection.release();
          });
      });
  });
}
module.exports = router;
