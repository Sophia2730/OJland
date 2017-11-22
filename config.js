var mysql = require('mysql');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// mysql pool
exports.pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: 'root',
    prot: 3306,
    database: 'ojland'
});

// crypto 암호화 - 복호화
key = 'veryimportantkey';
exports.encrypt = function (text) {
    console.log('key :', key);
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var encipheredContent = cipher.update(text, 'utf8', 'hex');
    encipheredContent += cipher.final('hex');

    return encipheredContent;
}
exports.decrypt = function (text) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decipheredPlaintext = decipher.update(text,'hex','utf8');
    decipheredPlaintext += decipher.final('utf8');

    return decipheredPlaintext;
}

exports.transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
          user: 'ojland17@gmail.com',
          pass: 'dhlwnskfk'
        }
}));
exports.mailOptions = {
    from: '외주랜드 <ojland17@gmail.com>',
    to: 'stafor@naver.com',
    subject: '[외주랜드]인증 메일',
    text: '링크를 클릭해 주세요. http://localhost:8081/confirm'
};
// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message %s sent: %s', info.messageId, info.response);
// });
