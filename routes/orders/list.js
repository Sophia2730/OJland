var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');
var async = require('async');

router.get('/', function(req, res, next) {
    if (!req.session.Name) {  // 로그인 여부 체크
        res.redirect('/');  // 세션이 없으면 메인 페이지로 이동
        return;
    }
    pool.getConnection(function(err, connection) {
          async.waterfall([
              function(callback) {
                  connection.query('SELECT * FROM orders', function(err, orders) {
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
                      if(err) callback(err);
                      var reqNums = []; // 지원자 수를 저장할 배열
                      for (var i = 0; i < orders.length; i++) {
                          reqNums[i] = 0; // 초기화
                          for (var j = 0; j < apps.length; j++) {
                              if (orders[i]._OID == apps[j]._OID)
                                  reqNums[i]++;
                          }
                      }
                      callback(null, [orders, dates, reqNums]);
                  });
              }
          ], function(err, results) {
                if(err) console.log('err: ', err);

                res.render('order/order-list', {  // 발주 목록 페이지 렌딩
                    category: '전체', // 카테고리
                    data: results[0], // orders Table 정보
                    date: results[1],  // 발주 날짜
                    reqNum: results[2],  // 지원 요청자
                    session: req.session  // 접속자 정보
                });
                connection.release();
          });
    });
});
module.exports = router;
