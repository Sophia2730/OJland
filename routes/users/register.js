var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var encrypt = require('../../config.js').encrypt;
var transporter = require('../../config.js').transporter;
var async = require('async');

router.get('/', function(req, res, next) {
      res.render('user/register');
});

router.get('/:email', function(req, res, next) {
      pool.getConnection(function(err, connection) {
          connection.query('SELECT * FROM user WHERE Email=?', req.params.email, function(err, rows) {
              if(err) console.log(err);
              var exist = (rows[0]) ? true : false;
              res.send(exist);
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

router.post('/', function(req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        async.series([
            function(callback) {
                connection.query('SELECT Email FROM user WHERE Email=?', body.Email, function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0]);
                });
            },
            function(callback) {
                connection.query('SELECT _UID FROM user ORDER BY _UID DESC limit 1', function(err, rows) {
                    if(err) callback(err);
                    callback(null, rows[0]);
                });
            }
        ], function(err, results) {
            console.log(results);
            if (results[0]) { // 이미 존재하는 이메일이면
                res.redirect('/register/exist');
                return;
            }

            var newId = (!results[1]) ? 2017000001 : Number(results[1]._UID) + 1;
            var inputs = [newId, body.Email, encrypt(body.Password), body.Name, body.Birth, body.Tel, body.UserType];
            queryStr = 'INSERT INTO user(_UID, Email, Password, Name, Birth, Tel, UserType) VALUES(?,?,?,?,?,?,?);';
            connection.query(queryStr, inputs, function(err, rows) {
                if(err) console.log("err: ", err);
                var mailOptions = {
                    from: '외주랜드 <ojland17@gmail.com>',
                    to: body.Email,
                    subject: '[외주랜드]인증 메일',
                    html: '<h1>아래의 인증을 클릭해 주세요.</h1><br><a style="font-size:2em;" href="http://' + req.get('host')
                    + '/confirm/' + encrypt(newId.toString()) + '">인증</a>'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) return console.log(error);
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });
                res.redirect('/register/success');
                connection.release();
            });
        });
    });
});

module.exports = router;
