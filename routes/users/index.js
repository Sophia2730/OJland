var express = require('express');
var router = express.Router();
var fs = require('fs');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var admin;
var app = express();
var session = require('express-session');

app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: '#@!qlalfzl!@#',
  resave: false,
  saveUninitialized: true
}))



var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3306,
    database: 'ojland'
});


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
    console.log(req.session.name);
});

module.exports = router;
