var express = require('express')
var app = express()
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser'); // app.get(pathname, function(request,response){}); - body값을 전체적으로 분석할 때
var sanitizeHtml = require('sanitize-html');
var template = require('./lib/template.js');
var compression = require('compression');  //파일을 전송할 때 압축해주는 모듈(미드웨어)
const e = require('express');
                                                  
app.use(express.static('public'));                    // 정적 이미지 처리
app.use(bodyParser.urlencoded({ extended: false }));  // form 방식으로 body 값을 전체적으로 분석할 때 
app.use(compression());
app.get('*', function(request, response, next){     // get 방식으로 오는 것만 나의 미들웨어를 적용 받음
  fs.readdir('./data', function (error, filelist) {
    request.list = filelist;
    next();
  });    
});


//route, routing
//app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function (request, response) { 
    var title = 'Welcome';  
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      `,
      `<a href="/create">create</a>`
    );
    response.send(html);
 
});

app.get('/page/:pageId', function (request, response, next) {     
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
      if(err){
        next(err);                                              //조건문 형태로 error일 경우 예외처리 error 던지면. 140번줄로 이동        
      }else{
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags: ['h1']
        });
        var list = template.list(request.list);
        var html = template.HTML(sanitizedTitle, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/create">create</a>
            <a href="/update/${sanitizedTitle}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
            );
      } 
      response.send(html);
    });  
});

app.get('/create', function (request, response) { 
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.send(html);  
});

app.post('/create_process', function (request, response) {
  var post = request.body;   //여기가 parse body 값
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
    response.redirect(`/?id=${title}`)
  })
});

app.get('/update/:pageId', function (request, response) { 
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
      var title = request.params.pageId;
      var list = template.list(request.list);
      var html = template.HTML(title, list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update/${title}">update</a>`
      );
      response.send(html);
    });  
});

app.post('/update_process', function (request, response) {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      response.redirect(`/?id=${title}`)
    })
  });
});


app.post('/delete_process', function (request, response) {
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    response.redirect('/')
  })
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {            // 140번줄로 이동하면서 err가 포함된 함수로 이동하면서
  console.error(err.stack)
  res.status(500).send('Something broke!')          //이거를 실행함.
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
//app.listen(3000, () => console.log('Example app listening on port 3000!'))

/*
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      } else {
         }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          })
      });
    } else if(pathname === '/update'){

      });
    } else if(pathname === '/update_process'){

    } else if(pathname === '/delete_process'){

    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
*/
