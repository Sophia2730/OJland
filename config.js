var mysql = require('mysql');

exports.pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: 'root',
    prot: 3306,
    database: 'ojland'
});
