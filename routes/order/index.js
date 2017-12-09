var express = require('express');
var router = express.Router();

router.get('*', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});
router.use('/list', require('./list'));
router.use('/info', require('./info'));
router.use('/post', require('./post'));
router.use('/put', require('./put'));

module.exports = router;
