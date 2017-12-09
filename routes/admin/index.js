var express = require('express');
var router = express.Router();

router.get('*', function(req, res, next) {
    if(!req.session.Name)
        res.redirect('/');
    else
        next();
});
router.use('/changepwd', require('./changepwd'));
router.use('/members', require('./members'));
router.use('/orders', require('./orders'));
router.use('/statistics', require('./statistics'));

module.exports = router;
