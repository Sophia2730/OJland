var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
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

    var queryStr = "SELECT * FROM user WHERE Email=? AND Password=?;";
    pool.getConnection(function(err, connection) {
        connection.query(queryStr, [body.Email, body.Password], function(err, rows) {
            console.log('data is : ',rows);
            if(err) console.log("err: ", err);
            else if (rows[0]) {
                console.log('rows exist');
                req.session.Name = rows[0].Name;
                req.session.UserType = rows[0].UserType;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
            connection.release();
        });
    });
});

module.exports = router;
