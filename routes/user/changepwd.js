var express = require('express');
var router = express.Router();
var moment = require('moment');
var pool = require('../../config.js').pool;
var encrypt = require('../../config.js').encrypt;
var decrypt = require('../../config.js').decrypt;
var async = require('async');

router.get('/', function(req, res, next) {
    res.render('user/changepwd', {
        session: req.session
    });
});

router.post('/', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query("SELECT Password FROM user WHERE _UID=?", req.session._UID, function(err, rows) {
            if(err) console.log(err);
            res.send(decrypt(rows[0].Password));
            connection.release();
        });
    });
});

router.put('/', function (req, res, next) {
    var body = req.body;
    pool.getConnection(function(err, connection) {
        var queryUpdate = "UPDATE user SET Password=? WHERE _UID=?";
        connection.query(queryUpdate, [encrypt(body.pwd1), req.session._UID], function (err) {
            if(err) console.log(err);
            connection.release();
        });
    });
});

module.exports = router;
