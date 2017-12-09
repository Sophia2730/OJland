var express = require('express');
var router = express.Router();

router.get('*', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');  // 메인화면으로 이동
    else
        next();
});
router.use('/close', require('./close'));
router.use('/match', require('./match'));
router.use('/info', require('./info'));
router.use('/request', require('./request'));

module.exports = router;
