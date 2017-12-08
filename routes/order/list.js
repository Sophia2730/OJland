var express = require('express');
var router = express.Router();
var pool = require('../../config.js').pool;
var moment = require('moment');
var async = require('async');

router.get('/:category', function(req, res, next) {
    var category = trans(req.params.category);

    pool.getConnection(function(err, connection) {
          async.waterfall([
              function(callback) {
                // 파라미터가 전체인지 여부에 따라서 쿼리문 결정
                queryStr = (category == '전체') ? 'SELECT * FROM orders' : 'SELECT * FROM orders WHERE Category=?';
                connection.query(queryStr, category, function(err, orders) {
                    if(err) callback(err);
                    var dates = []; // 발주 날짜를 저장할 배열
                    for (var i = 0; i < orders.length; i++) { // 발주 날짜의 형식 변환
                        dates[i] = moment(orders[i].Time).format('YYYY/MM/DD');
                    }
                    callback(null, orders, dates);
                });
              },
              function(orders, dates, callback) {
                  connection.query("SELECT * FROM application WHERE Status<>'F'", function(err, apps) {
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
              res.render('order/list', {  // 발주 목록 페이지 렌딩
                  category: category,
                  data: results[0], // orders Table 정보
                  date: results[1],  // 발주 날짜
                  reqNum: results[2],  // 지원 요청자
                  session: req.session  // 접속자 정보
              });
              connection.release();
          });
    });
});

// 카테고리 값 한글로 변환
var trans = function(str) {
  switch (str) {
      case 'all': return category = '전체';
      case 'plan': return category = '기획';
      case 'development': return category = '개발';
      case 'design': return category = '디자인';
      case 'translation': return category = '번역';
      case 'sound': return category = '사운드';
      case 'video': return category = '영상';
      case 'etc': return category = '기타';
      default: return null;
  }
}
module.exports = router;
