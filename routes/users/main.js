var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('user/main', {
        name: req.session.Name
    });
});

module.exports = router;
