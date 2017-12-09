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

router.post('/id', function(req, res, next) {
    var body = req.body;
    var emails = '';

    pool.getConnection(function(err, connection) {
        queryStr = 'SELECT * FROM user WHERE NAME=? AND Birth=? AND TEL=?';
        connection.query(queryStr, [body.IName, body.IBirth, body.ITel], function(err, rows) {
            if(err) console.log(err);
            if(rows[0]) {
                for (var i = 0; i < rows.length; i++) {
                      if (body.IName == rows[i].Name && body.IBirth == rows[i].Birth && body.ITel == rows[i].Tel)
                          emails += "'" + rows[i].Email + "' ";
                }
                if (emails)
                    res.send('<script>alert("찾으시는 이메일은 ' + emails + ' 입니다.");'
                          + 'location.replace("/user/forgot");</script>');
                else
                    res.send('<script>alert("일치하는 정보가없습니다.");'
                          + 'location.replace("/user/forgot");</script>');
            } else {
                res.send('<script>alert("일치하는 정보가없습니다.");'
                          + 'location.replace("/user/forgot");</script>');
            }
        });
    });
});

router.post('/pwd', function(req, res, next) {
    var body = req.body;

    pool.getConnection(function(err, connection) {
        queryStr = 'SELECT * FROM user WHERE Email=?';
        connection.query(queryStr, body.PEmail, function(err, rows) {
            if(err) console.log(err);
              if(rows[0]) {
                if (body.PName == rows[0].Name && body.PEmail == rows[0].Email && body.PTel == rows[0].Tel) {
                    var mailOptions = {
                        from: '외주랜드 <ojland17@gmail.com>',
                        to: rows[0].Email,
                        subject: '[외주랜드]비밀번호 정보',
                        html: '<h1>비밀번호</h1><br><p><' + decrypt(rows[0].Password) + '> 입니다.</p>'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) return console.log(error);
                        console.log('Message %s sent: %s', info.messageId, info.response);
                    });
                    res.send('<script>alert("등록된 이메일 주소로 비밀번호가 전송되었습니다!");' +
                            'location.replace("/user/login");</script>');
                } else {
                    res.send('<script>alert("일치하는 정보가 없습니다!");' +
                          'location.replace("/user/forgot");</script>');
                }
              } else {
                  res.send('<script>alert("찾으시는 이메일은 없는 이메일입니다!");' +
                        'location.replace("/user/forgot");</script>');
              }
        });
    });

});

module.exports = router;
