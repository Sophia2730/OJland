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









fs.readFile('public/data/admin.json', 'utf-8', function(err, data) {
    admin = JSON.parse(data);
});

router.use(function(req,res,next){
 next();
});

router.get('/', function(req, res, next) {
    res.render('login');


  /*  connection.query('SELECT ID,Password FROM user WHERE ID ='+ req.body.Email+' && Password =='+req.body.password, function(err, result){
        console.log(result[0].ID);
        console.log(err);
    }); */


});

router.post('/', function(req, res, next) {
    var checkId;
    var checkPw;
    const sess = req.session;

    connection.query('SELECT Name FROM user WHERE ID = ? AND Password = ?',[req.body.Email, req.body.Password], function(err, result){
          console.log(result);
          console.log(err);
          req.session.name = result;
          res.redirect('/');
      });


    if (req.body.Email == admin.id && req.body.Password == admin.password) {
        res.redirect('/admin');
    }
});

module.exports = router;
