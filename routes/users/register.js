var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));




var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3306,
    database: 'ojland'
});







router.get('/', function(req, res, next) {
    res.render('register');
    connection.query('SELECT * FROM user', function(err, result){
        console.log(result);
    });
});

router.post('/', function(req, res, next) {

if(req.body.Password == req.body.Password2){


    //_UID 자동생성만들어야해 자동생성안됌!!!!
    console.log('ddd');
    var post = ['20170002',req.body.Email,req.body.Password,req.body.Name,'12345678',req.body.Tel,'0',req.body.inlineRadioOptions];
    var query = connection.query('INSERT INTO user(_UID, ID, Password, Name,Birth, Tel, Status, UserType) VALUES(?,?,?,?,?,?,?,?)', post, function(err, result){
       //console.query(result);
       console.log(err);
    });

    res.end();
}else{
  //register-Failed 만들자. 정보다시 넘겨주기 생각중.
};

});

router.get('/success', function(req, res, next) {
    res.render('register-success');
});

module.exports = router;
