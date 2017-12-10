var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var decrypt = require('../../config.js').decrypt;

// 가입대기 상태의 사용자를 가입승인 처리한다
router.get('/:id', function(req, res) {
    pool.getConnection(function(err, connection) {
        // 특정 사용자의 상태를 가입승인 상태로 변경
        var queryStr = "UPDATE user SET Status='1' WHERE _UID=?";
        connection.query(queryStr, decrypt(req.params.id), function(err) {
            if(err) console.log("err: ", err);
            res.send('<script>alert("인증이 완료되었습니다!");' +
                    'window.location.replace("/user/login");</script>');
            connection.release();
        });
    });
});

module.exports = router;
