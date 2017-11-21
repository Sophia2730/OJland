var mysql = require('mysql');

exports.connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    prot: 3306,
    database: 'ojland'
});

exports.pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: 'root',
    prot: 3306,
    database: 'ojland'
});
