var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var transporter = require('../../config.js').transporter;

router.get('/', function(req, res, next) {
    res.render('user/forgot', {
        session: req.session
    });
});

router.post('/check', function(req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        if(body.Birth) {
            queryStr = 'SELECT * FROM user WHERE NAME=? AND Birth=? AND TEL=?';
            connection.query(queryStr, [body.Name, body.Birth, body.Tel], function(err, rows) {
                if(err) console.log(err);
                else if (rows[0])
                    res.send(rows[0]);
                else
                    res.send(false);
                connection.release();
            });
        } else if (body.Email) {
            connection.query(queryStr, [body.Name, body.Tel], function(err, rows) {
                if(err) console.log(err);
                res.send(rows);
                connection.release();
            });
        }
    });
});

router.post('/id', function(req, res, next) {
    var body = req.body;

    var emails = '';
    for (var i = 0; i < users.length; i++) {
          if (body.IName == users[i].Name && body.IBirth == users[i].Birth && body.ITel == users[i].Tel)
              emails += "'" + users[i].Email + "' ";
    }

    if (emails)
        res.send('<script>alert("찾으시는 이메일은 ' + emails + ' 입니다.");window.location.replace("/user/forgot");</script>');
    else
        res.send('<script>alert("일치하는 정보가없습니다.");' + 'window.location.replace("/user/forgot");</script>');
});

router.post('/pwd', function(req, res, next) {
    var body = req.body;

    for (var i = 0; i < users.length; i++) {
        if (body.PName == users[i].Name && body.PEmail == users[i].Email && body.PTel == users[i].Tel) {
            var mailOptions = {
                from: '외주랜드 <ojland17@gmail.com>',
                to: users[i].Email,
                subject: '[외주랜드]비밀번호 정보',
                html: '<h1>비밀번호</h1><br><p>"' + decrypt(users[i].Password) + '" 입니다.</p>'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) return console.log(error);
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
            res.send('<script>alert("등록된 이메일 주소로 비밀번호가 전송되었습니다!");' +
                    'window.location.replace("/user/login");</script>');
            return;
        }
    }
    res.send('<script>alert("일치하는 정보가 없습니다!");' +
            'window.location.replace("/user/forgot");</script>');
});

module.exports = router;
