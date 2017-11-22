var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;
var fs = require('fs');

var admin;
fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
    admin = JSON.parse(data);
});

router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', function(req, res, next) {
    var body = req.body;

    // 관리자 로그인 처리
    if (body.Email == admin.id && body.Password == admin.password) {
        res.redirect('/admin');
        return;
    }

    var queryStr = "SELECT * FROM user WHERE Email=?";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, body.Email, function(err, rows) {
            if(err) console.log("err: ", err);
            else if (rows[0]) {
                if (body.Password == decrypt(rows[0].Password)) {
                  req.session.Name = rows[0].Name;
                  req.session._UID = rows[0]._UID;
                  req.session.UserType = rows[0].UserType;
                  res.redirect('/');
                }
            } else {
                res.redirect('/login');
            }
            connection.release();
        });
    });
});

module.exports = router;
