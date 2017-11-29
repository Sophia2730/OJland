var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var encrypt = require('../../config.js').encrypt;
var transporter = require('../../config.js').transporter;

router.get('/', function(req, res, next) {
      res.render('user/register');
      connection.release();
});

router.post('/', function(req, res, next) {
    var body = req.body;
    var newPwd = encrypt(body.Password);

    pool.getConnection(function(err, connection) {
        var queryStr = 'SELECT * FROM user';
        connection.query(queryStr, function(err, users) {
            if(err) console.log("err: ", err);
            var newId = (users[0] == null) ? 2017000001 : Number(users[users.length-1]._UID) + 1;
            for(var i = 0; i < users.length; i++) {
                if (body.Email == users[i].Email) {
                    res.redirect('/register/exist');
                    return;
                }
            }
            var inputs = [newId, body.Email, newPwd, body.Name, body.Birth, body.Tel, body.UserType];
            queryStr = 'INSERT INTO user(_UID, Email, Password, Name, Birth, Tel, UserType) '
                          + 'VALUES(?,?,?,?,?,?,?);';
            connection.query(queryStr, inputs, function(err, rows) {
                if(err) {
                    console.log("err: ", err);
                    res.send('<script>alert("가입실패! 인터넷 상태를 확인해주세요!");' +
                            'window.location.replace("/register");</script>');
                }
                else {
                    var mailOptions = {
                        from: '외주랜드 <ojland17@gmail.com>',
                        to: body.Email,
                        subject: '[외주랜드]인증 메일',
                        html: '<h1>아래의 인증을 클릭해 주세요.</h1><br><a style="font-size:2em;" href="' + req.get('host')
                        + '/confirm/' + encrypt(newId.toString()) + '">인증</a>'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) return console.log(error);
                        console.log('Message %s sent: %s', info.messageId, info.response);
                    });
                    res.redirect('/register/success');
                }
                connection.release();
            });
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
