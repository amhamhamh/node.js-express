var express = require('express');  //미들웨어를  씀으로서 코드의 전체적인 양을 줄였음. 미들웨어는 실행의 순서가 중요하다. 
var app = express();               // 또한 pug를 통한 간단한 코드를 작성하여 express를 제어할 수 있음.
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require("helmet");

 
var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
 
app.use(helmet());                  // 보안을 쓰는 코드 
app.use(express.static('public'));  // 정적이미지 알려주는 코드
app.use(bodyParser.urlencoded({ extended: false }));  //body 전체를 분석해줘서 담아주는 코드
app.use(compression());                               //압축해주는 코드
app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;                          // reques.list를 filelist에 담음
    next();
  });
});
 
app.use('/', indexRouter);                          //path일 떄,indexrouter(첫페이지 화면)
app.use('/topic', topicRouter);                     // path가 topic일 때, topicrouter
 
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
 
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});
 
app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});