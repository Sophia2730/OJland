var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var transporter = require('../../config.js').transporter;

var users;
router.get('/', function(req, res, next) {
    var queryStr = 'SELECT * FROM user';
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, function(err, rows) {
            if(err) console.log("err: ", err);
            users = rows;
            res.render('user/forgot');
            connection.release();
        });
    });
});

router.post('/id', function(req, res, next) {
    var body = req.body;
    var emails = '';
    var check = false;
    for(var i = 0; i < users.length; i++) {
          if (body.IName == users[i].Name && body.IBirth == users[i].Birth && body.ITel == users[i].Tel) {
              emails += "'" + users[i].Email + "' ";
              check = true;
          }
    }
    if (check) {
          res.send('<script>alert("찾으시는 이메일은 ' + emails + ' 입니다.");' +
          'window.location.replace("/forgot");</script>');
          return;
    }
    res.send('<script>alert("일치하는 정보가없습니다.");' + 'window.location.replace("/forgot");</script>');
});

router.post('/pwd', function(req, res, next) {
    var body = req.body;
    for(var i = 0; i < users.length; i++) {
        if (body.PName == users[i].Name && body.PEmail == users[i].Email && body.PTel == users[i].Tel) {
            var mailOptions = {
                from: '외주랜드 <ojland17@gmail.com>',
                to: users[i].Email,
                subject: '[외주랜드]비밀번호 정보',
                html: '<h1>비밀번호</h1><br><p>"' + decrypt(users[i].Password) + '" 입니다.</p>'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
            res.send('<script>alert("등록된 이메일 주소로 비밀번호가 전송되었습니다!");' +
                    'window.location.replace("/login");</script>');
            return;
        }
    }
    res.send('<script>alert("일치하는 정보가 없습니다!");' +
            'window.location.replace("/forgot");</script>');
});

module.exports = router;
