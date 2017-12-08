var express = require('express');
var post = require('./post');
var list = require('./list');
var info = require('./info');
var router = express.Router();

router.use('/post', post);
router.use('/list', list);
router.use('/info', info);

module.exports = router;
