var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');
var async = require('async');

var category; //카테고리를 저장할 변수
router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    pool.getConnection(function(err, connection) {
          async.waterfall([
              function(callback) {
                connection.query('SELECT * FROM orders WHERE Category=?', category, function(err, orders) {
                    if(err) callback(err);
                    var dates = []; // 발주 날짜를 저장할 배열
                    for (var i = 0; i < orders.length; i++) { // 발주 날짜의 형식 변환
                        dates[i] = moment(orders[i].Time).format('YYYY/MM/DD');
                    }
                    callback(null, orders, dates);
                });
              },
              function(orders, dates, callback) {
                  connection.query('SELECT * FROM application', function(err, apps) {
                      var reqNums = [];
                      for (var i = 0; i < orders.length; i++) {
                          reqNums[i] = 0;
                          for (var j = 0; j < apps.length; j++) {
                              if (orders[i]._OID == apps[j]._OID)
                                  reqNums[i]++;
                          }
                      }
                      callback(null, [orders, dates, reqNums]);
                  });
              }
          ], function(err, results) {
              if(err) console.log(err);
              res.render('order/order-category', {  // 발주 목록 페이지 렌딩
                  category: category, // 카테고리
                  data: results[0], // orders Table 정보
                  date: results[1],  // 발주 날짜
                  reqNum: results[2],  // 지원 요청자
                  session: req.session  // 접속자 정보
              });
              connection.release();
          });
    });
});

router.get('/:id', function(req, res, next) {
    switch (req.params.id) {
        case 'plan':
            category = '기획';
            break;
        case 'development':
            category = '개발';
            break;
        case 'design':
            category = '디자인';
            break;
        case 'translation':
            category = '번역';
            break;
        case 'sound':
            category = '사운드';
            break;
        case 'video':
            category = '영상';
            break;
        case 'etc':
            category = '기타';
            break;
    }
    res.redirect('/category');
});

module.exports = router;
